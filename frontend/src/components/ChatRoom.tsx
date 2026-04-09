"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createSocketClient } from "@/lib/socket";
import { getRoomMessages, sendRoomMessage } from "@/lib/api";
import type { ChatMessage } from "@/types/chat";
import ChatMessageItem from "@/components/ChatMessageItem";
import ActiveUsersPanel from "@/components/ActiveUsersPanel";

type ChatRoomProps = {
  room: string;
  jwt: string;
  username: string;
};

export default function ChatRoom({ room, jwt, username }: ChatRoomProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const bottomAnchorRef = useRef<HTMLDivElement | null>(null);

  const knownMessageIds = useRef(new Set<string>());

  useEffect(() => {
    let active = true;

    async function loadHistory() {
      try {
        const history = await getRoomMessages(jwt, room);

        if (!active) {
          return;
        }

        knownMessageIds.current = new Set(history.map((message) => message.id));
        setMessages(history);
      } catch (err) {
        if (!active) {
          return;
        }

        setError(err instanceof Error ? err.message : "Failed to load room history.");
      }
    }

    loadHistory();

    return () => {
      active = false;
    };
  }, [jwt, room]);

  useEffect(() => {
    const socket = createSocketClient();

    socket.emit("room:join", { room, username });

    socket.on("room:users", (onlineUsers: string[]) => {
      setUsers(Array.isArray(onlineUsers) ? onlineUsers : []);
    });

    socket.on("message:new", (incoming: ChatMessage) => {
      const safeId = String(incoming.id);

      if (knownMessageIds.current.has(safeId)) {
        return;
      }

      knownMessageIds.current.add(safeId);
      setMessages((current) => [...current, incoming]);
    });

    socket.on("room:error", (message: string) => {
      setError(message || "Unable to join chat room.");
    });

    return () => {
      socket.disconnect();
    };
  }, [room, username]);

  useEffect(() => {
    bottomAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sortedMessages = useMemo(() => {
    return [...messages].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [messages]);

  async function handleSendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!newMessage.trim()) {
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await sendRoomMessage(jwt, room, newMessage.trim());
      setNewMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-4 lg:grid-cols-[1fr_280px]">
      <div className="rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-[0_30px_80px_-45px_rgba(2,6,23,0.65)] sm:p-6">
        <header className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Room
            </p>
            <h2 className="text-xl font-black text-slate-900">{room}</h2>
          </div>
          <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-900">
            {username}
          </span>
        </header>

        <div className="h-[420px] space-y-3 overflow-y-auto rounded-2xl bg-slate-50/90 p-3 sm:p-4">
          {sortedMessages.length === 0 ? (
            <p className="text-sm text-slate-500">No messages yet. Send the first one.</p>
          ) : (
            sortedMessages.map((message) => (
              <ChatMessageItem
                key={message.id}
                message={message}
                isOwnMessage={message.sender === username}
              />
            ))
          )}
          <div ref={bottomAnchorRef} />
        </div>

        <form onSubmit={handleSendMessage} className="mt-4 flex gap-3">
          <input
            value={newMessage}
            onChange={(event) => setNewMessage(event.target.value)}
            placeholder="Write your message"
            className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-sky-300 transition focus:ring-4"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-2xl bg-sky-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Sending" : "Send"}
          </button>
        </form>

        {error ? (
          <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        ) : null}
      </div>

      <ActiveUsersPanel users={users} />
    </section>
  );
}
