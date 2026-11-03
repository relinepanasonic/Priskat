"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import { Mail, ArrowLeft } from "lucide-react";
import { friendlyAuthError } from "@/lib/authErrors";

const forgotSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotForm = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(() =>
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("error") === "link_expired"
      ? "That link has expired or was already used. Request a new one below."
      : null
  );
  const [success, setSuccess] = useState(false);
  const [sentTo, setSentTo] = useState("");
  const [wait, setWait] = useState(0);

  // A short pause before the link can be sent again
  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const form = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
  });

  async function onSubmit(data: ForgotForm) {
    setError(null);
    setSuccess(false);
    
    const supabase = createClient();
    // We point the redirectTo back to our callback, which will redirect to /reset-password
    const redirectTo = `${window.location.origin}/auth/callback?next=/reset-password`;

    const email = data.email.trim().toLowerCase();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      setError(friendlyAuthError(error.message));
      return;
    }

    setSentTo(email);
    setWait(60);
    setSuccess(true);
  }

  return (
    <div>
      <Link href="/login" className="mb-6 inline-flex items-center text-sm font-medium text-brand-muted hover:text-brand-light transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Login
      </Link>

      <h2 className="mb-1 text-xl font-bold text-white">Reset Password</h2>
      <p className="mb-6 text-sm text-brand-muted">
        Enter your email address and we'll send you a link to reset your password.
      </p>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success ? (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-6 text-center">
          <h3 className="text-green-800 font-bold mb-2">Check your email</h3>
          <p className="text-sm text-green-700">
            Kalau <b>{sentTo}</b> terdaftar, tautan untuk membuat kata sandi baru sudah dikirim.
          </p>
          <p className="mt-2 text-xs text-green-700">
            Belum masuk? Periksa folder <b>Spam / Junk / Promosi</b>. Email Yahoo kadang butuh beberapa menit. Pastikan juga email yang kamu ketik sama dengan saat mendaftar. Kalau dulu daftar dengan Google, masuklah dengan tombol Google.
          </p>
          <button
            type="button"
            disabled={wait > 0 || form.formState.isSubmitting}
            onClick={() => form.handleSubmit(onSubmit)()}
            className="mt-4 text-sm font-semibold text-green-800 underline disabled:no-underline disabled:opacity-60"
          >
            {wait > 0 ? `Kirim ulang dalam ${wait} detik` : "Kirim ulang tautan"}
          </button>
        </div>
      ) : (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-light">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
              <input
                {...form.register("email")}
                type="email"
                autoCapitalize="none"
                autoCorrect="off"
                autoComplete="email"
                spellCheck={false}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-brand-border py-2.5 pl-10 pr-4 text-sm bg-brand-surface text-brand-light focus:border-brand-blue focus:outline-none"
              />
            </div>
            {form.formState.errors.email && (
              <p className="mt-1 text-xs text-red-600">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            loading={form.formState.isSubmitting}
          >
            Send Reset Link
          </Button>
        </form>
      )}
    </div>
  );
}

