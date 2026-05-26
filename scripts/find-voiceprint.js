const { createClient } = require("@supabase/supabase-js");
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const USER_EMAIL = "ruben@8signal.com";

(async () => {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const { data: adminUsers } = await supabase.auth.admin.listUsers();
  const target = adminUsers.users.find((u) => u.email === USER_EMAIL);
  const { data } = await supabase.from("brain_dumps").select("*").eq("user_id", target.id).order("created_at", { ascending: false });

  const re = /voice ?print|voice ?board|linkedin voice|public.{0,30}voice|open.?source|oss|ghostwrit|brand voice|voice.guide|voice tic|tone of voice/i;
  const hits = data.filter((r) => {
    const blob = (r.title || "") + " " + (Array.isArray(r.answers) ? r.answers.join(" ") : "");
    return re.test(blob);
  });
  console.log(`Hits: ${hits.length}\n`);
  for (const r of hits) {
    console.log("=".repeat(70));
    console.log(`${r.created_at} | ${r.title}`);
    (r.answers || []).forEach((a, i) => {
      if (a?.trim()) console.log(`\nQ${i+1}: ${a.trim().slice(0, 400)}`);
    });
    console.log();
  }
})();
