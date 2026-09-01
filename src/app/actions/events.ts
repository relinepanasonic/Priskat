"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
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

/* ---- Community Center "Promotion": one event, optional News push --- */

const promoSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  event_date: z.string().min(1),
  end_date: z.string().optional(),
  location: z.string().min(1),
  maps_url: z.string().url().optional().or(z.literal("")),
  banner_image_url: z.string().optional(),
  push_to_news: z.string().optional(), // checkbox -> "on" | undefined
});

export async function promoteEvent(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: { _form: "Not signed in" } };

  const parsed = promoSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };
  const d = parsed.data;

  const { data: ev, error } = await supabase
    .from("events" as any)
    .insert({
      author_id: user.id,
      title: d.title,
      description: d.description,
      event_date: d.event_date,
      end_date: d.end_date || null,
      location: d.location,
      maps_url: d.maps_url || null,
      banner_image_url: d.banner_image_url || null,
      status: "published",
    })
    .select("id")
    .single();

  if (error) return { error: { _form: error.message } };

  let newsSlug: string | null = null;
  if (d.push_to_news === "on") {
    const slug = slugify(d.title) + "-" + Date.now().toString(36);
    const when = new Date(d.event_date).toLocaleString("en-GB", {
      dateStyle: "full",
      timeStyle: "short",
    });
    const body =
      `${d.description}\n\n**When:** ${when}\n**Where:** ${d.location}` +
      (d.maps_url ? `\n**Map:** ${d.maps_url}` : "");
    const { error: nErr } = await supabase.from("news_posts" as any).insert({
      author_id: user.id,
      title: d.title,
      slug,
      body,
      category: "Event",
      cover_image_url: d.banner_image_url || null,
      status: "published",
      published_at: new Date().toISOString(),
    });
    if (!nErr) newsSlug = slug;
  }

  revalidatePath("/events");
  revalidatePath("/news");
  revalidatePath("/admin/communities");
  revalidatePath("/");
  return {
    ok: true as const,
    eventId: (ev as { id?: string } | null)?.id ?? null,
    newsSlug,
  };
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
