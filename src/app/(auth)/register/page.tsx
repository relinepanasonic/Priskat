"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import { Mail, Lock, User, Eye, EyeOff, Plus, Trash2 } from "lucide-react";

const campSchema = z.object({
  camp: z.string().min(1, "Select a camp"),
});

const schema = z
  .object({
    full_name: z.string().min(2, "Name must be at least 2 characters"),
    username: z.string().min(3, "Username must be at least 3 characters").regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores"),
    phone: z.string().regex(/^08[0-9]+$/, "Phone must start with 08 and contain only numbers"),
    email: z.string().email("Invalid email address"),
    camps: z.array(campSchema).min(1, "Please add at least one camp"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string(),
    role: z.string().optional(),
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
  const supabase = createClient();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue
  } = useForm<FormValues>({ 
    resolver: zodResolver(schema),
    defaultValues: { 
      camps: [{ camp: "" }],
      role: "member"
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "camps"
  });
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const inviteName = params.get("name");
      const inviteRole = params.get("role");
      
      if (inviteName) setValue("full_name", inviteName);
      if (inviteRole) setValue("role", inviteRole);
    }
  }, [setValue]);

  async function onSubmit(data: FormValues) {
    setError(null);
    
    const completedModules = data.camps.map(c => c.camp);

    const { data: signUpData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { 
          full_name: data.full_name,
          username: data.username,
          phone: data.phone,
          completed_modules: completedModules,
          camp_history: data.camps,
          role: data.role || "member",
        },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      return;
    }

    if (signUpData.user && signUpData.user.identities && signUpData.user.identities.length === 0) {
      setError("This email is already registered.");
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#1a1d24] px-4 py-12 text-center sm:px-6 lg:px-8">
        <h2 className="mt-6 text-3xl font-bold tracking-tight text-white font-serif">Check your email</h2>
        <p className="mt-2 text-sm text-gray-400">
          We sent a confirmation link to your email. Please verify your account to continue.
        </p>
        <div className="mt-6">
          <Link href="/login" className="text-brand-gold hover:text-white font-semibold">
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1a1d24] px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-brand-gold font-serif">
            Create an Account
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Join the Alumni CFM community
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="rounded-md bg-red-900/50 border border-red-500 p-4">
              <div className="text-sm text-red-200">{error}</div>
            </div>
          )}

          <div className="space-y-4 rounded-xl bg-[#22252d] p-6 border border-[#333]">
            {/* Full Name */}
            <div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-4 w-4 text-gray-500" />
                </div>
                <input
                  type="text"
                  placeholder="Full Name"
                  {...register("full_name")}
                  className="block w-full rounded-lg border border-brand-border bg-[#1a1d24] py-2.5 pl-10 pr-3 text-sm text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
                />
              </div>
              {errors.full_name && <p className="mt-1 text-xs text-red-600">{errors.full_name.message}</p>}
            </div>

            {/* Username & Phone Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Username (e.g. jdoe123)"
                  {...register("username")}
                  className="block w-full rounded-lg border border-brand-border bg-[#1a1d24] py-2.5 px-3 text-sm text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
                />
                {errors.username && <p className="mt-1 text-xs text-red-600">{errors.username.message}</p>}
              </div>
              <div>
                <input
                  type="tel"
                  placeholder="Phone (08...)"
                  {...register("phone")}
                  className="block w-full rounded-lg border border-brand-border bg-[#1a1d24] py-2.5 px-3 text-sm text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
                />
                {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
              </div>
            </div>
            
            {/* Dynamic Camps Selection */}
            <div className="mt-4 pt-4 border-t border-brand-border/50">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Which Camp are you alumni of?</label>
              
              {fields.map((field, index) => (
                <div key={field.id} className="relative group mb-3">
                  <select
                    {...register(`camps.${index}.camp`)}
                    className="w-full rounded-lg border border-brand-border py-2.5 px-3 text-sm bg-[#1a1d24] text-white focus:border-brand-gold focus:outline-none"
                  >
                    <option value="">Select Camp...</option>
                    {ALUMNI_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  {errors.camps?.[index]?.camp && <p className="text-[10px] text-red-500 mt-1">{errors.camps[index]?.camp?.message}</p>}
                  
                  {fields.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => remove(index)}
                      className="absolute top-2 right-2 bg-red-900/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={() => append({ camp: "" })}
                className="mt-2 flex items-center gap-1 text-xs font-bold text-brand-gold hover:text-white transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> Add another camp...
              </button>
              {errors.camps && !Array.isArray(errors.camps) && <p className="mt-2 text-xs text-red-600">{errors.camps.message}</p>}
            </div>

            {/* Email */}
            <div className="pt-4 border-t border-brand-border/50">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                </div>
                <input
                  type="email"
                  placeholder="Email address"
                  {...register("email")}
                  className="block w-full rounded-lg border border-brand-border bg-[#1a1d24] py-2.5 pl-10 pr-3 text-sm text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-4 w-4 text-gray-500" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  {...register("password")}
                  className="block w-full rounded-lg border border-brand-border bg-[#1a1d24] py-2.5 pl-10 pr-10 text-sm text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500 hover:text-gray-300" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500 hover:text-gray-300" />
                  )}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-4 w-4 text-gray-500" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  {...register("confirm_password")}
                  className="block w-full rounded-lg border border-brand-border bg-[#1a1d24] py-2.5 pl-10 pr-10 text-sm text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
                />
              </div>
              {errors.confirm_password && <p className="mt-1 text-xs text-red-600">{errors.confirm_password.message}</p>}
            </div>
          </div>

          <Button type="submit" className="w-full" loading={isSubmitting}>
            Create Account
          </Button>

          <p className="text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-brand-gold hover:text-white">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
