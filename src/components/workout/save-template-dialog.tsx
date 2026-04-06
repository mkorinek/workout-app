"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createTemplateFromSession } from "@/actions/templates";

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
    await createTemplateFromSession(sessionId, name.trim());
    setSaving(false);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="save as template">
      <div className="flex flex-col gap-4">
        <p className="text-xs text-term-gray-light">
          &gt; save this workout as a reusable template
        </p>
        <Input
          label="template name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. push day"
          autoFocus
        />
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={onClose}>
            cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving || !name.trim()}>
            {saving ? "saving..." : "save"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
