import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const env = fs.readFileSync(".env.local", "utf8");
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);
const keyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/);
const url = urlMatch ? urlMatch[1].trim() : "";
const key = keyMatch ? keyMatch[1].trim() : "";

const supabase = createClient(url, key);

async function check() {
  const { data, error } = await supabase.from('bible_verses').select('*').eq('book_no', 70).eq('chapter', 10).order('verse');
  console.log("Error:", error);
  console.log("Data:", data.slice(0, 7));
}
check();
