-- ============================================================
-- back-in-a-day: Supabase Schema
-- Supabase Dashboard > SQL Editor で実行してください
-- ============================================================

-- journals テーブル
create table if not exists public.journals (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  date        date not null,                    -- YYYY-MM-DD
  text        text not null,                    -- メインのジャーナルテキスト（タイトル）
  summary     text,                             -- 詳細な要約
  today_tasks jsonb default '[]'::jsonb,        -- 今日やったことリスト (string[])
  tomorrow_tasks jsonb default '[]'::jsonb,     -- 明日やることリスト (string[])
  mood_color  text default '#BDBDBD',           -- 気分に合わせた色
  messages    jsonb default '[]'::jsonb,        -- 会話履歴全体
  listener_id text not null,                   -- 'rex' | 'maple' | 'cove'
  listener_name text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  -- 1ユーザーが同じ日に複数エントリを持てないようにする
  unique (user_id, date)
);

-- RLS (Row Level Security) を有効化
alter table public.journals enable row level security;

-- ポリシー: 自分のデータのみ参照・操作可能
create policy "Users can view their own journals"
  on public.journals for select
  using (auth.uid() = user_id);

create policy "Users can insert their own journals"
  on public.journals for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own journals"
  on public.journals for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own journals"
  on public.journals for delete
  using (auth.uid() = user_id);

-- updated_at を自動更新するトリガー
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger journals_updated_at
  before update on public.journals
  for each row execute procedure public.handle_updated_at();

-- インデックス (パフォーマンス最適化)
create index if not exists journals_user_id_idx on public.journals (user_id);
create index if not exists journals_date_idx on public.journals (user_id, date desc);
