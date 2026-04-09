"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useSyncExternalStore } from "react";
import AuthPanel from "@/components/AuthPanel";
import RoomJoinPanel from "@/components/RoomJoinPanel";
import {
  getStoredSessionRaw,
  parseStoredSession,
  storeSession,
  subscribeSessionChange,
} from "@/lib/auth";
import type { AuthSession } from "@/types/chat";

export default function Home() {
  const router = useRouter();
  const [sessionOverride, setSessionOverride] = useState<AuthSession | null>(null);
  const [room, setRoom] = useState("general");

  const persistedSession = useSyncExternalStore(
    subscribeSessionChange,
    getStoredSessionRaw,
    () => null
  );

  const parsedPersistedSession = useMemo(
    () => parseStoredSession(persistedSession),
    [persistedSession]
  );

  const session = sessionOverride || parsedPersistedSession;

  function handleAuthenticated(nextSession: AuthSession) {
    storeSession(nextSession);
    setSessionOverride(nextSession);
  }

  function handleJoinRoom() {
    const safeRoom = room.trim().toLowerCase();

    if (!safeRoom) {
      return;
    }

    router.push(`/chat/${encodeURIComponent(safeRoom)}`);
  }

  function handleCreateRoom() {
    const safeRoom = room.trim().toLowerCase();

    if (!safeRoom) {
      return;
    }

    router.push(`/chat/${encodeURIComponent(safeRoom)}`);
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-8 sm:py-10">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_10%_20%,rgba(56,189,248,0.18),transparent_45%),radial-gradient(circle_at_82%_15%,rgba(6,182,212,0.16),transparent_40%),linear-gradient(135deg,#f8fbff_0%,#ecfeff_52%,#eef8ff_100%)]" />

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
        <header className="rounded-3xl border border-slate-200/80 bg-white/75 p-5 shadow-[0_20px_60px_-35px_rgba(2,6,23,0.55)] backdrop-blur sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-sky-700">Saral Chat</p>
              <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                Your Team Conversations, Live
              </h1>
            </div>
            <span className="hidden rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-800 sm:inline-flex">
              Web App
            </span>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-700 sm:text-base">
            Login, join any room, and chat instantly with live presence and real-time message updates.
          </p>
        </header>

        {!session ? (
          <AuthPanel onAuthenticated={handleAuthenticated} />
        ) : (
          <RoomJoinPanel
            room={room}
            username={session.user.username}
            onRoomChange={setRoom}
            onJoin={handleJoinRoom}
            onCreate={handleCreateRoom}
          />
        )}
      </div>
    </main>
  );
}
