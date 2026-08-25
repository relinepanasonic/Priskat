"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const eventSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  location: z.string().min(1),
  event_date: z.string().min(1),
  end_date: z.string().optional(),
  capacity: z.string().optional(),
  status: z.enum(["draft", "published", "cancelled"]),
  banner_image_url: z.string().optional(),
});

export async function createEvent(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const raw = Object.fromEntries(formData.entries());
  const parsed = eventSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const { title, description, location, event_date, end_date, capacity, status, banner_image_url } = parsed.data;

  const { error } = await supabase.from("events" as any).insert({
    author_id: user.id,
    title,
    description,
    location,
    event_date,
    end_date: end_date || null,
    capacity: capacity ? parseInt(capacity, 10) : null,
    status,
    banner_image_url: banner_image_url || null,
  });

  if (error) return { error: { _form: error.message } };

  revalidatePath("/events");
  revalidatePath("/");
  redirect("/admin/events");
}

export async function updateEvent(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const raw = Object.fromEntries(formData.entries());
  const parsed = eventSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const { title, description, location, event_date, end_date, capacity, status, banner_image_url } = parsed.data;

  const { error } = await supabase.from("events" as any).update({
    title,
    description,
    location,
    event_date,
    end_date: end_date || null,
    capacity: capacity ? parseInt(capacity, 10) : null,
    status,
    banner_image_url: banner_image_url || null,
  }).eq("id", id);

  if (error) return { error: { _form: error.message } };

  revalidatePath("/events");
  revalidatePath(`/events/${id}`);
  revalidatePath("/");
  redirect("/admin/events");
}

export async function deleteEvent(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/events");
  revalidatePath("/");
}

export async function rsvpToEvent(eventId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to RSVP" };

  // Check for existing RSVP
  const { data: existing } = await supabase
    .from("event_rsvps")
    .select("id, status")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .single();

  if (existing) {
    if (existing.status === "going" || existing.status === "waitlist") {
      return { error: "Already RSVPd" };
    }
    // Re-activate cancelled RSVP
    const { error } = await supabase
      .from("event_rsvps" as any)
      .update({ status: "going" })
      .eq("id", existing.id);
    if (error) return { error: error.message };
    return { status: "going" };
  }

  const { data, error } = await supabase.from("event_rsvps" as any).insert({
    event_id: eventId,
    user_id: user.id,
    status: "going",
  }).select("status").single();

  if (error) return { error: error.message };
  return { status: data?.status };
}

export async function cancelRSVP(eventId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

  const { error } = await supabase
    .from("event_rsvps" as any)
    .update({ status: "cancelled" })
    .eq("event_id", eventId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  return { cancelled: true };
}
