-- Chat schema and retention config

create extension if not exists pgcrypto;

-- Enums
do $$
begin
    if not exists (select 1 from pg_type where typname = 'chat_request_state') then
        create type public.chat_request_state as enum ('none', 'pending', 'accepted', 'declined');
    end if;
    if not exists (select 1 from pg_type where typname = 'chat_message_kind') then
        create type public.chat_message_kind as enum ('user', 'system');
    end if;
    if not exists (select 1 from pg_type where typname = 'chat_attachment_status') then
        create type public.chat_attachment_status as enum ('pending_upload', 'pending_scan', 'available', 'blocked', 'deleted');
    end if;
    if not exists (select 1 from pg_type where typname = 'chat_report_category') then
        create type public.chat_report_category as enum ('spam', 'harassment', 'fraud', 'other');
    end if;
    if not exists (select 1 from pg_type where typname = 'chat_report_status') then
        create type public.chat_report_status as enum ('new', 'in_review', 'resolved', 'dismissed');
    end if;
    if not exists (select 1 from pg_type where typname = 'chat_moderation_action') then
        create type public.chat_moderation_action as enum ('warn', 'mute_user', 'suspend_messaging', 'ban_user');
    end if;
end$$;

-- Conversations
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

-- Participant state (per-user)
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

-- Messages
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

create unique index if not exists ux_chat_messages_sender_client_message_id
on public.chat_messages (sender_id, client_message_id)
where client_message_id is not null;

create index if not exists ix_chat_messages_conversation_created_at
on public.chat_messages (conversation_id, created_at);

-- Attachments
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

-- Blocks
create table if not exists public.chat_user_blocks (
    blocker_user_id uuid not null,
    blocked_user_id uuid not null,
    reason text null,
    created_at timestamptz not null default now(),
    primary key (blocker_user_id, blocked_user_id)
);

-- Reports
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

-- Moderation audit
create table if not exists public.chat_moderation_audit (
    id uuid primary key default gen_random_uuid(),
    actor_user_id uuid not null,
    target_user_id uuid not null,
    action public.chat_moderation_action not null,
    details jsonb null,
    created_at timestamptz not null default now()
);

-- Retention config
create table if not exists public.chat_retention_config (
    id uuid primary key default gen_random_uuid(),
    message_retention_days int not null default 730,
    attachment_retention_days int not null default 365,
    audit_retention_days int not null default 1095,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.chat_retention_runs (
    id uuid primary key default gen_random_uuid(),
    started_at timestamptz not null default now(),
    completed_at timestamptz null,
    status text not null default 'running',
    messages_redacted int not null default 0,
    attachments_deleted int not null default 0,
    audits_archived int not null default 0,
    error text null
);

insert into public.chat_retention_config (message_retention_days, attachment_retention_days, audit_retention_days)
select 730, 365, 1095
where not exists (select 1 from public.chat_retention_config);

-- updated_at triggers
drop trigger if exists update_chat_conversations_updated_at on public.chat_conversations;
create trigger update_chat_conversations_updated_at
before update on public.chat_conversations
for each row execute function public.update_updated_at_column();

drop trigger if exists update_chat_participants_updated_at on public.chat_conversation_participants;
create trigger update_chat_participants_updated_at
before update on public.chat_conversation_participants
for each row execute function public.update_updated_at_column();

drop trigger if exists update_chat_attachments_updated_at on public.chat_attachments;
create trigger update_chat_attachments_updated_at
before update on public.chat_attachments
for each row execute function public.update_updated_at_column();

drop trigger if exists update_chat_reports_updated_at on public.chat_reports;
create trigger update_chat_reports_updated_at
before update on public.chat_reports
for each row execute function public.update_updated_at_column();
