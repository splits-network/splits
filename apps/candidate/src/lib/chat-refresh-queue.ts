type RefreshCallback = () => Promise<void> | void;

const listeners = new Set<RefreshCallback>();
let inFlight = false;
let lastRun = 0;
let timeout: ReturnType<typeof setTimeout> | null = null;

const COOLDOWN_MS = 1500;

export function registerChatRefresh(callback: RefreshCallback) {
    listeners.add(callback);
    return () => {
        listeners.delete(callback);
    };
}

export function requestChatRefresh() {
    const now = Date.now();
    const elapsed = now - lastRun;

    if (inFlight) return;

    if (elapsed >= COOLDOWN_MS) {
        inFlight = true;
        const tasks = Array.from(listeners).map((cb) => {
            try {
                return Promise.resolve(cb());
            } catch {
                return Promise.resolve();
            }
        });
        Promise.all(tasks)
            .catch(() => {})
            .finally(() => {
                inFlight = false;
                lastRun = Date.now();
            });
        return;
    }

    if (!timeout) {
        const wait = Math.max(COOLDOWN_MS - elapsed, 250);
        timeout = setTimeout(() => {
            timeout = null;
            requestChatRefresh();
        }, wait);
    }
}
