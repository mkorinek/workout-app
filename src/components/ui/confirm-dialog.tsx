"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
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
  variant?: "danger" | "accent";
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  loadingLabel,
  loading = false,
  variant = "danger",
}: ConfirmDialogProps) {
  const tc = useTranslations("common");
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
      className="fixed inset-0 z-[60] flex items-center justify-center"
      onClick={() => { if (!loading) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative animate-slide-up card-elevated p-6 max-w-sm w-[calc(100%-2rem)]"
        onClick={(e) => e.stopPropagation()}
      >
        <p className={`text-sm font-semibold mb-1 ${variant === "accent" ? "text-accent" : "text-destructive"}`}>
          {title}
        </p>
        <p className="text-xs text-text-secondary mb-6">
          {description}
        </p>
        <div className="flex gap-2">
          <Button
            variant={variant === "accent" ? "primary" : "danger"}
            size="sm"
            className="flex-1"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (loadingLabel ?? tc("working")) : (confirmLabel ?? tc("confirm"))}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1"
            onClick={onClose}
            disabled={loading}
          >
            {tc("cancel")}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
