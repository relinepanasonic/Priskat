"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";

const schema = z
  .object({
    full_name: z.string().min(2, "Name must be at least 2 characters"),
    username: z.string().min(3, "Username must be at least 3 characters").regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores"),
    phone: z.string().regex(/^08[0-9]+$/, "Phone must start with 08 and contain only numbers"),
    email: z.string().email("Invalid email address"),
    alumni: z.array(z.string()).min(1, "Please select at least one alumni group"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string(),
    role: z.string().optional(), // Added role field to pass through to Supabase
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

type FormValues = z.infer<typeof schema>;

const ALUMNI_OPTIONS = [
  "Pria Sejati",
  "Youngman",
  "Bapa Sejati",
  "Patriot",
  "Wanita Berhikmat",
  "Young Woman"
];

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue
  } = useForm<FormValues>({ 
    resolver: zodResolver(schema),
    defaultValues: { alumni: [], role: "member" }
  });
  
  // Read URL parameters on mount to pre-fill the form
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const inviteName = params.get("name");
      const inviteRole = params.get("role");
      
      if (inviteName) setValue("full_name", inviteName);
      if (inviteRole) setValue("role", inviteRole);
    }
  }, [setValue]);
  
  const selectedAlumni = watch("alumni") || [];

  async function onSubmit(data: FormValues) {
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { 
          full_name: data.full_name,
          username: data.username,
          phone: data.phone,
          completed_modules: data.alumni,
          role: data.role || "member",
        },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      return;
    }
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <Mail className="h-7 w-7 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-white">Verify your email</h2>
        <p className="mt-2 text-sm text-brand-muted">
          We&apos;ve sent a confirmation link to your email. Click it to
          activate your account.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block text-sm text-brand-gold hover:underline"
        >
          Back to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-1 text-xl font-bold text-white">Join PriskatCFM</h2>
      <p className="mb-6 text-sm text-brand-muted">Create your community account</p>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-brand-light">Nama</label>
          <input
            {...register("full_name")}
            placeholder="Your full name"
            className="w-full rounded-lg border border-brand-border py-2.5 px-4 text-sm bg-brand-surface text-brand-light focus:border-brand-blue focus:outline-none"
          />
          {errors.full_name && <p className="mt-1 text-xs text-red-600">{errors.full_name.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-brand-light">Username</label>
          <input
            {...register("username")}
            placeholder="johndoe"
            className="w-full rounded-lg border border-brand-border py-2.5 px-4 text-sm bg-brand-surface text-brand-light focus:border-brand-blue focus:outline-none"
          />
          {errors.username && <p className="mt-1 text-xs text-red-600">{errors.username.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-brand-light">No HP (WhatsApp)</label>
          <input
            {...register("phone")}
            placeholder="08xxxxxxxxxx"
            className="w-full rounded-lg border border-brand-border py-2.5 px-4 text-sm bg-brand-surface text-brand-light focus:border-brand-blue focus:outline-none"
          />
          {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-brand-light">Email</label>
          <input
            {...register("email")}
            type="email"
            placeholder="you@example.com"
            className="w-full rounded-lg border border-brand-border py-2.5 px-4 text-sm bg-brand-surface text-brand-light focus:border-brand-blue focus:outline-none"
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>
        
        <div>
          <label className="mb-2 block text-sm font-medium text-brand-light">Alumni</label>
          <div className="grid grid-cols-2 gap-2">
            {ALUMNI_OPTIONS.map(opt => (
              <label key={opt} className="flex items-center space-x-2 bg-[#1a1d24] p-2 rounded-lg border border-[#333] cursor-pointer hover:border-brand-gold transition-colors">
                <input
                  type="checkbox"
                  value={opt}
                  className="rounded border-[#555] text-brand-gold focus:ring-brand-gold"
                  checked={selectedAlumni.includes(opt)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setValue("alumni", [...selectedAlumni, opt]);
                    } else {
                      setValue("alumni", selectedAlumni.filter(a => a !== opt));
                    }
                  }}
                />
                <span className="text-xs text-brand-light">{opt}</span>
              </label>
            ))}
          </div>
          {errors.alumni && <p className="mt-1 text-xs text-red-600">{errors.alumni.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-brand-light">Password</label>
          <div className="relative">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="Min. 8 characters"
              className="w-full rounded-lg border border-brand-border py-2.5 pl-4 pr-10 text-sm bg-brand-surface text-brand-light focus:border-brand-blue focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-light"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-brand-light">Confirm Password</label>
          <div className="relative">
            <input
              {...register("confirm_password")}
              type={showPassword ? "text" : "password"}
              placeholder="Repeat your password"
              className="w-full rounded-lg border border-brand-border py-2.5 pl-4 pr-10 text-sm bg-brand-surface text-brand-light focus:border-brand-blue focus:outline-none"
            />
          </div>
          {errors.confirm_password && <p className="mt-1 text-xs text-red-600">{errors.confirm_password.message}</p>}
        </div>

        <Button type="submit" className="w-full mt-2" loading={isSubmitting}>
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-brand-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand-gold hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}
