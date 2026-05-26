const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://jhnzlqtkjaecaazfrxnh.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const USER_EMAIL = "ruben@8signal.com";

if (!SERVICE_ROLE_KEY) { console.error("Need SUPABASE_SERVICE_ROLE_KEY"); process.exit(1); }

(async () => {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: adminUsers } = await supabase.auth.admin.listUsers();
  const target = adminUsers.users.find((u) => u.email === USER_EMAIL);
  if (!target) { console.error("no user"); process.exit(1); }

  const { data, error } = await supabase
    .from("brain_dumps")
    .select("id, title, created_at, answered_count, answers")
    .eq("user_id", target.id)
    .order("created_at", { ascending: false });
  if (error) throw error;

  console.log(`Total rows: ${data.length}\n`);
  for (const r of data) {
    const ans = Array.isArray(r.answers) ? r.answers : [];
    const filledCount = ans.filter((a) => typeof a === "string" && a.trim()).length;
    const sample = ans[0] ? String(ans[0]).slice(0, 80).replace(/\s+/g, " ") : "(no Q1)";
    console.log(
      `${r.created_at}  count=${r.answered_count}  filled=${filledCount}/${ans.length}  title="${(r.title || "").slice(0, 50)}"`
    );
    console.log(`   Q1: ${sample}`);
  }
})();
