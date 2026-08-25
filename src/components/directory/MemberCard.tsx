import Image from "next/image";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import type { Profile } from "@/lib/types/database.types";

type Props = {
  member: Pick<Profile, "id" | "username" | "full_name" | "avatar_url" | "bio" | "skills" | "role">;
};

export default function MemberCard({ member }: Props) {
  return (
    <Link
      href={`/directory/${member.username}`}
      className="group flex flex-col items-center card-3d p-5 shadow-sm hover:shadow-md text-center transition-all"
    >
      {member.avatar_url ? (
        <Image
          src={member.avatar_url}
          alt={member.full_name}
          width={64}
          height={64}
          className="rounded-full object-cover mb-3"
        />
      ) : (
        <div className="h-16 w-16 rounded-full bg-brand-bg flex items-center justify-center text-brand-gold font-bold text-xl mb-3">
          {member.full_name[0]}
        </div>
      )}
      <h3 className="font-semibold text-white group-hover:text-brand-gold transition-colors">
        {member.full_name}
      </h3>
      <p className="text-xs text-brand-muted mb-2">@{member.username}</p>

      {member.role !== "member" && (
        <Badge variant={member.role === "admin" ? "gold" : "blue"} className="mb-2">
          {member.role}
        </Badge>
      )}

      {member.bio && (
        <p className="text-xs text-brand-muted line-clamp-2 mt-1">{member.bio}</p>
      )}

      {member.skills && member.skills.length > 0 && (
        <div className="mt-3 flex flex-wrap justify-center gap-1">
          {member.skills.slice(0, 3).map((s: string) => (
            <Badge key={s} variant="gray" className="text-xs">{s}</Badge>
          ))}
          {member.skills.length > 3 && (
            <span className="text-xs text-brand-muted">+{member.skills.length - 3}</span>
          )}
        </div>
      )}
    </Link>
  );
}
