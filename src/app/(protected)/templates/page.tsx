import { getTemplates } from "@/actions/templates";
import { TemplatesClient } from "./client";

export default async function TemplatesPage() {
  const templates = await getTemplates();

  return <TemplatesClient initialTemplates={templates} />;
}
