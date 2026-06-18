import type { VoiceMetrics } from "@/types/game";

const BASE_SPEECH_THRESHOLD = 6; // 発話とみなす最低音量(0-100)。環境ノイズで自動的に引き上げる
const SHOUT_THRESHOLD = 60; // これ以上のピークを「叫び」とみなす
const CALIB_FRAMES = 8; // 開始直後の数フレームで環境ノイズ(無音時の音量)を測る

export const EMPTY_METRICS: VoiceMetrics = {
  avgVolume: 0,
  peakVolume: 0,
  silenceRatio: 100,
  firstSpeechDelayMs: -1,
  volumeVariation: 0,
  shout: false,
  spoke: false,
};

/**
 * マイクのMediaStreamから簡易な音声特徴量を取得する。
 * 本格的な特徴量解析ではなく、ブラウザのWeb Audio APIで取れる範囲の
 * 音量・無音・話し始め遅延・揺れ・叫び判定をリアルタイムに集計する。
 */
export class VoiceMeter {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private buf: Uint8Array<ArrayBuffer> | null = null;
  private raf = 0;
  private volumes: number[] = [];
  private silentFrames = 0;
  private totalFrames = 0;
  private startedAt = 0;
  private firstSpeechAt = -1;
  private peak = 0;
  private live = 0;
  private calibSum = 0;
  private calibCount = 0;
  private speechThreshold = BASE_SPEECH_THRESHOLD;

  constructor(private stream: MediaStream) {}

  start() {
    try {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctx();
      this.source = this.ctx.createMediaStreamSource(this.stream);
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 1024;
      this.buf = new Uint8Array(new ArrayBuffer(this.analyser.fftSize));
      this.source.connect(this.analyser);
      // ユーザー操作後でもsuspendedのことがあるので明示的にresume
      if (this.ctx.state === "suspended") this.ctx.resume().catch(() => {});
      this.reset();
      this.tick();
    } catch {
      this.ctx = null;
    }
  }

  /** タスク切替時に集計をリセット */
  reset() {
    this.volumes = [];
    this.silentFrames = 0;
    this.totalFrames = 0;
    this.startedAt = performance.now();
    this.firstSpeechAt = -1;
    this.peak = 0;
    this.calibSum = 0;
    this.calibCount = 0;
    this.speechThreshold = BASE_SPEECH_THRESHOLD;
  }

  private tick = () => {
    if (!this.analyser || !this.buf) return;
    this.analyser.getByteTimeDomainData(this.buf);
    let sum = 0;
    for (let i = 0; i < this.buf.length; i++) {
      const v = (this.buf[i] - 128) / 128;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / this.buf.length);
    const vol = Math.min(100, rms * 240); // 0-100へスケール
    this.live = vol;

    // 開始直後の数フレームで環境ノイズを測り、しきい値を環境に合わせる
    if (this.calibCount < CALIB_FRAMES) {
      this.calibSum += vol;
      this.calibCount += 1;
      if (this.calibCount === CALIB_FRAMES) {
        const ambient = this.calibSum / CALIB_FRAMES;
        // 環境ノイズの1.8倍か基準値の高い方。常識的な範囲にclamp
        this.speechThreshold = Math.min(35, Math.max(BASE_SPEECH_THRESHOLD, ambient * 1.8));
      }
      this.raf = requestAnimationFrame(this.tick);
      return; // 較正中は集計に含めない
    }

    this.volumes.push(vol);
    this.totalFrames += 1;
    if (vol < this.speechThreshold) {
      this.silentFrames += 1;
    } else if (this.firstSpeechAt < 0) {
      this.firstSpeechAt = performance.now();
    }
    if (vol > this.peak) this.peak = vol;
    this.raf = requestAnimationFrame(this.tick);
  };

  /** ログ表示用の現在値 */
  liveState() {
    const silentRun = this.live < this.speechThreshold;
    return { volume: Math.round(this.live), speaking: !silentRun };
  }

  snapshot(): VoiceMetrics {
    if (this.totalFrames === 0) return { ...EMPTY_METRICS };
    const avg = this.volumes.reduce((a, b) => a + b, 0) / this.volumes.length;
    const variance =
      this.volumes.reduce((a, b) => a + (b - avg) ** 2, 0) / this.volumes.length;
    const std = Math.sqrt(variance);
    const spoke = this.firstSpeechAt > 0;
    return {
      avgVolume: Math.round(avg),
      peakVolume: Math.round(this.peak),
      silenceRatio: Math.round((this.silentFrames / this.totalFrames) * 100),
      firstSpeechDelayMs: spoke ? Math.round(this.firstSpeechAt - this.startedAt) : -1,
      volumeVariation: Math.min(100, Math.round(std * 2.2)),
      shout: this.peak >= SHOUT_THRESHOLD,
      spoke,
    };
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    try {
      this.source?.disconnect();
      this.analyser?.disconnect();
      this.ctx?.close();
    } catch {
      /* noop */
    }
    this.ctx = null;
  }
}

/** 複数タスクのメトリクスを1つに集約（声を出したタスクを優先） */
export function mergeMetrics(list: VoiceMetrics[]): VoiceMetrics {
  const spoken = list.filter((m) => m.spoke);
  const use = spoken.length ? spoken : list;
  if (!use.length) return { ...EMPTY_METRICS };
  const avg = (sel: (m: VoiceMetrics) => number) =>
    Math.round(use.reduce((a, m) => a + sel(m), 0) / use.length);
  const validDelays = use.map((m) => m.firstSpeechDelayMs).filter((d) => d >= 0);
  return {
    avgVolume: avg((m) => m.avgVolume),
    peakVolume: Math.max(...use.map((m) => m.peakVolume)),
    silenceRatio: avg((m) => m.silenceRatio),
    firstSpeechDelayMs: validDelays.length
      ? Math.round(validDelays.reduce((a, b) => a + b, 0) / validDelays.length)
      : -1,
    volumeVariation: avg((m) => m.volumeVariation),
    shout: use.some((m) => m.shout),
    spoke: spoken.length > 0,
  };
}
