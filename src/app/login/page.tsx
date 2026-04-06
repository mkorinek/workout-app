"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

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
        {/* Terminal header */}
        <div className="border border-term-gray mb-8">
          <div className="border-b border-term-gray px-4 py-2 text-term-green text-xs uppercase tracking-widest">
            system login
          </div>
          <div className="p-6">
            <pre className="text-term-green text-sm mb-6 leading-relaxed">
{`> WORKOUT LOGGER v1.0
> initializing...
> ready.`}
            </pre>
            <p className="text-term-gray-light text-xs mb-8 uppercase tracking-wider">
              authenticate to continue_
            </p>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full border border-term-green text-term-green py-3 px-4 uppercase tracking-widest text-xs font-bold hover:bg-term-green hover:text-term-black transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span>
                  connecting<span className="cursor-blink">_</span>
                </span>
              ) : (
                "> sign in with google"
              )}
            </button>
          </div>
        </div>

        <p className="text-term-gray-light text-[10px] text-center uppercase tracking-widest">
          all data encrypted &middot; your gains are safe
        </p>
      </div>
    </div>
  );
}
