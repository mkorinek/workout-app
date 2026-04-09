"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("saveTemplate");
  const tc = useTranslations("common");
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
    <Modal open={open} onClose={onClose} title={t("title")}>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-text-secondary">
          {t("description")}
        </p>
        <Input
          label={t("nameLabel")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("namePlaceholder")}
          autoFocus
        />
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={onClose}>
            {tc("cancel")}
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving || !name.trim()}>
            {saving ? t("saving") : t("save")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
