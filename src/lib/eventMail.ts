import { formatDate, formatTime } from "@/lib/utils";
import { SITE_URL, ticketLink } from "@/lib/eventReg";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * The confirmation email (Indonesian): thanks, when and where, and the reminder to bring the QR code.
 * The QR image is a link to our own picture of it, so mail apps that hide data images still show it.
 */
export async function sendRegistrationEmail(p: {
  to: string; name: string; event: string; start: string | null; location: string | null; code: string; passwordLink?: string | null;
}): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  const when = p.start ? `${formatDate(p.start)}, pukul ${formatTime(p.start)} WIB` : "";
  const ticket = ticketLink(p.code);
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#1f2937;line-height:1.6">
    <div style="background:#121417;padding:20px;text-align:center;border-radius:12px 12px 0 0"><span style="color:#D6B072;font-size:20px;font-weight:bold;letter-spacing:2px">RUANG IMAN</span></div>
    <div style="border:1px solid #e5e7eb;border-top:0;padding:24px;border-radius:0 0 12px 12px">
      <p>Shalom ${esc(p.name)},</p>
      <p>Terima kasih sudah mendaftar di <b>${esc(p.event)}</b>. Pendaftaranmu sudah kami catat dengan baik.</p>
      ${when || p.location ? `<p style="background:#f9fafb;border-radius:8px;padding:12px">${when ? `<b>Waktu:</b> ${esc(when)}<br>` : ""}${p.location ? `<b>Tempat:</b> ${esc(p.location)}` : ""}</p>` : ""}
      <p><b>Mohon bawa QR Code di bawah ini saat hadir di acara</b>, boleh dicetak atau ditunjukkan dari ponselmu. Tunjukkan kepada panitia di pintu masuk supaya kehadiranmu dapat dicatat.</p>
      <p style="text-align:center"><img src="${SITE_URL}/api/ticket/${p.code}/qr" width="240" height="240" alt="QR Code ${esc(p.name)}" style="border:1px solid #e5e7eb;border-radius:12px"><br><b style="font-size:18px">${esc(p.name)}</b></p>
      <p style="text-align:center"><a href="${ticket}" style="background:#D6B072;color:#121417;text-decoration:none;font-weight:bold;padding:12px 24px;border-radius:10px;display:inline-block">Buka dan unduh tiket</a></p>
      ${p.passwordLink ? `<p style="font-size:13px;color:#4b5563">Kami juga membuatkan akun <b>Ruang Iman</b> dengan emailmu ini. Kalau mau masuk ke aplikasinya, <a href="${p.passwordLink}">atur kata sandimu di sini</a>.</p>` : ""}
      <p>Sampai jumpa di acara. Tuhan memberkati.</p>
      <p style="font-size:12px;color:#9ca3af">Ruang Iman, tempat berkumpul, belajar, dan terhubung.</p>
    </div></div>`;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EVENT_MAIL_FROM || "Ruang Iman <noreply@ruangiman.com>",
        to: [p.to],
        subject: `Pendaftaran berhasil: ${p.event}`,
        html,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
