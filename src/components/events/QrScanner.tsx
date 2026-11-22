"use client";

import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { Camera } from "lucide-react";

/**
 * Camera that reads QR codes. Calls onScan(text) once per code (the same code is ignored for a few seconds).
 * If the camera is not allowed, the person is told how to allow it.
 */
export default function QrScanner({ onScan, paused }: { onScan: (text: string) => void; paused?: boolean }) {
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const last = useRef<{ text: string; at: number }>({ text: "", at: 0 });
  const pausedRef = useRef(!!paused);
  const cb = useRef(onScan);
  pausedRef.current = !!paused;
  cb.current = onScan;

  useEffect(() => {
    let stream: MediaStream | null = null;
    let raf = 0;
    let stopped = false;
    let tick = 0;

    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error("unsupported");
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 } }, audio: false });
        if (stopped) { stream.getTracks().forEach((t) => t.stop()); return; }
        const v = video.current!;
        v.srcObject = stream;
        await v.play();
        setReady(true);

        const loop = () => {
          raf = requestAnimationFrame(loop);
          if (pausedRef.current || !v.videoWidth) return;
          if (++tick % 4 !== 0) return; // about 15 reads a second is plenty
          const c = canvas.current!;
          const w = Math.min(640, v.videoWidth);
          const h = Math.round((v.videoHeight / v.videoWidth) * w);
          c.width = w; c.height = h;
          const ctx = c.getContext("2d", { willReadFrequently: true })!;
          ctx.drawImage(v, 0, 0, w, h);
          const img = ctx.getImageData(0, 0, w, h);
          const hit = jsQR(img.data, w, h, { inversionAttempts: "dontInvert" });
          if (hit?.data) {
            const now = Date.now();
            if (hit.data === last.current.text && now - last.current.at < 4000) return;
            last.current = { text: hit.data, at: now };
            cb.current(hit.data);
          }
        };
        loop();
      } catch (e) {
        const name = (e as Error).name;
        setError(
          name === "NotAllowedError" || name === "SecurityError"
            ? "Kamera belum diizinkan. Buka Pengaturan HP, Aplikasi, Ruang Iman, Izin, lalu izinkan Kamera."
            : "Kamera tidak bisa dibuka di perangkat ini. Gunakan kolom kode di bawah."
        );
      }
    })();

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-[#333] bg-black">
      {error ? (
        <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 p-6 text-center">
          <Camera className="h-8 w-8 text-brand-muted" />
          <p className="text-sm text-brand-light">{error}</p>
        </div>
      ) : (
        <div className="relative">
          <video ref={video} playsInline muted className="aspect-square w-full object-cover" />
          <canvas ref={canvas} className="hidden" />
          <div className="pointer-events-none absolute inset-8 rounded-2xl border-2 border-brand-gold/80" />
          {!ready && <p className="absolute inset-0 flex items-center justify-center text-sm text-brand-muted">Membuka kamera…</p>}
        </div>
      )}
    </div>
  );
}
