"use client";

import { createContext, useCallback, useContext, useState } from "react";

interface Toast {
  id: string;
  message: string;
  type: "info" | "success" | "error" | "achievement";
}

interface ToastContextValue {
  addToast: (message: string, type?: Toast["type"]) => void;
}

const ToastContext = createContext<ToastContextValue>({ addToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-4 left-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none max-w-lg mx-auto">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="achievement-toast card-elevated px-4 py-3 text-sm pointer-events-auto glass text-text-primary flex items-start gap-2.5"
          >
            {toast.type === "achievement" && (
              <span className="mt-0.5 w-2 h-2 rounded-full bg-warning shrink-0" />
            )}
            {toast.type === "success" && (
              <span className="mt-0.5 w-2 h-2 rounded-full bg-success shrink-0" />
            )}
            {toast.type === "error" && (
              <span className="mt-0.5 w-2 h-2 rounded-full bg-destructive shrink-0" />
            )}
            <div>
              {toast.type === "achievement" && (
                <span className="text-xs font-semibold text-warning block mb-0.5">Achievement Unlocked</span>
              )}
              {toast.message}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
