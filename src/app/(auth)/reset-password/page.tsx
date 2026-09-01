"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import { Lock, Eye, EyeOff } from "lucide-react";

const resetSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetForm = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  });

  async function onSubmit(data: ResetForm) {
    setError(null);
    setSuccess(false);
    
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: data.password
    });

    if (error) {
      setError(error.message);
      return;
    }
    
    setSuccess(true);
    setTimeout(() => {
      router.push("/");
    }, 2000);
  }

  return (
    <div>
      <h2 className="mb-1 text-xl font-bold text-white">Create New Password</h2>
      <p className="mb-6 text-sm text-brand-muted">
        Your new password must be at least 6 characters long.
      </p>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success ? (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-6 text-center">
          <h3 className="text-green-800 font-bold mb-2">Password Updated!</h3>
          <p className="text-sm text-green-700">
            Your password has been successfully updated. Redirecting to home...
          </p>
        </div>
      ) : (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-light">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
              <input
                {...form.register("password")}
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
            {form.formState.errors.password && (
              <p className="mt-1 text-xs text-red-600">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-brand-light">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
              <input
                {...form.register("confirmPassword")}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                className="w-full rounded-lg border border-brand-border py-2.5 pl-10 pr-10 text-sm bg-brand-surface text-brand-light focus:border-brand-blue focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-light"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {form.formState.errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            loading={form.formState.isSubmitting}
          >
            Update Password
          </Button>
        </form>
      )}
    </div>
  );
}

