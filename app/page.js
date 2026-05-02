import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { QUESTIONS } from "@/lib/questions";
import CopyButton from "@/components/CopyButton";

const NINETY_FIVE_RULE = "Interview me until you have 95% confidence about what I actually want, not what you think I should want.";

const QUESTIONS_PLAIN_TEXT = [
  "The Seven Questions of Prompt Zero",
  "by Ruben at 8 SIGNAL — promptzero.app",
  "",
  ...QUESTIONS.flatMap((q) => [
    `${q.number}. ${q.title}`,
    q.hint,
    "",
  ]),
  "Bonus — The 95% Rule:",
  "Paste this sentence at the top of any serious AI prompt, above the brain dump from the seven questions:",
  `"${NINETY_FIVE_RULE}"`,
].join("\n");

export default async function Home() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="max-w-3xl mx-auto px-6 py-16 md:py-24">
      <header className="mb-16">
        <p className="text-warm-500 text-sm uppercase tracking-widest mb-10">Prompt Zero</p>
        <p className="text-5xl md:text-8xl font-bold italic text-danger leading-none mb-10 tracking-tight">
          Go forth.<br />Prompt better.
        </p>
        <h1 className="text-2xl md:text-3xl font-bold text-warm-900 leading-tight mb-6">
          Get your thinking out of your head before AI has a chance to reshape it.
        </h1>
        <p className="text-xl text-warm-700 leading-relaxed mb-10">
          Okay, so, AI is fast. Suspiciously fast. So fast that you'll start typing a half-baked
          idea, watch it spit out something polished and confident, and forget you ever had a different
          vision in the first place. BadaBING, badaboom, your original thought? Gone. Replaced by
          something that sounds smart but isn't yours.
        </p>
        <p className="text-xl text-warm-700 leading-relaxed mb-10">
          Prompt Zero is the brain dump you do <em>before</em> you open the chat window. Seven questions.
          A timer. A blank page. That's it. No AI in the room yet. Just you, deciding what you actually
          think, so when you finally do prompt the robot, you're driving instead of getting driven.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href={user ? "/dashboard" : "/login"}
            className="inline-block bg-warm-900 text-parchment px-8 py-4 text-lg font-semibold hover:bg-warm-800 text-center"
          >
            {user ? "Go to your dashboard" : "Try the app, it's free"}
          </Link>
          <a
            href="#questions"
            className="inline-block border-2 border-warm-900 text-warm-900 px-8 py-4 text-lg font-semibold hover:bg-warm-100 text-center"
          >
            Or just steal the questions
          </a>
        </div>
      </header>

      <section className="mb-16 border-t border-warm-300 pt-12">
        <p className="text-warm-500 text-sm uppercase tracking-widest mb-3">A receipt, since you asked</p>
        <p className="text-3xl md:text-4xl font-bold text-warm-900 leading-tight mb-4">
          I get a week's worth of work done in 30 minutes instead of half a day.
        </p>
        <p className="text-lg text-warm-700 leading-relaxed">
          That's not a marketing number. That's me. Same brain, same tools, same chatbot. The only
          variable is whether I did Prompt Zero before opening the chat window. Half a day of
          back-and-forth ("no, not like that," "closer, but," "okay try again") collapses into one
          clean handoff because I figured out what I actually wanted before I asked. Compounding
          weekly, this is the difference between drowning and surfing.
        </p>
      </section>

      <section className="mb-16 border-t border-warm-300 pt-12">
        <h2 className="text-3xl font-bold text-warm-900 mb-6">Why Prompt Zero is awesome</h2>
        <div className="space-y-6 text-lg text-warm-700 leading-relaxed">
          <p>
            <strong className="text-warm-900">It saves you from your own first instinct.</strong> Your
            first prompt is almost always wrong. Not because you're dumb. Because you haven't decided
            what you want yet. Prompt Zero forces the deciding to happen <em>before</em> the typing.
          </p>
          <p>
            <strong className="text-warm-900">It catches the stuff in your head you forgot was in your
            head.</strong> Every task has institutional knowledge, unwritten rules, and weird little
            constraints that are obvious to you and invisible to everyone else (including the AI).
            Question 5 alone will save you three rounds of "no, not like that."
          </p>
          <p>
            <strong className="text-warm-900">It names the hard part out loud.</strong> Most prompts
            collapse on the one piece that actually required judgment. Prompt Zero makes you point at
            that piece before you delegate. Big difference.
          </p>
          <p>
            <strong className="text-warm-900">It is, somehow, also therapy.</strong> Okay not really. But
            kind of. You will be surprised how often the answer to "what am I actually trying to
            accomplish?" is "huh. Not what I was about to ask for." That's the whole product right there.
          </p>
        </div>
      </section>

      <section id="questions" className="mb-16 border-t border-warm-300 pt-12">
        <h2 className="text-3xl font-bold text-warm-900 mb-4">The seven questions</h2>
        <p className="text-lg text-warm-700 mb-6 leading-relaxed">
          Look. If you don't want to use my little app, that's fine. Truly. (A little hurtful, but fine.)
          Here are the questions. Grab them. Print them. Tape them to your monitor. Tattoo them on your
          forearm. The whole point is the thinking, not the software.
        </p>
        <div className="mb-10">
          <CopyButton
            text={QUESTIONS_PLAIN_TEXT}
            label="Copy all seven questions + the 95% Rule"
            copiedLabel="Copied! Go forth."
          />
        </div>
        <ol className="space-y-10">
          {QUESTIONS.map((q) => (
            <li key={q.number}>
              <div className="flex gap-4 mb-3">
                <span className="text-3xl font-bold text-warm-400 leading-none">{q.number}</span>
                <h3 className="text-2xl font-bold text-warm-900 leading-tight">{q.title}</h3>
              </div>
              <p className="text-warm-700 leading-relaxed text-lg pl-12">{q.hint}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mb-16 border-t border-warm-300 pt-12">
        <p className="text-warm-500 text-sm uppercase tracking-widest mb-3">Bonus freebie</p>
        <h2 className="text-3xl md:text-4xl font-bold text-warm-900 mb-2 leading-tight">
          The 95% Rule:
        </h2>
        <p className="text-2xl md:text-3xl font-bold italic text-danger leading-tight mb-8">
          Stop guessing. Start interviewing. 95% or bust.
        </p>
        <div className="space-y-5 text-lg text-warm-700 leading-relaxed">
          <p>
            The 95% Rule is one sentence you paste into your prompt. That's it. That's the rule.
            Copy it, paste it at the top of whatever you're about to ask the AI, and watch the
            whole conversation change.
          </p>
          <blockquote className="border-l-4 border-warm-900 bg-warm-100 pl-6 pr-4 py-5 text-xl text-warm-900 font-semibold not-italic">
            {NINETY_FIVE_RULE}
          </blockquote>
          <div>
            <CopyButton
              text={NINETY_FIVE_RULE}
              label="Copy the 95% Rule"
              copiedLabel="Copied! Now go interrogate a chatbot."
            />
          </div>
          <p>
            Why it works. The default behavior of every chatbot on Earth is to assume it knows
            what you want and start producing. The 95% Rule flips it. Instead of generating, it
            asks. Instead of guessing, it interrogates. You go from "AI gave me a thing I have
            to fix" to "AI made me sharper before it produced anything." Free upgrade. Use it
            on every serious prompt.
          </p>
        </div>

        <div className="mt-10 bg-warm-100 border-l-4 border-warm-400 p-6">
          <p className="text-warm-500 text-sm uppercase tracking-widest mb-2">Where to drop it</p>
          <p className="text-lg text-warm-700 leading-relaxed mb-3">
            Paste the 95% Rule at the very <strong className="text-warm-900">top</strong> of your
            prompt, before you paste in the brain dump from the seven questions. Like this:
          </p>
          <pre className="bg-parchment border border-warm-300 p-4 text-sm text-warm-900 font-mono whitespace-pre-wrap leading-relaxed">
{`[95% Rule sentence]

Here's my brain dump from Prompt Zero:

1. What I'm actually trying to accomplish: ...
2. Why this matters: ...
3. What "done" looks like: ...
4. What "wrong" looks like: ...
5. What I already know that I haven't written down: ...
6. The pieces: ...
7. The hard part: ...

Now, before you generate anything, follow the rule above.`}
          </pre>
          <p className="text-warm-700 leading-relaxed mt-4">
            The 95% Rule on top sets the behavior. The seven-question brain dump underneath gives the
            AI the raw material. Together they turn a chatbot into something that actually thinks
            with you instead of at you.
          </p>
        </div>
      </section>

      <section className="border-t border-warm-300 pt-12 mb-12">
        <h2 className="text-3xl font-bold text-warm-900 mb-6">Okay but why use the app then?</h2>
        <div className="space-y-4 text-lg text-warm-700 leading-relaxed">
          <p>
            Fair question. Honestly? Because a piece of paper doesn't beep at you. The app has a timer,
            saves your sessions, and lets you go back and see what past-you was actually thinking before
            present-you got smart about it. It's the questions plus a little structure plus a little
            accountability. Same medicine, easier to swallow.
          </p>
          <p>
            But if all you ever do is read this page, copy the seven questions into a note app, and use
            them once before your next big prompt, I've still done my job. Go forth. Prompt better.
          </p>
        </div>
        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link
            href={user ? "/dashboard" : "/login"}
            className="inline-block bg-warm-900 text-parchment px-8 py-4 text-lg font-semibold hover:bg-warm-800 text-center"
          >
            {user ? "Go to your dashboard" : "Fine, I'll try the app"}
          </Link>
        </div>
      </section>

      <footer className="border-t border-warm-300 pt-8 text-warm-500 text-sm">
        Built by Ruben at 8 SIGNAL. Because somebody had to.
      </footer>
    </main>
  );
}
