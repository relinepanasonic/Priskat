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
  angkatan: z.string().min(1, "Required"),
  kota: z.string().min(1, "Select a kota"),
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
  const [kotaOptions, setKotaOptions] = useState<string[]>([]);
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
      camps: [{ camp: "", angkatan: "", kota: "" }],
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

    async function fetchKota() {
      const { data } = await supabase.from("alumni_database").select("city");
      if (data) {
        const uniqueCities = Array.from(new Set(data.map(d => d.city).filter(Boolean))).sort();
        setKotaOptions(uniqueCities);
      }
    }
    fetchKota();
  }, [setValue, supabase]);

  async function onSubmit(data: FormValues) {
    setError(null);
    
    // We store the first camp's info in the legacy fields for backward compatibility,
    // and the full history in camp_history.
    const primaryCamp = data.camps[0];
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
          angkatan: primaryCamp.angkatan,
          kota: primaryCamp.kota,
          camp_history: data.camps, // Store full array of objects
          role: data.role || "member",
        },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });
    if (error) { setError(error.message); return; } if (signUpData?.session) { router.push("/"); router.refresh(); return; } setSuccess(true);
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
      <h2 className="mb-1 text-xl font-bold text-white">Join the Community</h2>
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
        
        <div className="bg-[#111] p-3 rounded-xl border border-brand-border">
          <label className="mb-2 block text-sm font-bold text-white">Alumni / Camp (Required)</label>
          <p className="text-xs text-brand-muted mb-3">Please fill out the camps you have completed.</p>
          
          <div className="space-y-3">
            {fields.map((item, index) => (
              <div key={item.id} className="flex items-center gap-2">
                <div className="flex-1 grid grid-cols-3 gap-2">
                  <div>
                    <select
                      {...register(`camps.${index}.camp`)}
                      className="w-full rounded-lg border border-brand-border py-2 px-2 text-xs bg-[#1a1d24] text-white focus:border-brand-gold focus:outline-none"
                    >
                      <option value="">Camp...</option>
                      {ALUMNI_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    {errors.camps?.[index]?.camp && <p className="text-[10px] text-red-500 mt-1">{errors.camps[index]?.camp?.message}</p>}
                  </div>
                  <div>
                    <input
                      {...register(`camps.${index}.angkatan`)}
                      placeholder="Angk..."
                      className="w-full rounded-lg border border-brand-border py-2 px-2 text-xs bg-[#1a1d24] text-white focus:border-brand-gold focus:outline-none"
                    />
                    {errors.camps?.[index]?.angkatan && <p className="text-[10px] text-red-500 mt-1">{errors.camps[index]?.angkatan?.message}</p>}
                  </div>
                  <div>
                    <select
                      {...register(`camps.${index}.kota`)}
                      className="w-full rounded-lg border border-brand-border py-2 px-2 text-xs bg-[#1a1d24] text-white focus:border-brand-gold focus:outline-none"
                    >
                      <option value="">Kota...</option>
                      {kotaOptions.map(kota => (
                        <option key={kota} value={kota}>{kota}</option>
                      ))}
                    </select>
                    {errors.camps?.[index]?.kota && <p className="text-[10px] text-red-500 mt-1">{errors.camps[index]?.kota?.message}</p>}
                  </div>
                </div>
                {fields.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => remove(index)}
                    className="p-2 bg-red-900/30 text-red-500 rounded-lg hover:bg-red-900/50 flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => append({ camp: "", angkatan: "", kota: "" })}
            className="mt-3 flex items-center gap-1 text-xs font-bold text-brand-gold hover:text-white transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Add new camp...
          </button>
          {errors.camps && !Array.isArray(errors.camps) && <p className="mt-2 text-xs text-red-600">{errors.camps.message}</p>}
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


