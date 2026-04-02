"use client";

import { useState, useEffect, useRef } from "react";
import { QUESTIONS, formatDate } from "@/lib/questions";

export default function ThreadDrawer({ thread, onClose, onSave, onDelete }) {
  const [editing, setEditing] = useState(null);
  const [editText, setEditText] = useState("");
  const [editTitle, setEditTitle] = useState(false);
  const [titleText, setTitleText] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState("");
  const editRef = useRef(null);

  useEffect(() => {
    if (editing !== null && editRef.current) editRef.current.focus();
  }, [editing]);

  if (!thread) return null;

  const answers = thread.answers || [];

  const startEditAnswer = (i) => { setEditing(i); setEditText(answers[i] || ""); setEditTitle(false); setConfirmDelete(false); };
  const saveEditAnswer = () => {
    if (editing === null) return;
    const updated = { ...thread, answers: [...answers] };
    updated.answers[editing] = editText;
    updated.answered_count = updated.answers.filter((a) => a?.trim()).length;
    onSave(updated);
    setEditing(null);
  };
  const cancelEdit = () => { setEditing(null); setEditTitle(false); setConfirmDelete(false); };

  const startEditTitle = () => { setEditTitle(true); setTitleText(thread.title); setEditing(null); setConfirmDelete(false); };
  const saveEditTitle = () => {
    const updated = { ...thread, title: titleText.trim() || thread.title };
    onSave(updated);
    setEditTitle(false);
  };

  const copyThread = async () => {
    let text = "";
    QUESTIONS.forEach((q, i) => {
      if (answers[i]?.trim()) text += `${q.number}. ${q.title}\n${answers[i].trim()}\n\n`;
    });
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

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div onClick={onClose} className="absolute inset-0 bg-warm-900/30" />
      <div className="relative w-[min(720px,92vw)] h-screen bg-parchment border-l border-warm-300 overflow-y-auto shadow-[-4px_0_24px_rgba(0,0,0,0.08)] font-serif flex flex-col">
        <div className="p-8 pb-20 flex-1">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1 min-w-0">
              <div className="text-[11px] tracking-[3px] uppercase text-warm-500 font-mono mb-1.5">Past Brain Dump</div>
              {editTitle ? (
                <div>
                  <input value={titleText} onChange={(e) => setTitleText(e.target.value)} autoFocus
                    className="text-xl font-serif font-normal w-full px-2.5 py-1.5 border border-warm-500 rounded bg-warm-50 text-warm-900"
                    onKeyDown={(e) => { if (e.key === "Enter") saveEditTitle(); if (e.key === "Escape") cancelEdit(); }}
                  />
                  <div className="mt-2 flex gap-2">
                    <button onClick={saveEditTitle} className="text-xs px-3.5 py-1 bg-warm-900 text-parchment rounded-sm font-serif">Save</button>
                    <button onClick={cancelEdit} className="text-xs px-3.5 py-1 text-warm-500 border border-warm-400 rounded-sm font-serif">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2.5">
                  <h3 className="text-[22px] font-normal leading-snug flex-1">{thread.title}</h3>
                  <button onClick={startEditTitle} className="text-xs text-warm-500 font-serif italic border-b border-dotted border-warm-400 flex-shrink-0 mt-1 hover:text-warm-700">rename</button>
                </div>
              )}
              <div className="text-xs text-warm-500 mt-1 font-mono">
                {formatDate(thread.created_at)} · {thread.time_spent} spent
              </div>
            </div>
            <button onClick={onClose} className="text-2xl text-warm-500 hover:text-warm-700 ml-3">×</button>
          </div>

          {/* Answers */}
          {QUESTIONS.map((q, i) => (
            <div key={i} className={`mb-5 pb-5 ${i < 6 ? "border-b border-warm-200" : ""}`}>
              <div className="flex justify-between items-start mb-1.5">
                <div className="text-[13px] text-warm-500 font-semibold">
                  <span className="font-mono">{q.number}.</span> {q.title}
                </div>
                {editing !== i && (
                  <button onClick={() => startEditAnswer(i)} className="text-xs text-warm-500 font-serif italic border-b border-dotted border-warm-400 flex-shrink-0 ml-3 hover:text-warm-700">edit</button>
                )}
              </div>
              {editing === i ? (
                <div>
                  <textarea ref={editRef} value={editText} onChange={(e) => setEditText(e.target.value)}
                    className="w-full min-h-[120px] p-3.5 text-[14.5px] leading-7 font-serif text-warm-900 bg-warm-50 border border-warm-500 rounded resize-y" />
                  <div className="mt-2 flex gap-2">
                    <button onClick={saveEditAnswer} className="text-xs px-3.5 py-1 bg-warm-900 text-parchment rounded-sm font-serif">Save</button>
                    <button onClick={cancelEdit} className="text-xs px-3.5 py-1 text-warm-500 border border-warm-400 rounded-sm font-serif">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className={`text-[14.5px] leading-7 whitespace-pre-wrap ${answers[i]?.trim() ? "text-warm-900" : "text-warm-400 italic"}`}>
                  {answers[i]?.trim() || "Skipped"}
                </div>
              )}
            </div>
          ))}

          {/* Copy + Delete */}
          <div className="mt-8 pt-6 border-t border-warm-200 flex flex-col items-center gap-3">
            <button onClick={copyThread}
              className={`text-[13px] px-6 py-2 rounded-sm font-serif transition-colors ${copyFeedback === "Copied!" ? "bg-success text-white" : "bg-warm-900 text-parchment hover:bg-warm-800"}`}>
              {copyFeedback || "Copy to clipboard"}
            </button>
            {!confirmDelete ? (
              <button onClick={() => setConfirmDelete(true)}
                className="text-[13px] px-6 py-2 text-danger border-[1.5px] border-danger rounded-sm font-serif hover:bg-danger hover:text-white transition-colors">
                Delete this brain dump
              </button>
            ) : (
              <div className="text-center">
                <p className="text-sm text-danger italic mb-3">Are you sure? This can't be undone.</p>
                <div className="flex justify-center gap-2.5">
                  <button onClick={() => onDelete(thread.id)} className="text-[13px] px-6 py-2 bg-danger text-white rounded-sm font-serif">Yes, delete it</button>
                  <button onClick={() => setConfirmDelete(false)} className="text-[13px] px-6 py-2 text-warm-500 border border-warm-400 rounded-sm font-serif">Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
