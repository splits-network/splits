"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";

export interface DrawerOptions {
    width?: "half" | "narrow";
}

interface DrawerContextType {
    isOpen: boolean;
    open: (content: ReactNode, options?: DrawerOptions) => void;
    close: () => void;
}

const DrawerContext = createContext<DrawerContextType | null>(null);

const WIDTH_CLASSES: Record<string, string> = {
    half: "w-full md:w-1/2",
    narrow: "w-full md:w-[480px] lg:w-[540px]",
};

export function DrawerProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [content, setContent] = useState<ReactNode>(null);
    const [width, setWidth] = useState<string>("half");
    const [mounted, setMounted] = useState(false);
    const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pathname = usePathname();

    useEffect(() => {
        setMounted(true);
    }, []);

    const open = useCallback((node: ReactNode, options?: DrawerOptions) => {
        if (clearTimer.current) {
            clearTimeout(clearTimer.current);
            clearTimer.current = null;
        }
        setContent(node);
        setWidth(options?.width ?? "half");
        setIsOpen(true);
    }, []);

    const close = useCallback(() => {
        setIsOpen(false);
        clearTimer.current = setTimeout(() => setContent(null), 300);
    }, []);

    // Auto-close on navigation
    useEffect(() => {
        close();
    }, [pathname, close]);

    // Escape key
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") close();
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [isOpen, close]);

    // Body scroll lock
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    const drawer = mounted && (isOpen || content)
        ? createPortal(
              <div
                  className={`fixed inset-0 z-[60] transition-opacity duration-300 ${
                      isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                  }`}
              >
                  <div
                      className="absolute inset-0 bg-black/50"
                      onClick={close}
                      aria-label="close drawer"
                  />
                  <div
                      className={`absolute right-0 top-0 h-full ${WIDTH_CLASSES[width] ?? WIDTH_CLASSES.half} bg-base-100 overflow-y-auto shadow-2xl transition-transform duration-300 ${
                          isOpen ? "translate-x-0" : "translate-x-full"
                      }`}
                  >
                      {content}
                  </div>
              </div>,
              document.body,
          )
        : null;

    return (
        <DrawerContext.Provider value={{ isOpen, open, close }}>
            {children}
            {drawer}
        </DrawerContext.Provider>
    );
}

export function useDrawer(): DrawerContextType {
    const ctx = useContext(DrawerContext);
    if (!ctx) throw new Error("useDrawer must be used within DrawerProvider");
    return ctx;
}
