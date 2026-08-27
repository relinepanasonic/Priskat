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

type PasswordForm = z.infer<typeof passwordSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
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

  return (
    <div>
      <h2 className="mb-1 text-xl font-bold text-white">Log In</h2>
      <p className="mb-6 text-sm text-brand-muted">
        Welcome back to PriskatCFM
      </p>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
        className="space-y-4"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-brand-light">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
            <input
              {...passwordForm.register("email")}
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-lg border border-brand-border py-2.5 pl-10 pr-4 text-sm bg-brand-surface text-brand-light focus:border-brand-blue focus:outline-none"
            />
          </div>
          {passwordForm.formState.errors.email && (
            <p className="mt-1 text-xs text-red-600">
              {passwordForm.formState.errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-brand-light">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
            <input
              {...passwordForm.register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="Min. 6 characters"
              className="w-full rounded-lg border border-brand-border py-2.5 pl-10 pr-10 text-sm bg-brand-surface text-brand-light focus:border-brand-blue focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-light"
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
          Log In
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-brand-muted">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-brand-gold hover:underline"
        >
          Join PriskatCFM
        </Link>
      </p>
    </div>
  );
}
