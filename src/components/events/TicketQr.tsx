"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { ticketPayload } from "@/lib/eventReg";

/** The QR code of a ticket, drawn on the phone (white square so every scanner can read it). */
export default function TicketQr({ code, size = 220 }: { code: string; size?: number }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    QRCode.toDataURL(ticketPayload(code), { width: size * 2, margin: 2, errorCorrectionLevel: "M" })
      .then((u) => { if (alive) setSrc(u); })
      .catch(() => { if (alive) setSrc(null); });
    return () => { alive = false; };
  }, [code, size]);
  return (
    <div className="mx-auto flex items-center justify-center rounded-2xl bg-white p-2" style={{ width: size + 16, height: size + 16 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {src ? <img src={src} alt="QR tiket" width={size} height={size} /> : <span className="text-xs text-gray-500">Membuat QR…</span>}
    </div>
  );
}
