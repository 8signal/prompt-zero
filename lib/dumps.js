import { createClient } from "./supabase-browser";

export async function loadDumps() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("brain_dumps")
    .select("id, title, created_at, time_spent, answered_count")
    .order("created_at", { ascending: false });
  if (error) { console.error("Load dumps error:", error); return []; }
  return data || [];
}

export async function loadDump(id) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("brain_dumps")
    .select("*")
    .eq("id", id)
    .single();
  if (error) { console.error("Load dump error:", error); return null; }
  return data;
}

export async function saveDump({ title, answers, timeSpent, answeredCount }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("brain_dumps")
    .insert({
      user_id: user.id,
      title,
      answers,
      time_spent: timeSpent,
      answered_count: answeredCount,
    })
    .select()
    .single();
  if (error) { console.error("Save dump error:", error); return null; }
  return data;
}

export async function updateDump(id, updates) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("brain_dumps")
    .update({
      ...(updates.title !== undefined && { title: updates.title }),
      ...(updates.answers !== undefined && { answers: updates.answers }),
      ...(updates.answeredCount !== undefined && { answered_count: updates.answeredCount }),
    })
    .eq("id", id)
    .select()
    .single();
  if (error) { console.error("Update dump error:", error); return null; }
  return data;
}

export async function deleteDump(id) {
  const supabase = createClient();
  const { error } = await supabase
    .from("brain_dumps")
    .delete()
    .eq("id", id);
  if (error) { console.error("Delete dump error:", error); return false; }
  return true;
}
