# Splits Network Chat — Postgres Reference Schema (DDL)

This schema is a **reference implementation** that satisfies the full-feature chat spec:
- Requests, mute, archive, block, report
- Idempotent send
- Read receipts persisted
- Attachments metadata
- Cross-app (splits.network + applicant.network)

> Presence/typing are ephemeral and should live in Redis. Read receipts should persist in Postgres.

---

## 1) Extensions
```sql
create extension if not exists pgcrypto;
```

---

## 2) Core Tables

### 2.1 conversations
```sql
create table if not exists public.chat_conversations (
  id uuid primary key default gen_random_uuid(),

  participant_a_id uuid not null,
  participant_b_id uuid not null,

  job_id uuid null,
  application_id uuid null,
  company_id uuid null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_message_at timestamptz null,
  last_message_id uuid null
);

-- Deduplicate: one thread per participant pair per context.
-- Enforce ordering of participant ids in app code: a=min, b=max
create unique index if not exists ux_chat_conversations_pair_context
on public.chat_conversations (
  participant_a_id,
  participant_b_id,
  coalesce(application_id::text, ''),
  coalesce(job_id::text, ''),
  coalesce(company_id::text, '')
);

create index if not exists ix_chat_conversations_last_message_at
on public.chat_conversations (last_message_at desc);
```

### 2.2 participant state (per-user)
```sql
create type public.chat_request_state as enum ('none', 'pending', 'accepted', 'declined');

create table if not exists public.chat_conversation_participants (
  conversation_id uuid not null references public.chat_conversations(id) on delete cascade,
  user_id uuid not null,

  muted_at timestamptz null,
  archived_at timestamptz null,
  request_state public.chat_request_state not null default 'none',

  last_read_at timestamptz null,
  last_read_message_id uuid null,

  unread_count int not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  primary key (conversation_id, user_id)
);

create index if not exists ix_chat_participants_user_inbox
on public.chat_conversation_participants (user_id, archived_at, request_state);

create index if not exists ix_chat_participants_user_unread
on public.chat_conversation_participants (user_id, unread_count desc);
```

### 2.3 messages
```sql
create type public.chat_message_kind as enum ('user', 'system');

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.chat_conversations(id) on delete cascade,
  sender_id uuid not null,

  kind public.chat_message_kind not null default 'user',
  body text null,

  client_message_id uuid null,

  edited_at timestamptz null,
  redacted_at timestamptz null,
  redaction_reason text null,

  created_at timestamptz not null default now()
);

-- Idempotency: prevent duplicate sends per sender
create unique index if not exists ux_chat_messages_sender_client_message_id
on public.chat_messages (sender_id, client_message_id)
where client_message_id is not null;

create index if not exists ix_chat_messages_conversation_created_at
on public.chat_messages (conversation_id, created_at);
```

### 2.4 attachments
```sql
create type public.chat_attachment_status as enum ('pending_upload', 'pending_scan', 'available', 'blocked', 'deleted');

create table if not exists public.chat_attachments (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.chat_conversations(id) on delete cascade,
  message_id uuid null references public.chat_messages(id) on delete set null,

  uploader_id uuid not null,
  file_name text not null,
  content_type text not null,
  size_bytes bigint not null,

  storage_key text not null,
  status public.chat_attachment_status not null default 'pending_upload',

  scan_result text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ix_chat_attachments_message_id on public.chat_attachments(message_id);
```

---

## 3) Safety

### 3.1 blocks
```sql
create table if not exists public.chat_user_blocks (
  blocker_user_id uuid not null,
  blocked_user_id uuid not null,
  reason text null,
  created_at timestamptz not null default now(),
  primary key (blocker_user_id, blocked_user_id)
);
```

### 3.2 reports
```sql
create type public.chat_report_category as enum ('spam', 'harassment', 'fraud', 'other');
create type public.chat_report_status as enum ('new', 'in_review', 'resolved', 'dismissed');

create table if not exists public.chat_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_user_id uuid not null,
  reported_user_id uuid not null,
  conversation_id uuid not null references public.chat_conversations(id) on delete cascade,

  category public.chat_report_category not null,
  description text null,
  evidence_pointer text null,

  status public.chat_report_status not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### 3.3 moderation audit
```sql
create type public.chat_moderation_action as enum ('warn', 'mute_user', 'suspend_messaging', 'ban_user');

create table if not exists public.chat_moderation_audit (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null,
  target_user_id uuid not null,
  action public.chat_moderation_action not null,
  details jsonb null,
  created_at timestamptz not null default now()
);
```

---

## 4) Triggers (updated_at)
```sql
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_chat_conversations_updated_at on public.chat_conversations;
create trigger trg_chat_conversations_updated_at
before update on public.chat_conversations
for each row execute function public.set_updated_at();

drop trigger if exists trg_chat_participants_updated_at on public.chat_conversation_participants;
create trigger trg_chat_participants_updated_at
before update on public.chat_conversation_participants
for each row execute function public.set_updated_at();

drop trigger if exists trg_chat_attachments_updated_at on public.chat_attachments;
create trigger trg_chat_attachments_updated_at
before update on public.chat_attachments
for each row execute function public.set_updated_at();
```

---

## 5) Required App-Level Rules
- Normalize participant ordering (`a=min`, `b=max`)
- Enforce block checks before inserts
- Enforce request gating before allowing additional sends/links/attachments
- Update unread counts transactionally on message insert
