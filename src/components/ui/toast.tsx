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
            className={`achievement-toast border px-4 py-3 text-xs font-mono uppercase tracking-wider pointer-events-auto ${
              toast.type === "achievement"
                ? "border-term-amber text-term-amber bg-term-black"
                : toast.type === "success"
                ? "border-term-green text-term-green bg-term-black"
                : toast.type === "error"
                ? "border-term-red text-term-red bg-term-black"
                : "border-term-gray text-term-white bg-term-black"
            }`}
          >
            {toast.type === "achievement" ? "> ACHIEVEMENT UNLOCKED: " : "> "}
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
