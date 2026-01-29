-- Chat helper functions for transactional updates

create or replace function public.chat_send_message(
    p_conversation_id uuid,
    p_sender_id uuid,
    p_body text,
    p_client_message_id uuid
) returns public.chat_messages as $$
declare
    v_message public.chat_messages;
    v_other_user uuid;
begin
    insert into public.chat_messages (conversation_id, sender_id, body, client_message_id)
    values (p_conversation_id, p_sender_id, p_body, p_client_message_id)
    on conflict (sender_id, client_message_id) do nothing
    returning * into v_message;

    if v_message.id is null then
        select *
        into v_message
        from public.chat_messages
        where sender_id = p_sender_id
          and client_message_id = p_client_message_id
        order by created_at desc
        limit 1;
    end if;

    update public.chat_conversations
    set last_message_at = v_message.created_at,
        last_message_id = v_message.id,
        updated_at = now()
    where id = p_conversation_id;

    update public.chat_conversation_participants
    set last_read_at = v_message.created_at,
        last_read_message_id = v_message.id,
        unread_count = 0,
        updated_at = now()
    where conversation_id = p_conversation_id
      and user_id = p_sender_id;

    select user_id
    into v_other_user
    from public.chat_conversation_participants
    where conversation_id = p_conversation_id
      and user_id <> p_sender_id
    limit 1;

    if v_other_user is not null then
        update public.chat_conversation_participants
        set unread_count = unread_count + 1,
            updated_at = now()
        where conversation_id = p_conversation_id
          and user_id = v_other_user;
    end if;

    return v_message;
end;
$$ language plpgsql;

create or replace function public.chat_mark_read(
    p_conversation_id uuid,
    p_user_id uuid,
    p_last_read_message_id uuid
) returns void as $$
begin
    update public.chat_conversation_participants
    set last_read_at = now(),
        last_read_message_id = p_last_read_message_id,
        unread_count = 0,
        updated_at = now()
    where conversation_id = p_conversation_id
      and user_id = p_user_id;
end;
$$ language plpgsql;
