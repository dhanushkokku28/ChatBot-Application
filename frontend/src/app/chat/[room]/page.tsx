"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import ChatRoom from "@/components/ChatRoom";
import {
  clearSession,
  getStoredSessionRaw,
  parseStoredSession,
  subscribeSessionChange,
} from "@/lib/auth";

export default function ChatRoomPage() {
  const params = useParams<{ room: string }>();
  const router = useRouter();
  const rawSession = useSyncExternalStore(
    subscribeSessionChange,
    getStoredSessionRaw,
    () => null
  );

  const session = useMemo(() => parseStoredSession(rawSession), [rawSession]);

  useEffect(() => {
    if (!session) {
      router.replace("/");
    }
  }, [router, session]);

  const room = useMemo(() => {
    const rawRoom = Array.isArray(params.room) ? params.room[0] : params.room;
    return decodeURIComponent(rawRoom || "").trim();
  }, [params.room]);

  if (!session || !room) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#f8fafc_0%,#eff6ff_40%,#fff7ed_100%)] px-4 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto mb-5 flex w-full max-w-6xl items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm backdrop-blur sm:px-5">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-sky-900 text-sm font-black text-white">
            SC
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Saral Chat</p>
            <p className="text-sm font-semibold text-slate-800">Room: {room}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Lobby
          </Link>
          <button
            type="button"
            onClick={() => {
              clearSession();
              router.push("/");
            }}
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            Logout
          </button>
        </div>
      </div>

      <ChatRoom room={room} jwt={session.jwt} username={session.user.username} />
    </main>
  );
}
