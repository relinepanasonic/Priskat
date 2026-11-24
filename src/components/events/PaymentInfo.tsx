"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { rupiah } from "@/lib/eventReg";

const serif = { fontFamily: "'Lora', Georgia, serif" };

/** 0812... or +62812... becomes 62812... for wa.me */
export function waNumber(raw: string | null | undefined) {
  let n = String(raw ?? "").replace(/[^\d+]/g, "");
  if (n.startsWith("+")) n = n.slice(1);
  if (n.startsWith("0")) n = "62" + n.slice(1);
  return n;
}

/** How to pay: the bank, the account number with a copy button, and the button to send the transfer proof to the Bendahara's WhatsApp. */
export default function PaymentInfo({ amount, bank, account, holder, note, treasurerWa, name, eventTitle }: {
  amount: number; bank: string | null; account: string | null; holder: string | null; note?: string | null; treasurerWa?: string | null; name: string; eventTitle: string;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => { try { await navigator.clipboard.writeText(account ?? ""); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* ignore */ } };
  const wa = waNumber(treasurerWa);
  const text = `Halo, saya ${name}. Saya sudah transfer ${rupiah(amount)} untuk ${eventTitle}. Ini bukti transfer saya.`;
  return (
    <div className="rounded-2xl border border-[#333] bg-[#1a1d24] p-4 text-left">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold">Pembayaran</p>
      <p className="mt-1 text-2xl font-bold text-white" style={serif}>{rupiah(amount)}</p>
      <div className="mt-3 space-y-1 rounded-xl bg-[#14171c] p-3 text-sm">
        <p className="text-brand-muted">Transfer ke</p>
        <p className="font-semibold text-white">{bank}</p>
        <p className="flex items-center gap-2 text-xl font-bold tracking-wider text-brand-gold">
          {account}
          {account && <button type="button" onClick={copy} aria-label="Salin nomor rekening" className="rounded-full border border-brand-gold/40 p-1.5"><Copy className="h-3.5 w-3.5" /></button>}
          {copied && <span className="text-xs font-semibold text-emerald-300">Tersalin</span>}
        </p>
        <p className="text-brand-light">a.n. {holder}</p>
      </div>
      {note && <p className="mt-3 text-xs leading-relaxed text-brand-light">{note}</p>}
      {wa ? (
        <a href={`https://wa.me/${wa}?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer"
          className="mt-4 flex w-full items-center justify-center rounded-xl bg-emerald-500 py-3 text-sm font-bold text-emerald-950">Kirim bukti ke WhatsApp Bendahara</a>
      ) : (
        <p className="mt-3 text-[11px] text-brand-muted">Setelah transfer, kirim bukti ke panitia.</p>
      )}
      <p className="mt-2 text-center text-[11px] text-brand-muted">QR Code tiket muncul setelah bendahara mengonfirmasi pembayaranmu.</p>
    </div>
  );
}
