"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { deleteSession } from "@/actions/sessions";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "@/components/icons";

export function DeleteSessionButton({ sessionId }: { sessionId: string }) {
  const router = useRouter();
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
        aria-label="Delete workout"
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
              Delete Workout
            </p>
            <p className="text-xs text-text-secondary mb-6">
              This action cannot be undone. All sets and data for this workout will be permanently removed.
            </p>
            <div className="flex gap-2">
              <Button
                variant="danger"
                size="sm"
                className="flex-1"
                onClick={async () => {
                  setDeleting(true);
                  await deleteSession(sessionId);
                  setShowModal(false);
                  router.refresh();
                }}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Yes, delete"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1"
                onClick={() => setShowModal(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
