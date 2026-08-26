"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";

export default function InviteUserForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    const supabase = createClient();

    // Supabase Magic Link onboarding
    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
    } else {
      setStatus("success");
      setMessage(`Magic link sent to ${email}`);
      setEmail("");
    }
  };

  return (
    <div className="card-3d p-6 max-w-md">
      <h2 className="text-xl font-bold text-white mb-2">Invite User via Magic Link</h2>
      <p className="text-sm text-brand-muted mb-6">
        Send a magic link to a user's email. They can use this link to instantly sign in and onboard into the platform.
      </p>

      <form onSubmit={handleInvite} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-brand-light mb-1">
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-brand-bg border border-[#333] rounded-xl px-4 py-3 text-brand-light placeholder-brand-muted/50 focus:outline-none focus:border-brand-gold transition-colors"
            placeholder="user@example.com"
          />
        </div>

        <button
          type="submit"
          disabled={status === "loading" || !email}
          className="w-full flex items-center justify-center gap-2 bg-brand-gold text-brand-dark px-4 py-3 rounded-xl font-bold hover:bg-yellow-400 transition-colors shadow-glow-gold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "loading" ? "Sending..." : "Send Magic Link"}
          <Send className="h-4 w-4" />
        </button>

        {status === "success" && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex items-start gap-3 mt-4">
            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <p className="text-sm text-green-500">{message}</p>
          </div>
        )}

        {status === "error" && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 mt-4">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-500">{message}</p>
          </div>
        )}
      </form>
    </div>
  );
}

