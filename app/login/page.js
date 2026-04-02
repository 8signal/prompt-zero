"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [mode, setMode] = useState("login"); // login | signup | magic
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError(""); setMessage("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); }
    else { router.push("/dashboard"); router.refresh(); }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true); setError(""); setMessage("");
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) { setError(error.message); setLoading(false); }
    else { setMessage("Check your email to confirm your account."); setLoading(false); }
  };

  const handleMagicLink = async (e) => {
    e.preventDefault();
    setLoading(true); setError(""); setMessage("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) { setError(error.message); setLoading(false); }
    else { setMessage("Check your email for a login link."); setLoading(false); }
  };

  const handleSubmit = mode === "login" ? handleLogin : mode === "signup" ? handleSignup : handleMagicLink;

  return (
    <div className="min-h-screen bg-parchment flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-[11px] tracking-[4px] uppercase text-warm-500 font-mono mb-4">
            Before You Open the Chat
          </div>
          <h1 className="text-4xl font-normal mb-2 tracking-tight">Prompt Zero</h1>
          <div className="w-10 h-0.5 bg-warm-900 mx-auto my-4" />
          <p className="text-sm text-warm-600 italic max-w-xs mx-auto leading-relaxed">
            Get your thinking out of your head before AI has a chance to reshape it.
          </p>
        </div>

        {/* Mode tabs */}
        <div className="flex justify-center gap-1 mb-8 bg-warm-100 rounded p-1">
          {[
            { key: "login", label: "Sign in" },
            { key: "signup", label: "Sign up" },
            { key: "magic", label: "Magic link" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setMode(tab.key); setError(""); setMessage(""); }}
              className={`px-5 py-2 text-sm font-serif rounded transition-all ${
                mode === tab.key
                  ? "bg-warm-900 text-parchment"
                  : "text-warm-500 hover:text-warm-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="bg-warm-50 border border-warm-300 rounded p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs tracking-[2px] uppercase text-warm-500 font-mono mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-parchment border border-warm-300 rounded text-warm-900 font-serif text-base"
                placeholder="you@example.com"
              />
            </div>

            {mode !== "magic" && (
              <div>
                <label className="block text-xs tracking-[2px] uppercase text-warm-500 font-mono mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-parchment border border-warm-300 rounded text-warm-900 font-serif text-base"
                  placeholder={mode === "signup" ? "At least 6 characters" : "Your password"}
                />
              </div>
            )}

            {error && (
              <div className="text-danger text-sm italic">{error}</div>
            )}
            {message && (
              <div className="text-success text-sm italic">{message}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-warm-900 text-parchment font-serif text-base rounded hover:bg-warm-800 disabled:opacity-50 transition-colors"
            >
              {loading
                ? "..."
                : mode === "login"
                ? "Sign in"
                : mode === "signup"
                ? "Create account"
                : "Send magic link"}
            </button>
          </form>
        </div>

        <div className="text-center mt-8 text-xs text-warm-400 italic">
          Concept by Nate Jones
        </div>
      </div>
    </div>
  );
}
