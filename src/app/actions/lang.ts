"use server";

import { cookies } from "next/headers";

export async function setLanguageCookie(lang: "id" | "en") {
  const cookieStore = await cookies();
  cookieStore.set("priskat_lang", lang, { path: "/", maxAge: 60 * 60 * 24 * 365 });
}

