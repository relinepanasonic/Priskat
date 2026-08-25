import { cookies } from "next/headers";

export async function getLanguage(): Promise<"id" | "en"> {
  const cookieStore = await cookies();
  const lang = cookieStore.get("priskat_lang")?.value;
  return lang === "en" ? "en" : "id";
}

