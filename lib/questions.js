export const QUESTIONS = [
  {
    number: 1,
    title: "What am I actually trying to accomplish?",
    hint: "Not the task. The outcome. \"Write a blog post\" is a task. \"Convince mid-level managers that their AI strategy has a blind spot they haven't considered\" is an outcome. Say it in one sentence. If you can't get it to one sentence, you don't know what you want yet. That's fine. Keep talking it through until you do.",
  },
  {
    number: 2,
    title: "Why does this matter?",
    hint: "What happens if this goes well? What happens if you don't do it at all? This forces you to separate the things that actually need to be good from the things that just need to exist. Not everything is high-stakes. Knowing which category you're in changes how much specification work the task actually requires.",
  },
  {
    number: 3,
    title: 'What does "done" look like?',
    hint: "Describe the finished thing. Not the process. The output. If someone handed it to you completed, what would make you say \"yes, that's it\"? Be specific. Length, format, tone, level of detail, who it's for, what they should feel or do or know after they encounter it. If you can't describe what done looks like, you're not ready to delegate this to anyone — human or AI.",
  },
  {
    number: 4,
    title: 'What does "wrong" look like, and what\'s off-limits?',
    hint: "Two quick checks before the AI starts writing. Picture the AI handing back something polished, technically right, but you still wince. What did it miss? Tone, audience, a detail only you'd catch? That's the first one. Now flip it. What should the AI never do? Words you can't stand. Formats that feel off. The default it keeps reaching for that drives you up the wall. That's the second. Write both. The more you spell out here, the less editing later.",
  },
  {
    number: 5,
    title: "What do I already know that I haven't written down?",
    hint: "The institutional knowledge. The context. The unwritten rules. The thing that's obvious to you but wouldn't be obvious to someone encountering this task for the first time. This is the stuff that lives in your head and evaporates the second you let someone else start working without it. Say it out loud or write it down. All of it.",
  },
  {
    number: 6,
    title: "What are the pieces?",
    hint: "Break it down. What are the components, subtasks, chunks? What comes first? What depends on what? What could be done independently? You're building the decomposition that makes a specification work. But you're doing it in your own head first, where you can see the whole picture and catch the dependencies that a task list would miss.",
  },
  {
    number: 7,
    title: "What's the hard part?",
    hint: "Every task has one piece that's genuinely difficult and several pieces that are just effort. Name the hard part. Where are the judgment calls? Where could this go sideways? Where are you least certain? This is where your specification needs the most detail. And it's the part most people gloss over because it's uncomfortable to sit with uncertainty.",
  },
];

export const NINETY_FIVE_RULE = "Interview me until you have 95% confidence about what I actually want, not what you think I should want.";

export function buildClipboardPayload(answers) {
  let body = "";
  QUESTIONS.forEach((q, i) => {
    if (answers[i]?.trim()) body += `${q.number}. ${q.title}\n${answers[i].trim()}\n\n`;
  });
  body = body.trim();
  if (!body) return "";
  return `${body}\n\n${NINETY_FIVE_RULE}`;
}

export const TIMER_OPTIONS = [
  { label: "5 min", seconds: 5 * 60 },
  { label: "10 min", seconds: 10 * 60 },
  { label: "15 min", seconds: 15 * 60 },
];

export function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
