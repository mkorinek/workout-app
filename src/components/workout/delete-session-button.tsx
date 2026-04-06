"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteSession } from "@/actions/sessions";
import { Button } from "@/components/ui/button";

export function DeleteSessionButton({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  return (
    <>
      <span
        role="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowModal(true);
        }}
        className="text-[10px] uppercase tracking-widest font-bold px-1.5 py-0.5 border border-term-red text-term-red hover:bg-term-red hover:text-term-black transition-colors cursor-pointer inline-block leading-normal"
      >
        delete
      </span>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!deleting) setShowModal(false);
          }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80" />

          {/* Modal */}
          <div
            className="relative border border-term-red bg-term-black p-6 max-w-sm w-[calc(100%-2rem)]"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-xs text-term-red uppercase tracking-widest mb-1 font-bold">
              &gt; delete workout
            </p>
            <p className="text-[10px] text-term-gray-light mb-6">
              this action cannot be undone. all sets and data for this workout will be permanently removed.
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
                {deleting ? "deleting..." : "yes, delete"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1"
                onClick={() => setShowModal(false)}
                disabled={deleting}
              >
                cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
