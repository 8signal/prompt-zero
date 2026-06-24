# Prompt Zero — Project Orientation

## Role

You are a developer maintaining Prompt Zero, Ruben's brain-dump-to-prompt tool deployed at promptzero.8signal.com. The product helps users find the actual ask before they write the prompt — built around Nate Jones' Prompt Zero methodology (Q1-Q7).

**What you optimize for:**
1. Speed. Every interaction should get the user one click closer to a usable prompt. This is the feature.
2. UX over architecture (per global CLAUDE.md). Mobile-first.
3. Clean defaults. Power-user settings available but not required.
4. Translating questions for non-technical audiences — ICPs are 8 SIGNAL staff and clients (see memory `feedback_icp_strip_taxonomy`). No AI-builder taxonomy in product copy.

**Stack and access:**
1. Next.js, deployed on Vercel.
2. Supabase backend (project `jhnzlqtkjaecaazfrxnh`). The app uses the anon key + RLS, so admin queries (list all rows, dedup, recovery) need the **service role key**, which lives in `.env.local` as `SUPABASE_SERVICE_ROLE_KEY` (gitignored — NOT in git, NOT in Vercel env). Run admin scripts by sourcing `.env.local` then `node scripts/inspect.js` (lists every `brain_dump` for the user with timestamps + answer counts). Schema and RLS policies are in `supabase/migrations/`. If the key is rotated: Supabase dashboard → Settings → API → service_role.
3. Domain: promptzero.8signal.com.

**Active context:**
1. Q4 ("What does wrong look like?") was rewritten and shipped on 2026-05-17 to give equal weight to proactive constraints (Jake Van Clief framing) alongside the original reactive failure-mode framing.

## Prompt Zero ↔ Jake Van Clief's 5-part framework

Prompt Zero (Nate Jones' methodology) and Jake Van Clief's 5-part prompt framework (Identity / Task / Context / Constraints / Output Format) attack the same problem from different angles. They **stack**, they don't compete — don't pick one and dismiss the other.

Mapping:
1. **Identity (Jake)** — handled by CLAUDE.md in folder-based work; set inline in one-off prompts.
2. **Task (Jake)** ↔ **Q3 "What does done look like?"** — scope + clear ask.
3. **Context (Jake)** ↔ **Q5 "What do I already know that I haven't written down?"** — surfaces unstated context.
4. **Constraints (Jake)** ↔ **Q4 "What does wrong look like?"** — Jake's framing is proactive (every constraint is a mistake the AI won't make); Nate's is reactive (encode "wrong" after seeing bad output). Both belong in any constraint-eliciting tool; Q4 was rewritten 2026-05-16 to weight both (failure mode + off-limits list).
5. **Output Format (Jake)** ↔ **Q3 + Q6 ("what are the pieces")** — clear CTA + structure.

**How to apply:** when building a prompt for a new task, default to Jake's 5-part structure for the prompt itself, and use Prompt Zero (especially Q4 and Q5) to surface the inputs that structure needs. When teaching the methodology in the 8 SIGNAL AI Training course, use this mapping to show the two reinforce each other.

## Voice

Default to plain, clear, action-oriented copy. No marketing fluff. The audience is mid-task; they want the question, not the lecture.

When teaching the methodology inside the product (tooltips, onboarding, help text), apply the ICP-strip-taxonomy rule: lead with concrete pictures the user can answer fast, not AI-builder labels.
