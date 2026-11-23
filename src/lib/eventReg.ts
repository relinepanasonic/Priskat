/** Event registration: shared types and small helpers (see supabase/108_event_registration.sql). */
export type RegStatus = "awaiting_payment" | "pending_review" | "approved" | "rejected" | "cancelled";

export type RegField = { key: string; label: string; type: "text" | "textarea" | "select" | "photo"; required?: boolean; options?: string[] };

export type RegSettings = {
  event_id: string;
  open: boolean;
  price: number;
  bank_name: string | null;
  bank_account: string | null;
  bank_holder: string | null;
  payment_note: string | null;
  deadline: string | null;
  fields: RegField[];
  public_code?: string | null;
  link_open?: boolean;
  link_auto_approve?: boolean;
  welcome_text?: string | null;
  ticket_size?: "a5" | "card";
  ticket_bg_url?: string | null;
  ticket_template?: string;
  ticket_gradient?: string;
};

export type Registration = {
  id: string;
  event_id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  answers: Record<string, string>;
  status: RegStatus;
  amount: number;
  proof_path: string | null;
  reject_reason: string | null;
  ticket_code: string;
  checked_in_at: string | null;
  checked_in_by?: string | null;
  created_at: string;
  email?: string | null;
  paroki?: string | null;
  source?: "account" | "link";
  group_id?: string | null;
};

export type EventGroup = { id: string; event_id: string; name: string; facilitator_crew_id: string | null };

export const SITE_URL = "https://apps.ruangiman.com";
export const registerLink = (code: string) => `${SITE_URL}/e/${code}`;
export const ticketLink = (code: string) => `${SITE_URL}/t/${code}`;

export const STATUS_LABEL: Record<RegStatus, string> = {
  awaiting_payment: "Menunggu pembayaran",
  pending_review: "Menunggu persetujuan admin",
  approved: "Disetujui",
  rejected: "Ditolak",
  cancelled: "Dibatalkan",
};

export const rupiah = (n: number) => (n <= 0 ? "Gratis" : `Rp ${n.toLocaleString("id-ID")}`);

/** What a ticket QR code holds. The scanner accepts this or the bare code. */
export const TICKET_PREFIX = "RIEVT:";
export const ticketPayload = (code: string) => `${TICKET_PREFIX}${code}`;
export const codeFromScan = (raw: string) => raw.trim().replace(/^RIEVT:/i, "").trim().toLowerCase();

/** WhatsApp number as wa.me wants it (digits, Indonesian 08... becomes 628...). Empty when there is no number. */
export const waPhone = (phone: string | null | undefined) => {
  const d = (phone ?? "").replace(/\D/g, "");
  if (!d) return "";
  return d.startsWith("0") ? `62${d.slice(1)}` : d.startsWith("62") ? d : d.length >= 9 ? d : "";
};
export const waLink = (phone: string | null | undefined, text: string) => `https://wa.me/${waPhone(phone)}?text=${encodeURIComponent(text)}`;
