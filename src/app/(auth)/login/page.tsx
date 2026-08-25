"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

const passwordSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const magicLinkSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type PasswordForm = z.infer<typeof passwordSchema>;
type MagicLinkForm = z.infer<typeof magicLinkSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicSent, setMagicSent] = useState(false);

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const magicForm = useForm<MagicLinkForm>({
    resolver: zodResolver(magicLinkSchema),
  });

  async function onPasswordSubmit(data: PasswordForm) {
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/");
    router.refresh();
  }

  async function onMagicLinkSubmit(data: MagicLinkForm) {
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: data.email,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      return;
    }
    setMagicSent(true);
  }

  if (magicSent) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <Mail className="h-7 w-7 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-stone-900">Check your email</h2>
        <p className="mt-2 text-sm text-stone-500">
          We&apos;ve sent a magic link to your email. Click it to sign in.
        </p>
        <button
          onClick={() => setMagicSent(false)}
          className="mt-4 text-sm text-brand-blue hover:underline"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-1 text-xl font-bold text-stone-900">Sign In</h2>
      <p className="mb-6 text-sm text-stone-500">
        Welcome back to PriskatCFM
      </p>

      {/* Mode toggle */}
      <div className="mb-6 flex rounded-lg bg-stone-100 p-1">
        <button
          onClick={() => setMode("password")}
          className={[
            "flex-1 rounded-md py-1.5 text-sm font-medium transition-colors",
            mode === "password"
              ? "bg-white text-stone-900 shadow-sm"
              : "text-stone-500",
          ].join(" ")}
        >
          Password
        </button>
        <button
          onClick={() => setMode("magic")}
          className={[
            "flex-1 rounded-md py-1.5 text-sm font-medium transition-colors",
            mode === "magic"
              ? "bg-white text-stone-900 shadow-sm"
              : "text-stone-500",
          ].join(" ")}
        >
          Magic Link
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {mode === "password" ? (
        <form
          onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
          className="space-y-4"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                {...passwordForm.register("email")}
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-lg border border-stone-200 py-2.5 pl-10 pr-4 text-sm focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
              />
            </div>
            {passwordForm.formState.errors.email && (
              <p className="mt-1 text-xs text-red-600">
                {passwordForm.formState.errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                {...passwordForm.register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full rounded-lg border border-stone-200 py-2.5 pl-10 pr-10 text-sm focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {passwordForm.formState.errors.password && (
              <p className="mt-1 text-xs text-red-600">
                {passwordForm.formState.errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            loading={passwordForm.formState.isSubmitting}
          >
            Sign In
          </Button>
        </form>
      ) : (
        <form
          onSubmit={magicForm.handleSubmit(onMagicLinkSubmit)}
          className="space-y-4"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                {...magicForm.register("email")}
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-lg border border-stone-200 py-2.5 pl-10 pr-4 text-sm focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
              />
            </div>
            {magicForm.formState.errors.email && (
              <p className="mt-1 text-xs text-red-600">
                {magicForm.formState.errors.email.message}
              </p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full"
            loading={magicForm.formState.isSubmitting}
          >
            Send Magic Link
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-stone-500">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-brand-blue hover:underline"
        >
          Join PriskatCFM
        </Link>
      </p>
    </div>
  );
}
