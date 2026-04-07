"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { XIcon } from "@/components/icons";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const shell = document.getElementById("app-shell");
    if (open) {
      document.body.style.overflow = "hidden";
      shell?.classList.add("modal-open");
    } else {
      document.body.style.overflow = "";
      shell?.classList.remove("modal-open");
    }
    return () => {
      document.body.style.overflow = "";
      shell?.classList.remove("modal-open");
    };
  }, [open]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-black/40"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="animate-slide-up w-full max-w-md card-elevated">
        <div className="mx-auto mt-2 mb-0 w-9 h-1 rounded-full bg-text-muted/30 sm:hidden" />
        <div className="border-b border-border-subtle px-5 py-3.5 flex items-center justify-between">
          <span className="text-sm font-semibold text-text-primary">
            {title}
          </span>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <XIcon size={16} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}
