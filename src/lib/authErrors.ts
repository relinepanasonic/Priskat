/** Turns Supabase auth error messages into something a member can act on. */
export function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials"))
    return "Email atau kata sandi salah. Periksa ejaan email, atau tekan \"Forgot password?\" di bawah. Kalau dulu kamu mendaftar dengan Google, pakai tombol Google di atas.";
  if (m.includes("email not confirmed")) return "Email kamu belum dikonfirmasi. Buka email dari kami dan klik tautan konfirmasinya.";
  if (m.includes("rate limit") || m.includes("too many") || m.includes("security purposes"))
    return "Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi.";
  if (m.includes("failed to fetch") || m.includes("network")) return "Koneksi bermasalah. Periksa internet kamu lalu coba lagi.";
  return message;
}
