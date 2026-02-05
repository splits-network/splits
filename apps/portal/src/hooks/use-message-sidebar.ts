import { useState, useCallback } from 'react';

interface MessageSidebarState {
    isOpen: boolean;
    conversationId: string | null;
    candidateName: string | null;
    candidateUserId: string | null;
    context: {
        application_id?: string | null;
        job_id?: string | null;
        company_id?: string | null;
    } | null;
}

export function useMessageSidebar() {
    const [state, setState] = useState<MessageSidebarState>({
        isOpen: false,
        conversationId: null,
        candidateName: null,
        candidateUserId: null,
        context: null,
    });

    const openSidebar = useCallback((conversationId: string, candidateName?: string | null, candidateUserId?: string | null, context?: any) => {
        setState({
            isOpen: true,
            conversationId,
            candidateName: candidateName || null,
            candidateUserId: candidateUserId || null,
            context: context || null,
        });
    }, []);

    const closeSidebar = useCallback(() => {
        setState({
            isOpen: false,
            conversationId: null,
            candidateName: null,
            candidateUserId: null,
            context: null,
        });
    }, []);

    const resetSidebar = useCallback(() => {
        // Similar to close but can be used for navigation resets
        closeSidebar();
    }, [closeSidebar]);

    return {
        ...state,
        openSidebar,
        closeSidebar,
        resetSidebar,
    };
}