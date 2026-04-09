"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { deleteSession } from "@/actions/sessions";
import { withInvalidation } from "@/lib/cache/invalidate";
import { useAppStore } from "@/lib/cache/app-store";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "@/components/icons";

export function DeleteSessionButton({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const t = useTranslations("activeWorkout");
  const tc = useTranslations("common");
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const shell = document.getElementById("app-shell");
    if (showModal) {
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
  }, [showModal]);

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowModal(true);
        }}
        className="text-destructive opacity-60 hover:opacity-100 transition-opacity p-1"
        aria-label={t("deleteWorkout")}
      >
        <TrashIcon size={14} />
      </button>

      {showModal && mounted && createPortal(
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!deleting) setShowModal(false);
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative animate-slide-up bg-surface-elevated p-6 max-w-sm w-[calc(100%-2rem)] rounded-lg"
            style={{ boxShadow: "var(--shadow-lg)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm font-semibold text-destructive mb-1">
              {t("deleteTitle")}
            </p>
            <p className="text-xs text-text-secondary mb-6">
              {t("deleteDescription")}
            </p>
            <div className="flex gap-2">
              <Button
                variant="danger"
                size="sm"
                className="flex-1"
                onClick={async () => {
                  setDeleting(true);
                  const store = useAppStore.getState();
                  const current = store.sessions.data;
                  if (current) {
                    store.set("sessions", current.filter((s) => s.id !== sessionId));
                  }
                  const result = await withInvalidation(() => deleteSession(sessionId), "sessions");
                  if (result && "error" in result) {
                    if (current) store.set("sessions", current);
                  }
                  setShowModal(false);
                  router.refresh();
                }}
                disabled={deleting}
              >
                {deleting ? t("deleting") : t("yesDelete")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1"
                onClick={() => setShowModal(false)}
                disabled={deleting}
              >
                {tc("cancel")}
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
