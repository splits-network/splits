-- Add role snapshot on participants and metadata on messages

alter table public.chat_conversation_participants
add column if not exists role_snapshot jsonb null;

alter table public.chat_messages
add column if not exists metadata jsonb null;
