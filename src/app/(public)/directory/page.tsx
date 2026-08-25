import { createClient } from "@/lib/supabase/server";
import { Search, Users } from "lucide-react";
import MemberCard from "@/components/directory/MemberCard";
import SearchBar from "@/components/directory/SearchBar";
import Pagination from "@/components/ui/Pagination";
import { Suspense } from "react";
import type { Profile } from "@/lib/types/database.types";

const PAGE_SIZE = 20;

interface Props {
  searchParams: Promise<{ q?: string; page?: string }>;
}

type MemberRow = Pick<Profile, "id" | "username" | "full_name" | "avatar_url" | "bio" | "skills" | "interests" | "role">;

export default async function DirectoryPage({ searchParams }: Props) {
  const { q, page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();

  let query = supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url, bio, skills, interests, role", { count: "exact" })
    .order("full_name")
    .range(from, to);

  if (q && q.trim()) {
    query = query.or(
      `full_name.ilike.%${q}%,username.ilike.%${q}%,bio.ilike.%${q}%`
    );
  }

  const { data, count } = await query;
  const members = data as MemberRow[] | null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-blue">Member Directory</h1>
        <p className="mt-1 text-stone-500">Find and connect with PriskatCFM members</p>
      </div>

      <Suspense>
        <SearchBar placeholder="Search by name, username, or bio…" />
      </Suspense>

      {members && members.length > 0 ? (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {members.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
          <Suspense>
            <Pagination currentPage={page} totalCount={count ?? 0} pageSize={PAGE_SIZE} />
          </Suspense>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Users className="h-12 w-12 text-stone-200 mb-3" />
          <p className="text-stone-500">
            {q ? `No members found for "${q}".` : "No members yet."}
          </p>
        </div>
      )}
    </div>
  );
}
