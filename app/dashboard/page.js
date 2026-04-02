"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase-browser";
import { loadDumps, loadDump, saveDump, updateDump, deleteDump } from "@/lib/dumps";
import { QUESTIONS, TIMER_OPTIONS, formatTime, formatDate } from "@/lib/questions";
import { useRouter } from "next/navigation";
import ThreadDrawer from "@/components/ThreadDrawer";

export default function Dashboard() {
  const [phase, setPhase] = useState("intro");
  const [timerDuration, setTimerDuration] = useState(10 * 60);
  const [timeLeft, setTimeLeft] = useState(10 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState(Array(7).fill(""));
  const [showHint, setShowHint] = useState(false);
  const [timerExpired, setTimerExpired] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [threads, setThreads] = useState([]);
  const [viewingThread, setViewingThread] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState("");
  const [copyFeedback, setCopyFeedback] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const autoSaved = useRef(false);
  const textareaRef = useRef(null);
  const intervalRef = useRef(null);
  const router = useRouter();
  const supabase = createClient();

  // Load threads on mount
  useEffect(() => {
    setTimeout(() => setFadeIn(true), 50);
    loadDumps().then((data) => { setThreads(data); setLoaded(true); });
  }, []);

  // Timer — continues counting past zero into overtime
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1 && !timerExpired) setTimerExpired(true);
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  // Focus textarea
  useEffect(() => {
    if (phase === "writing" && textareaRef.current) textareaRef.current.focus();
  }, [currentQ, phase]);

  // Auto-save on review
  useEffect(() => {
    if (phase === "review" && !autoSaved.current) {
      autoSaved.current = true;
      doSave(true);
    }
    if (phase !== "review") autoSaved.current = false;
  }, [phase]);

  const startSession = useCallback(() => {
    setTimeLeft(timerDuration); setPhase("writing"); setIsRunning(true);
    setCurrentQ(0); setAnswers(Array(7).fill("")); setTimerExpired(false);
    setSaveFeedback(""); autoSaved.current = false;
  }, [timerDuration]);

  const updateAnswer = (val) => {
    setAnswers((prev) => { const next = [...prev]; next[currentQ] = val; return next; });
  };

  const goNext = () => {
    setShowHint(false);
    if (currentQ < 6) setCurrentQ((c) => c + 1);
    else { setPhase("review"); setIsRunning(false); clearInterval(intervalRef.current); }
  };
  const goPrev = () => { setShowHint(false); if (currentQ > 0) setCurrentQ((c) => c - 1); };

  const goToQuestion = (i) => {
    setShowHint(false); setCurrentQ(i); setPhase("writing");
    if (!isRunning) setIsRunning(true);
  };

  const resetAll = () => {
    setPhase("intro"); setIsRunning(false); setTimeLeft(timerDuration);
    setCurrentQ(0); setAnswers(Array(7).fill("")); setTimerExpired(false);
    setShowHint(false); setSaveFeedback(""); clearInterval(intervalRef.current);
    autoSaved.current = false;
  };

  const elapsed = timerDuration - timeLeft;
  const answeredCount = answers.filter((a) => a.trim().length > 0).length;
  const progress = Math.max(0, timeLeft / timerDuration);
  const overtime = timeLeft < 0 ? Math.abs(timeLeft) : 0;

  // Save
  const doSave = async (silent = false) => {
    if (isSaving) return;
    const hasContent = answers.some((a) => a?.trim());
    if (!hasContent) return;
    setIsSaving(true);
    try {
      const outcome = answers[0]?.trim();
      const title = outcome ? (outcome.length > 60 ? outcome.slice(0, 57) + "..." : outcome) : `Brain dump — ${new Date().toLocaleDateString()}`;
      const result = await saveDump({ title, answers, timeSpent: formatTime(elapsed), answeredCount });
      if (result) {
        const fresh = await loadDumps();
        setThreads(fresh);
        if (!silent) { setSaveFeedback("Saved"); setTimeout(() => setSaveFeedback(""), 2000); }
      } else if (!silent) {
        setSaveFeedback("Save failed"); setTimeout(() => setSaveFeedback(""), 2000);
      }
    } catch (e) {
      console.error("Save failed:", e);
      if (!silent) { setSaveFeedback("Save failed"); setTimeout(() => setSaveFeedback(""), 2000); }
    } finally { setIsSaving(false); }
  };

  // Thread ops
  const showThreads = () => {
    setPhase("threads");
    loadDumps().then((data) => setThreads(data)).catch(console.error);
  };

  const openThread = async (id) => {
    const thread = await loadDump(id);
    if (thread) setViewingThread(thread);
  };

  const handleUpdateThread = async (updated) => {
    const result = await updateDump(updated.id, {
      title: updated.title,
      answers: updated.answers,
      answeredCount: updated.answered_count,
    });
    if (result) {
      setViewingThread(result);
      const fresh = await loadDumps();
      setThreads(fresh);
    }
  };

  const handleDeleteThread = async (id) => {
    await deleteDump(id);
    setViewingThread(null);
    const fresh = await loadDumps();
    setThreads(fresh);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  // Clipboard
  const copyToClipboard = async () => {
    let text = "";
    QUESTIONS.forEach((q, i) => { if (answers[i]?.trim()) text += `${q.number}. ${q.title}\n${answers[i].trim()}\n\n`; });
    text = text.trim();
    if (!text) { setCopyFeedback("Nothing to copy"); setTimeout(() => setCopyFeedback(""), 2000); return; }
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback("Copied!"); setTimeout(() => setCopyFeedback(""), 2000);
    } catch {
      const ta = document.createElement("textarea"); ta.value = text;
      ta.style.position = "fixed"; ta.style.left = "-9999px"; ta.style.top = "-9999px";
      document.body.appendChild(ta); ta.focus(); ta.select();
      try { document.execCommand("copy"); setCopyFeedback("Copied!"); }
      catch { setCopyFeedback("Failed"); }
      document.body.removeChild(ta);
      setTimeout(() => setCopyFeedback(""), 2000);
    }
  };

  const exportText = () => {
    let text = "PROMPT ZERO — Brain Dump\n========================\n\n";
    QUESTIONS.forEach((q, i) => { text += `${q.number}. ${q.title}\n${answers[i] || "(skipped)"}\n\n`; });
    text += "---\nGenerated with Prompt Zero. Concept by Nate Jones.\n";
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "prompt-zero-braindump.txt"; a.click();
    URL.revokeObjectURL(url);
  };

  const timerColor = timeLeft <= 0 ? "text-danger" : timeLeft < 60 ? "text-danger" : timeLeft < timerDuration * 0.25 ? "text-orange-600" : "text-warm-700";

  return (
    <div className={`min-h-screen bg-parchment font-serif text-warm-900 transition-opacity duration-700 ${fadeIn ? "opacity-100" : "opacity-0"}`}>

      {/* Sign out - always visible */}
      <div className="fixed top-4 right-4 z-50">
        <button onClick={handleSignOut} className="text-xs text-warm-400 hover:text-warm-600 font-mono tracking-wide">
          Sign out
        </button>
      </div>

      {/* Thread drawer */}
      {viewingThread && (
        <ThreadDrawer
          thread={viewingThread}
          onClose={() => setViewingThread(null)}
          onSave={handleUpdateThread}
          onDelete={handleDeleteThread}
        />
      )}

      {/* ═══════════ INTRO ═══════════ */}
      {phase === "intro" && (
        <div className="max-w-[620px] mx-auto px-6 pt-16 pb-20">
          <div className="text-center mb-12">
            <div className="text-[11px] tracking-[4px] uppercase text-warm-500 font-mono mb-4">Before You Open the Chat</div>
            <h1 className="text-[42px] font-normal mb-2 leading-tight tracking-tight">Prompt Zero</h1>
            <div className="w-10 h-0.5 bg-warm-900 mx-auto my-4" />
            <p className="text-[15px] text-warm-600 leading-relaxed max-w-[440px] mx-auto italic">
              Get your thinking out of your head before AI has a chance to reshape it.
            </p>
          </div>

          <div className="bg-warm-100 rounded p-7 mb-10 border-l-[3px] border-warm-400">
            <p className="text-[14.5px] leading-7 text-warm-800">
              Seven questions. A timer. No AI involved.<br /><br />
              You'll work through each question one at a time, writing your own answers. The timer keeps you moving. When you're done, you'll have a brain dump you can bring into any AI session — or use on its own.
            </p>
          </div>

          <div className="text-center mb-8">
            <div className="text-[11px] tracking-[4px] uppercase text-warm-500 font-mono mb-4">Set your timer</div>
            <div className="flex justify-center gap-3">
              {TIMER_OPTIONS.map((opt) => (
                <button key={opt.seconds}
                  onClick={() => { setTimerDuration(opt.seconds); setTimeLeft(opt.seconds); }}
                  className={`px-7 py-2.5 text-[15px] font-mono border-[1.5px] border-warm-900 rounded-sm tracking-wide transition-all ${
                    timerDuration === opt.seconds ? "bg-warm-900 text-parchment" : "bg-transparent text-warm-900 hover:bg-warm-100"
                  }`}
                >{opt.label}</button>
              ))}
            </div>
          </div>

          <div className="text-center flex justify-center gap-3 flex-wrap">
            <button onClick={startSession} className="px-7 py-3 bg-warm-900 text-parchment font-serif text-base rounded-sm hover:bg-warm-800 transition-colors">
              Start thinking
            </button>
            {loaded && threads.length > 0 && (
              <button onClick={showThreads} className="px-7 py-3 bg-transparent text-warm-900 font-serif text-base border-[1.5px] border-warm-900 rounded-sm hover:bg-warm-100 transition-colors">
                Past threads ({threads.length})
              </button>
            )}
          </div>

          <div className="mt-12 text-center text-xs text-warm-400 italic">Concept by Nate Jones</div>
        </div>
      )}

      {/* ═══════════ THREADS LIST ═══════════ */}
      {phase === "threads" && (
        <div className="max-w-[620px] mx-auto px-6 pt-12 pb-20">
          <div className="mb-8">
            <button onClick={() => setPhase("intro")} className="text-sm text-warm-500 hover:text-warm-700 font-serif mb-5 block">← Back</button>
            <div className="text-[11px] tracking-[4px] uppercase text-warm-500 font-mono mb-3">Your Library</div>
            <h2 className="text-[32px] font-normal mb-2 tracking-tight">Past Threads</h2>
            <p className="text-sm text-warm-600 italic">{threads.length} brain dump{threads.length !== 1 ? "s" : ""} saved</p>
          </div>

          {threads.length === 0 ? (
            <div className="text-center py-16 text-warm-500 italic">
              No saved brain dumps yet. Complete a session to start building your library.
            </div>
          ) : (
            <div className="space-y-3">
              {threads.map((entry) => (
                <div key={entry.id}
                  className="p-5 bg-warm-50 border border-warm-200 rounded hover:border-warm-500 transition-colors"
                >
                  {confirmDeleteId === entry.id ? (
                    <div className="text-center py-2">
                      <p className="text-sm text-danger italic mb-3">Delete this brain dump? This can't be undone.</p>
                      <div className="flex justify-center gap-2.5">
                        <button onClick={() => { handleDeleteThread(entry.id); setConfirmDeleteId(null); }}
                          className="text-[13px] px-5 py-1.5 bg-danger text-white rounded-sm font-serif">Yes, delete</button>
                        <button onClick={() => setConfirmDeleteId(null)}
                          className="text-[13px] px-5 py-1.5 bg-transparent text-warm-500 border border-warm-400 rounded-sm font-serif">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start cursor-pointer" onClick={() => openThread(entry.id)}>
                      <div className="flex-1 min-w-0">
                        <div className="text-base leading-snug mb-1.5 truncate">{entry.title}</div>
                        <div className="text-xs text-warm-500 font-mono">
                          {formatDate(entry.created_at)} · {entry.answered_count}/7 answered
                        </div>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(entry.id); }}
                        className="text-lg text-warm-400 hover:text-danger ml-3 flex-shrink-0" title="Delete">×</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══════════ WRITING ═══════════ */}
      {phase === "writing" && (
        <div className="max-w-[680px] mx-auto px-6 pt-8 pb-20">
          {/* Timer bar */}
          <div className="sticky top-0 bg-parchment z-10 pb-4 border-b border-warm-300 mb-8">
            <div className="flex justify-between items-center mb-2.5">
              <div className="flex items-center gap-3">
                <span className={`font-mono text-[28px] font-bold tracking-widest ${timerExpired ? "text-danger" : timerColor}`}>
                  {timerExpired ? `+${formatTime(overtime)}` : formatTime(timeLeft)}
                </span>
                {timerExpired && <span className="text-xs text-danger italic">Time's up — keep going or finish</span>}
              </div>
              <div className="flex items-center gap-4">
                {loaded && threads.length > 0 && (
                  <button onClick={() => { setIsRunning(false); clearInterval(intervalRef.current); showThreads(); }}
                    className="text-xs text-warm-500 font-mono border-b border-dotted border-warm-400 hover:text-warm-700">past threads</button>
                )}
                <span className="text-xs text-warm-500 font-mono">{currentQ + 1}/7 · {answeredCount} answered</span>
              </div>
            </div>
            <div className="h-[3px] bg-warm-300 rounded overflow-hidden">
              <div className={`h-full rounded transition-all duration-1000 ${timerExpired ? "bg-danger" : timeLeft < 60 ? "bg-danger" : timeLeft < timerDuration * 0.25 ? "bg-orange-600" : "bg-warm-500"}`}
                style={{ width: `${Math.min((1 - progress) * 100, 100)}%` }} />
            </div>
            <div className="flex justify-center gap-2 mt-3">
              {QUESTIONS.map((_, i) => (
                <button key={i} onClick={() => { setCurrentQ(i); setShowHint(false); }}
                  className={`w-7 h-7 rounded-full text-xs font-mono flex items-center justify-center transition-all ${
                    i === currentQ
                      ? answers[i].trim() ? "bg-warm-900 text-parchment border-2 border-warm-900" : "bg-parchment text-warm-900 border-2 border-warm-900"
                      : answers[i].trim() ? "bg-warm-500 text-parchment border-[1.5px] border-warm-400" : "bg-transparent text-warm-500 border-[1.5px] border-warm-400"
                  }`}
                >{i + 1}</button>
              ))}
            </div>
          </div>

          {/* Question */}
          <div className="mb-6">
            <div className="text-[11px] tracking-[4px] uppercase text-warm-500 font-mono mb-2">Question {QUESTIONS[currentQ].number}</div>
            <h2 className="text-[26px] font-normal mb-3 leading-snug tracking-tight">{QUESTIONS[currentQ].title}</h2>
            <button onClick={() => setShowHint(!showHint)}
              className="text-[13px] text-warm-500 font-serif italic border-b border-dotted border-warm-400 hover:text-warm-700">
              {showHint ? "Hide prompt" : "Need a nudge?"}
            </button>
            {showHint && (
              <div className="mt-3 p-4 bg-warm-100 rounded border-l-[3px] border-warm-400 text-sm text-warm-700 leading-relaxed italic">
                {QUESTIONS[currentQ].hint}
              </div>
            )}
          </div>

          <textarea ref={textareaRef} value={answers[currentQ]} onChange={(e) => updateAnswer(e.target.value)} placeholder="Start writing..."
            className="w-full min-h-[220px] p-5 text-base leading-[1.8] font-serif text-warm-900 bg-warm-50 border border-warm-300 rounded resize-y" />
          <div className="text-right text-xs text-warm-400 mt-1.5 font-mono">
            {answers[currentQ].trim() ? answers[currentQ].trim().split(/\s+/).length : 0} words
          </div>

          <div className="flex justify-between mt-7">
            <button onClick={goPrev} disabled={currentQ === 0}
              className={`px-6 py-2.5 text-sm font-serif border-[1.5px] rounded-sm ${currentQ === 0 ? "text-warm-400 border-warm-300 cursor-default" : "text-warm-900 border-warm-900 hover:bg-warm-100"}`}>
              ← Previous
            </button>
            <button onClick={goNext} className="px-7 py-2.5 text-sm font-serif bg-warm-900 text-parchment rounded-sm hover:bg-warm-800 transition-colors">
              {currentQ === 6 ? "Finish →" : "Next →"}
            </button>
          </div>
        </div>
      )}

      {/* ═══════════ REVIEW ═══════════ */}
      {phase === "review" && (
        <div className="max-w-[680px] mx-auto px-6 pt-12 pb-20">
          <div className="text-center mb-10">
            <div className="text-[11px] tracking-[4px] uppercase text-warm-500 font-mono mb-3">Your Brain Dump</div>
            <h2 className="text-[32px] font-normal mb-2 tracking-tight">The mess is yours.</h2>
            <p className="text-sm text-warm-600 italic">{answeredCount} of 7 answered · {formatTime(elapsed)} total time spent</p>
          </div>

          {QUESTIONS.map((q, i) => (
            <div key={i} className={`mb-7 pb-7 ${i < 6 ? "border-b border-warm-200" : ""}`}>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-[15px] font-normal text-warm-700 flex-1">
                  <span className="font-mono text-warm-500 mr-2">{q.number}.</span>{q.title}
                </h3>
                <button onClick={() => goToQuestion(i)} className="text-xs text-warm-500 font-serif italic border-b border-dotted border-warm-400 flex-shrink-0 ml-3 hover:text-warm-700">edit</button>
              </div>
              <div className={`text-[15.5px] leading-7 whitespace-pre-wrap pl-7 ${answers[i].trim() ? "text-warm-900" : "text-warm-400 italic"}`}>
                {answers[i].trim() || "Skipped"}
              </div>
            </div>
          ))}

          <div className="flex justify-center gap-3 mt-10 flex-wrap items-center">
            <button onClick={copyToClipboard}
              className={`px-7 py-3 text-sm font-serif text-parchment rounded-sm transition-colors ${copyFeedback === "Copied!" ? "bg-success" : "bg-warm-900 hover:bg-warm-800"}`}>
              {copyFeedback || "Copy to clipboard"}
            </button>
            <button onClick={exportText} className="px-7 py-3 text-sm font-serif text-warm-900 border-[1.5px] border-warm-900 rounded-sm hover:bg-warm-100">Download .txt</button>
            <button onClick={() => doSave(false)}
              className={`px-7 py-3 text-sm font-serif border-[1.5px] rounded-sm transition-all ${(saveFeedback || autoSaved.current) ? "border-success text-success" : "border-warm-900 text-warm-900 hover:bg-warm-100"}`}>
              {saveFeedback || (autoSaved.current ? "Auto-saved" : "Save to library")}
            </button>
            <button onClick={resetAll} className="px-7 py-3 text-sm font-serif text-warm-500 border-[1.5px] border-warm-400 rounded-sm hover:bg-warm-100">Start over</button>
          </div>

          {loaded && threads.length > 0 && (
            <div className="text-center mt-4">
              <button onClick={showThreads} className="text-[13px] text-warm-500 font-serif italic border-b border-dotted border-warm-400 hover:text-warm-700">
                View past threads ({threads.length})
              </button>
            </div>
          )}

          <div className="mt-10 p-6 bg-warm-100 rounded border-l-[3px] border-warm-400 text-center">
            <p className="text-[14.5px] leading-7 text-warm-800 italic">
              Now open your AI session. You're not showing up empty-handed.<br />You're showing up with answers.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
