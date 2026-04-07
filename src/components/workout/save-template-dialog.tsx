"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createTemplateFromSession } from "@/actions/templates";
import { withInvalidation } from "@/lib/cache/invalidate";

interface SaveTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  sessionId: string;
}

export function SaveTemplateDialog({ open, onClose, sessionId }: SaveTemplateDialogProps) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    await withInvalidation(() => createTemplateFromSession(sessionId, name.trim()), "templates");
    setSaving(false);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Save as Template">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-text-secondary">
          Save this workout as a reusable template
        </p>
        <Input
          label="Template name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Push Day"
          autoFocus
        />
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving || !name.trim()}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
