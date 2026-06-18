-- I am not a robot — Supabase schema (任意・加点)
-- Supabase の SQL Editor で実行する。未接続でもアプリは LocalStorage で動作する。

create table if not exists game_results (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  human_score integer not null check (human_score >= 0 and human_score <= 100),
  ai_suspicion integer not null check (ai_suspicion >= 0 and ai_suspicion <= 100),
  rank text not null,
  approved boolean not null,
  human_type text not null,
  is_mock boolean default false,
  storage_note text default 'No photo/audio stored'
);

alter table game_results enable row level security;

-- 匿名スコア投稿アプリ。anon に insert/select を明示許可（RLS有効＋ポリシー無し＝全拒否を回避）
create policy "anon insert results" on game_results
  for insert to anon with check (true);

create policy "anon select results" on game_results
  for select to anon using (true);
