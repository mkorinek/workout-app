"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const t = useTranslations("login");

  // Clear any stale auth cookies to prevent "Refresh Token Not Found" errors
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.signOut({ scope: "local" });
  }, []);

  async function handleGoogleLogin() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="card-elevated overflow-hidden">
          <div className="p-8 text-center">
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              {t("title")}
            </h1>
            <p className="text-sm text-text-muted mb-8">
              {t("subtitle")}
            </p>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-accent text-white py-3 px-4 text-sm font-semibold hover:bg-accent-hover transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
            >
              {loading ? (
                <span className="animate-pulse-subtle">{t("connecting")}</span>
              ) : (
                t("signIn")
              )}
            </button>
          </div>
        </div>

        <p className="text-text-muted text-[10px] text-center mt-4">
          {t("footer")}
        </p>
      </div>
    </div>
  );
}
