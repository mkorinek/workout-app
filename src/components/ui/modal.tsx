"use client";

import { useEffect, useRef } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="border border-term-gray w-full max-w-md bg-term-black">
        <div className="border-b border-term-gray px-4 py-2 flex items-center justify-between">
          <span className="text-term-green text-xs uppercase tracking-widest">
            {title}
          </span>
          <button
            onClick={onClose}
            className="text-term-gray-light hover:text-term-white text-xs"
          >
            [x]
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
