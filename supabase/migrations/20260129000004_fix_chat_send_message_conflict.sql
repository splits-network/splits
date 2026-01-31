-- Fix chat_send_message ON CONFLICT target by adding a proper unique constraint

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'ux_chat_messages_sender_client_message_id'
    ) THEN
        ALTER TABLE public.chat_messages
            DROP CONSTRAINT ux_chat_messages_sender_client_message_id;
    END IF;
END $$;

DROP INDEX IF EXISTS public.ux_chat_messages_sender_client_message_id;

ALTER TABLE public.chat_messages
    ADD CONSTRAINT ux_chat_messages_sender_client_message_id
    UNIQUE (sender_id, client_message_id);

CREATE OR REPLACE FUNCTION public.chat_send_message(
    p_conversation_id uuid,
    p_sender_id uuid,
    p_body text,
    p_client_message_id uuid
) RETURNS public.chat_messages AS $$
DECLARE
    v_message public.chat_messages;
    v_other_user uuid;
BEGIN
    INSERT INTO public.chat_messages (conversation_id, sender_id, body, client_message_id)
    VALUES (p_conversation_id, p_sender_id, p_body, p_client_message_id)
    ON CONFLICT ON CONSTRAINT ux_chat_messages_sender_client_message_id DO NOTHING
    RETURNING * INTO v_message;

    IF v_message.id IS NULL THEN
        SELECT *
        INTO v_message
        FROM public.chat_messages
        WHERE sender_id = p_sender_id
          AND client_message_id = p_client_message_id
        ORDER BY created_at DESC
        LIMIT 1;
    END IF;

    UPDATE public.chat_conversations
    SET last_message_at = v_message.created_at,
        last_message_id = v_message.id,
        updated_at = now()
    WHERE id = p_conversation_id;

    UPDATE public.chat_conversation_participants
    SET last_read_at = v_message.created_at,
        last_read_message_id = v_message.id,
        unread_count = 0,
        updated_at = now()
    WHERE conversation_id = p_conversation_id
      AND user_id = p_sender_id;

    SELECT user_id
    INTO v_other_user
    FROM public.chat_conversation_participants
    WHERE conversation_id = p_conversation_id
      AND user_id <> p_sender_id
    LIMIT 1;

    IF v_other_user IS NOT NULL THEN
        UPDATE public.chat_conversation_participants
        SET unread_count = unread_count + 1,
            updated_at = now()
        WHERE conversation_id = p_conversation_id
          AND user_id = v_other_user;
    END IF;

    RETURN v_message;
END;
$$ LANGUAGE plpgsql;
