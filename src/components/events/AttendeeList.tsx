import Image from "next/image";
import Link from "next/link";

interface Attendee {
  id: string;
  full_name: string;
  avatar_url: string | null;
  username: string;
}

interface Props {
  attendees: Attendee[];
}

export default function AttendeeList({ attendees }: Props) {
  if (attendees.length === 0) return null;

  return (
    <div className="rounded-2xl border border-brand-border bg-brand-surface p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-brand-light">
        Who&apos;s Going ({attendees.length})
      </h3>
      <div className="space-y-3">
        {attendees.slice(0, 8).map((a) => (
          <Link
            key={a.id}
            href={`/directory/${a.username}`}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            {a.avatar_url ? (
              <Image
                src={a.avatar_url}
                alt={a.full_name}
                width={32}
                height={32}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-bg text-brand-gold text-xs font-semibold">
                {a.full_name[0]}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{a.full_name}</p>
              <p className="text-xs text-brand-muted">@{a.username}</p>
            </div>
          </Link>
        ))}
        {attendees.length > 8 && (
          <p className="text-xs text-brand-muted">
            +{attendees.length - 8} more going
          </p>
        )}
      </div>
    </div>
  );
}
