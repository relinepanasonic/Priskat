"use client";

import { useState, useTransition } from "react";
import { rsvpToEvent, cancelRSVP } from "@/app/actions/events";
import Button from "@/components/ui/Button";
import { CheckCircle2, Clock, UserPlus } from "lucide-react";
import Link from "next/link";

interface Props {
  eventId: string;
  initialStatus: "going" | "waitlist" | "cancelled" | null;
  isFull: boolean;
  userId: string | null;
}

export default function RSVPButton({ eventId, initialStatus, isFull, userId }: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!userId) {
    return (
      <div className="text-center">
        <p className="mb-3 text-sm text-brand-muted">Sign in to RSVP for this event</p>
        <Link
          href="/login"
          className="block w-full rounded-lg bg-brand-gold text-brand-dark py-2.5 text-center text-sm font-medium text-white hover:bg-brand-gold text-brand-dark-800 transition-colors"
        >
          Sign In to RSVP
        </Link>
      </div>
    );
  }

  function handleRSVP() {
    setError(null);
    startTransition(async () => {
      const result = await rsvpToEvent(eventId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setStatus(result.status as "going" | "waitlist");
    });
  }

  function handleCancel() {
    setError(null);
    startTransition(async () => {
      const result = await cancelRSVP(eventId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setStatus("cancelled");
    });
  }

  if (status === "going") {
    return (
      <div>
        <div className="mb-3 flex items-center gap-2 text-green-600">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-medium">You&apos;re going!</span>
        </div>
        {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
        <Button variant="ghost" size="sm" onClick={handleCancel} loading={isPending} className="w-full text-brand-muted">
          Cancel RSVP
        </Button>
      </div>
    );
  }

  if (status === "waitlist") {
    return (
      <div>
        <div className="mb-3 flex items-center gap-2 text-brand-gold">
          <Clock className="h-5 w-5" />
          <span className="font-medium">You&apos;re on the waitlist</span>
        </div>
        {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
        <Button variant="ghost" size="sm" onClick={handleCancel} loading={isPending} className="w-full text-brand-muted">
          Leave Waitlist
        </Button>
      </div>
    );
  }

  return (
    <div>
      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
      {isFull ? (
        <div>
          <p className="mb-3 text-sm text-brand-muted text-center">
            This event is full.
          </p>
          <Button className="w-full" onClick={handleRSVP} loading={isPending} variant="secondary">
            <Clock className="h-4 w-4" /> Join Waitlist
          </Button>
        </div>
      ) : (
        <Button className="w-full" onClick={handleRSVP} loading={isPending}>
          <UserPlus className="h-4 w-4" /> RSVP — I&apos;m Going
        </Button>
      )}
    </div>
  );
}
