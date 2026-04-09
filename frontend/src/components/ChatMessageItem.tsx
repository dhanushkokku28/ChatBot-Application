import type { ChatMessage } from "@/types/chat";

type ChatMessageItemProps = {
  message: ChatMessage;
  isOwnMessage: boolean;
};

export default function ChatMessageItem({
  message,
  isOwnMessage,
}: ChatMessageItemProps) {
  const sentAt = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <article
      className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
        isOwnMessage
          ? "ml-auto bg-sky-900 text-white"
          : "mr-auto border border-slate-200 bg-white text-slate-900"
      }`}
    >
      <div className="mb-1 flex items-center justify-between gap-3 text-xs font-semibold opacity-80">
        <span>{message.sender}</span>
        <time>{sentAt}</time>
      </div>
      <p className="whitespace-pre-wrap break-words text-sm leading-6">{message.message}</p>
    </article>
  );
}
