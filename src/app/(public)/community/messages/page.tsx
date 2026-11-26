import { redirect } from "next/navigation";

export default async function MessagesIndex({
  searchParams,
}: {
  searchParams: Promise<{ u?: string; t?: string }>;
}) {
  const sp = await searchParams;
  const qs = new URLSearchParams();
  if (sp.u) qs.set("u", sp.u);
  if (sp.t) qs.set("t", sp.t);
  const query = qs.toString();
  redirect(query ? `/community/messages/private?${query}` : "/community/messages/private");
}
