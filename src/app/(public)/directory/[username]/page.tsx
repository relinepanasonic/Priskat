import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";
import type { Profile } from "@/lib/types/database.types";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("full_name, bio")
    .eq("username", username)
    .single();
  const row = data as Pick<Profile, "full_name" | "bio"> | null;
  return { title: row?.full_name ?? username, description: row?.bio ?? "" };
}

export default async function MemberProfilePage({ params }: Props) {
  const { username } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  const member = data as Profile | null;
  if (!member) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Link href="/directory" className="mb-6 inline-flex items-center gap-1 text-sm text-brand-muted hover:text-brand-gold transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Directory
      </Link>

      <div className="card-3d p-8 shadow-sm">
        <div className="flex items-start gap-6">
          {member.avatar_url ? (
            <Image
              src={member.avatar_url}
              alt={member.full_name}
              width={80}
              height={80}
              className="rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="h-20 w-20 flex-shrink-0 rounded-full bg-brand-gold text-brand-dark flex items-center justify-center text-white text-2xl font-bold">
              {member.full_name[0]}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-white">{member.full_name}</h1>
            <p className="text-brand-muted">@{member.username}</p>
            {member.role !== "member" && (
              <Badge variant={member.role === "admin" ? "gold" : "blue"} className="mt-2">
                {member.role}
              </Badge>
            )}
          </div>
        </div>

        {member.bio && (
          <p className="mt-6 text-brand-light leading-relaxed">{member.bio}</p>
        )}

        {member.skills && member.skills.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-2 text-sm font-semibold text-brand-light">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {member.skills.map((s: string) => (
                <Badge key={s} variant="blue">{s}</Badge>
              ))}
            </div>
          </div>
        )}

        {member.interests && member.interests.length > 0 && (
          <div className="mt-4">
            <h2 className="mb-2 text-sm font-semibold text-brand-light">Interests</h2>
            <div className="flex flex-wrap gap-2">
              {member.interests.map((i: string) => (
                <Badge key={i} variant="gray">{i}</Badge>
              ))}
            </div>
          </div>
        )}

        <p className="mt-6 text-xs text-brand-muted">
          Member since {formatDate(member.created_at)}
        </p>
      </div>
    </div>
  );
}
