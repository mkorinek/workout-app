"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  loadingLabel?: string;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "confirm",
  loadingLabel = "working...",
  loading = false,
}: ConfirmDialogProps) {
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
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={() => { if (!loading) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/80" />
      <div
        className="relative border border-term-red bg-term-black p-6 max-w-sm w-[calc(100%-2rem)]"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-xs text-term-red uppercase tracking-widest mb-1 font-bold">
          &gt; {title}
        </p>
        <p className="text-[10px] text-term-gray-light mb-6">
          {description}
        </p>
        <div className="flex gap-2">
          <Button
            variant="danger"
            size="sm"
            className="flex-1"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? loadingLabel : confirmLabel}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1"
            onClick={onClose}
            disabled={loading}
          >
            cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
