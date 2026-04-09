"use client";

import { useMemo, useState } from "react";
import { getFacebookAuthUrl, getGoogleAuthUrl, loginUser, registerUser } from "@/lib/api";
import type { AuthSession } from "@/types/chat";

type AuthMode = "login" | "register";

type AuthPanelProps = {
  onAuthenticated: (session: AuthSession) => void;
};

export default function AuthPanel({ onAuthenticated }: AuthPanelProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const title = useMemo(
    () => (mode === "login" ? "Sign in to chat" : "Create your account"),
    [mode]
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!username.trim() || !password.trim()) {
      setError("Username and password are required.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const session =
        mode === "login"
          ? await loginUser(username.trim(), password)
          : await registerUser(username.trim(), password);

      onAuthenticated(session);
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleGoogleLogin() {
    window.location.assign(getGoogleAuthUrl());
  }

  function handleFacebookLogin() {
    window.location.assign(getFacebookAuthUrl());
  }

  return (
    <section className="w-full rounded-3xl border border-sky-200/70 bg-white/80 p-6 shadow-[0_20px_60px_-30px_rgba(8,47,73,0.55)] backdrop-blur sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-black tracking-tight text-sky-950">{title}</h2>
        <div className="inline-flex rounded-full border border-sky-300 bg-sky-50 p-1 text-sm font-semibold">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`rounded-full px-3 py-1 transition ${
              mode === "login"
                ? "bg-sky-900 text-white"
                : "text-sky-900 hover:bg-sky-100"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`rounded-full px-3 py-1 transition ${
              mode === "register"
                ? "bg-sky-900 text-white"
                : "text-sky-900 hover:bg-sky-100"
            }`}
          >
            Register
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-sky-950">Username</span>
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="w-full rounded-2xl border border-sky-200 bg-white px-4 py-3 text-sky-950 outline-none ring-sky-300 transition focus:ring-4"
            placeholder="e.g. neo_writes_code"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-sky-950">Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-2xl border border-sky-200 bg-white px-4 py-3 text-sky-950 outline-none ring-sky-300 transition focus:ring-4"
            placeholder="At least 6 characters"
          />
        </label>

        {error ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-2xl bg-sky-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading ? "Please wait..." : mode === "login" ? "Login" : "Register"}
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-50"
          >
            Google
          </button>
          <button
            type="button"
            onClick={handleFacebookLogin}
            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-50"
          >
            Facebook
          </button>
        </div>
      </form>
    </section>
  );
}
