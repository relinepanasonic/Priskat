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
    full_name: z.string().min(1, "Full name is required"),
    username: z.string().min(3, "Username must be at least 3 characters"),
    phone: z.string().min(5, "Phone number is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirm_password: z.string(),
    community_id: z.string().min(1, "Please select a community"),
    role: z.string().optional(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [communities, setCommunities] = useState<{id: string, name: string}[]>([]);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, dirtyFields },
    setValue,
    watch
  } = useForm<FormValues>({ 
    resolver: zodResolver(schema),
    defaultValues: { 
      role: "member"
    }
  });

  const fullNameValue = watch("full_name");

  useEffect(() => {
    if (fullNameValue && !dirtyFields.username) {
      // Auto generate username: lowercase, remove special chars, add random 3 digits
      const baseName = fullNameValue.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 15);
      const randomNum = Math.floor(100 + Math.random() * 900);
      setValue("username", `${baseName}${randomNum}`, { shouldValidate: true });
    }
  }, [fullNameValue, dirtyFields.username, setValue]);

  // Extract invite data if present
  useEffect(() => {
    async function fetchData() {
      const { data: cData } = await supabase.from("communities").select("id, name").order("name");
      if (cData) setCommunities(cData);
    }
    fetchData();
    
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const email = searchParams.get("email");
      if (email) setValue("email", email);
    }
  }, [setValue, supabase]);

  async function onSubmit(data: FormValues) {
    setError(null);
    
    // Check if username is taken
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", data.username.toLowerCase())
      .single();
      
    if (existingUser) {
      setError("Username is already taken");
      return;
    }

    const { data: signUpData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.full_name,
          username: data.username.toLowerCase(),
          phone: data.phone,
          community_id: data.community_id,
          role: data.role || "member",
        },
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

    // No email confirmation step — go straight into the app.
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1a1d24] p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md space-y-8">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-brand-gold">Create an Account</h2>
          <p className="mt-2 text-sm text-brand-muted">
            Join Ruang Iman
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="rounded-md bg-red-900/50 border border-red-500 p-4">
              <div className="text-sm text-red-200">{error}</div>
            </div>
          )}

          <div className="space-y-4 rounded-xl bg-[#22252d] p-4 sm:p-6 border border-[#333]">
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
                  placeholder="Username"
                  {...register("username")}
                  className="block w-full rounded-lg border border-brand-border bg-[#1a1d24] py-2.5 px-3 text-sm text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
                />
                {errors.username && <p className="mt-1 text-xs text-red-600">{errors.username.message}</p>}
              </div>
              <div>
                <input
                  type="tel"
                  placeholder="Phone"
                  {...register("phone")}
                  className="block w-full rounded-lg border border-brand-border bg-[#1a1d24] py-2.5 px-3 text-sm text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
                />
                {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
              </div>
              </div>

              {/* Community Information */}
              <div className="mt-4 pt-4 border-t border-brand-border/50">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Community Details</label>
                <div>
                  <select
                    {...register("community_id")}
                    className="w-full rounded-lg border border-brand-border py-2.5 px-3 text-sm bg-[#1a1d24] text-white focus:border-brand-gold focus:outline-none"
                  >
                    <option value="">Select Main Community...</option>
                    {communities.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {errors.community_id && <p className="text-[10px] text-red-500 mt-1">{errors.community_id.message}</p>}
                </div>
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
