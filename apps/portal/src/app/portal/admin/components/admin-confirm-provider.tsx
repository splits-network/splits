"use client";

import {
    createContext,
    useContext,
    useState,
    useCallback,
    ReactNode,
    useRef,
} from "react";
import ConfirmDialog from "@/components/confirm-dialog";

export interface ConfirmOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: "warning" | "error" | "info";
}

interface AdminConfirmContextValue {
    confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const AdminConfirmContext = createContext<AdminConfirmContextValue | null>(null);

export function useAdminConfirm() {
    const context = useContext(AdminConfirmContext);
    if (!context) {
        throw new Error("useAdminConfirm must be used within AdminConfirmProvider");
    }
    return context.confirm;
}

interface AdminConfirmProviderProps {
    children: ReactNode;
}

export function AdminConfirmProvider({ children }: AdminConfirmProviderProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState<ConfirmOptions | null>(null);
    const [loading, setLoading] = useState(false);
    const resolveRef = useRef<((value: boolean) => void) | null>(null);

    const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            setOptions(opts);
            setIsOpen(true);
            setLoading(false);
            resolveRef.current = resolve;
        });
    }, []);

    const handleConfirm = useCallback(() => {
        setLoading(true);
        // Small delay to show loading state
        setTimeout(() => {
            setIsOpen(false);
            setLoading(false);
            resolveRef.current?.(true);
            resolveRef.current = null;
        }, 150);
    }, []);

    const handleCancel = useCallback(() => {
        setIsOpen(false);
        setLoading(false);
        resolveRef.current?.(false);
        resolveRef.current = null;
    }, []);

    return (
        <AdminConfirmContext.Provider value={{ confirm }}>
            {children}
            {options && (
                <ConfirmDialog
                    isOpen={isOpen}
                    title={options.title}
                    message={options.message}
                    confirmText={options.confirmText}
                    cancelText={options.cancelText}
                    type={options.type}
                    loading={loading}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                />
            )}
        </AdminConfirmContext.Provider>
    );
}
