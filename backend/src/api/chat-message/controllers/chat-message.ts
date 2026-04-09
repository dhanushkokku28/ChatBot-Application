import { factories } from "@strapi/strapi";

function asCleanText(value: unknown): string {
  return String(value || "").trim();
}

async function notifyRealtimeRelay(entry: {
  id?: number | string;
  documentId?: string;
  room?: string;
  sender?: string;
  message?: string;
  createdAt?: string | Date;
}): Promise<void> {
  const relayUrl =
    process.env.REALTIME_WEBHOOK_URL ||
    `http://localhost:${process.env.SOCKET_PORT || "3001"}/webhooks/chat-message`;
  const webhookToken = process.env.STRAPI_WEBHOOK_TOKEN || "chat-webhook-secret";

  try {
    await fetch(relayUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${webhookToken}`,
      },
      body: JSON.stringify({
        event: "entry.create",
        model: "api::chat-message.chat-message",
        entry: {
          ...entry,
          createdAt: entry.createdAt ? String(entry.createdAt) : undefined,
        },
      }),
    });
  } catch {
    // Keep chat persistence successful even if realtime relay is temporarily unavailable.
  }
}

export default factories.createCoreController(
  "api::chat-message.chat-message",
  ({ strapi }) => ({
    async create(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized("Please login before sending a message.");
      }

      const room = asCleanText(ctx.request.body?.data?.room);
      const message = asCleanText(ctx.request.body?.data?.message);

      if (!room || !message) {
        return ctx.badRequest("Both room and message are required.");
      }

      const sender =
        asCleanText(user.username) ||
        asCleanText(user.email) ||
        `user-${String(user.id || "")}`;

      const createdMessage = await strapi
        .documents("api::chat-message.chat-message")
        .create({
          data: {
            room,
            sender,
            message: message.slice(0, 1000),
          },
        });

      await notifyRealtimeRelay({
        id: createdMessage.id,
        documentId: createdMessage.documentId,
        room: createdMessage.room,
        sender: createdMessage.sender,
        message: createdMessage.message,
        createdAt: createdMessage.createdAt,
      });

      return this.transformResponse(createdMessage);
    },
  })
);
