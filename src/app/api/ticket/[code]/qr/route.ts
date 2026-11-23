import { qrPng } from "@/lib/eventTicket";

/** The QR code of a ticket as a picture (used in the confirmation email and on the ticket page). */
export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!/^[0-9a-f]{32}$/i.test(code)) return new Response("bad code", { status: 400 });
  const png = await qrPng(code.toLowerCase(), 600);
  return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=86400, immutable" } });
}
