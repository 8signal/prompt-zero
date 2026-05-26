const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://jhnzlqtkjaecaazfrxnh.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const USER_EMAIL = "ruben@8signal.com";
const CSV_PATH = path.join(__dirname, "..", "prompt-zero-export.csv");

if (!SERVICE_ROLE_KEY) {
  console.error("ERROR: SUPABASE_SERVICE_ROLE_KEY env var is required.");
  console.error("Grab it from: Supabase Studio → Project Settings → API → service_role secret");
  process.exit(1);
}

function parseCsv(text) {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  const rows = [];
  let cur = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else { inQuotes = false; }
      } else { field += c; }
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") { cur.push(field); field = ""; }
      else if (c === "\r") {}
      else if (c === "\n") { cur.push(field); rows.push(cur); cur = []; field = ""; }
      else field += c;
    }
  }
  if (field.length > 0 || cur.length > 0) { cur.push(field); rows.push(cur); }
  return rows;
}

async function main() {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: users, error: userErr } = await supabase
    .from("users")
    .select("id")
    .limit(1);
  // ^ ignored — fallback below uses admin API
  const { data: adminUsers, error: adminErr } = await supabase.auth.admin.listUsers();
  if (adminErr) throw adminErr;
  const target = adminUsers.users.find((u) => u.email === USER_EMAIL);
  if (!target) throw new Error(`No auth user with email ${USER_EMAIL}. Log into the app once to create your account, then re-run.`);
  const userId = target.id;
  console.log(`Target user_id: ${userId}`);

  const { data: existing, error: existingErr } = await supabase
    .from("brain_dumps")
    .select("id, created_at, title")
    .eq("user_id", userId);
  if (existingErr) throw existingErr;
  const existingByTs = new Map();
  for (const r of existing ?? []) {
    existingByTs.set(new Date(r.created_at).toISOString(), r);
  }
  console.log(`Existing brain_dumps for user: ${existing?.length ?? 0}`);

  const csvText = fs.readFileSync(CSV_PATH, "utf8");
  const all = parseCsv(csvText);
  const header = all[0];
  const dataRows = all.slice(1).filter((r) => r.length > 1 && (r[0] || r[1]));

  const idx = (name) => header.findIndex((h) => h.trim() === name);
  const iTitle = idx("Title");
  const iDate = idx("Date");
  const iTime = idx("Time Spent");
  const iCount = idx("Answered Count");
  const iQ = [
    idx("Q1: What am I actually trying to accomplish?"),
    idx("Q2: Why does this matter?"),
    idx("Q3: What does done look like?"),
    idx("Q4: What does wrong look like?"),
    idx("Q5: What do I already know?"),
    idx("Q6: What are the pieces?"),
    idx("Q7: What is the hard part?"),
  ];

  const inserts = dataRows.map((r) => {
    const answers = iQ.map((i) => (i >= 0 ? r[i] || "" : ""));
    const answeredCount = parseInt(r[iCount], 10);
    return {
      user_id: userId,
      title: r[iTitle] || null,
      answers,
      time_spent: r[iTime] || null,
      answered_count: Number.isFinite(answeredCount)
        ? answeredCount
        : answers.filter((a) => a.trim()).length,
      created_at: r[iDate] || null,
    };
  });

  const idsToReplace = [];
  for (const row of inserts) {
    const ts = row.created_at ? new Date(row.created_at).toISOString() : null;
    if (ts && existingByTs.has(ts)) {
      const match = existingByTs.get(ts);
      idsToReplace.push(match.id);
      console.log(`  Will replace existing row at ${ts}: "${match.title?.slice(0, 60) ?? ""}"`);
    }
  }

  if (idsToReplace.length > 0) {
    console.log(`Deleting ${idsToReplace.length} existing rows that match CSV timestamps...`);
    const { error: delErr } = await supabase
      .from("brain_dumps")
      .delete()
      .in("id", idsToReplace);
    if (delErr) throw delErr;
  }

  console.log(`Inserting ${inserts.length} CSV rows...`);
  const { data, error } = await supabase
    .from("brain_dumps")
    .insert(inserts)
    .select("id");
  if (error) throw error;
  console.log(`Success — ${data.length} rows inserted.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
