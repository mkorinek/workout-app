import { getTemplates } from "@/actions/templates";
import Link from "next/link";

export default async function TemplatesPage() {
  const templates = await getTemplates();

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-xs text-term-green uppercase tracking-widest mb-6">
        &gt; saved templates
      </h1>

      {templates.length === 0 ? (
        <div className="border border-term-gray p-8 text-center">
          <pre className="text-term-gray-light text-xs">
{`> no templates saved
> finish a workout to save one`}
          </pre>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {templates.map((template) => {
            const exercises = template.exercises as { exercise_name: string; sets: number; reps: number }[];
            return (
              <Link
                key={template.id}
                href={`/templates/${template.id}`}
                className="border border-term-gray hover:border-term-green-dim transition-colors p-3 block"
              >
                <p className="text-xs text-term-white mb-1">
                  &gt; {template.name}
                </p>
                <p className="text-[10px] text-term-gray-light">
                  {exercises
                    ?.map((e) => `${e.exercise_name} (${e.sets}x${e.reps})`)
                    .join(" / ")}
                </p>
                <p className="text-[10px] text-term-gray mt-1">
                  {new Date(template.updated_at).toLocaleDateString()}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
