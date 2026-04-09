import { STRAPI_URL } from "@/lib/config";
import type { AuthSession, ChatMessage } from "@/types/chat";

type StrapiCollectionResponse<T> = {
  data: T[];
};

type StrapiEntity = {
  id?: string | number;
  documentId?: string;
  room?: string;
  sender?: string;
  message?: string;
  createdAt?: string;
  attributes?: {
    room?: string;
    sender?: string;
    message?: string;
    createdAt?: string;
  };
};

function normalizeMessage(entity: StrapiEntity): ChatMessage {
  const attrs = entity.attributes || {};

  return {
    id: String(entity.id || entity.documentId || crypto.randomUUID()),
    room: String(entity.room || attrs.room || ""),
    sender: String(entity.sender || attrs.sender || "Anonymous"),
    message: String(entity.message || attrs.message || ""),
    createdAt: String(entity.createdAt || attrs.createdAt || new Date().toISOString()),
  };
}

function asErrorMessage(payload: unknown): string {
  if (typeof payload === "string") {
    return payload;
  }

  if (payload && typeof payload === "object") {
    const possibleError = payload as { error?: { message?: string }; message?: string };
    return possibleError.error?.message || possibleError.message || "Request failed.";
  }

  return "Request failed.";
}

async function readJsonResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as T;

  if (!response.ok) {
    throw new Error(asErrorMessage(payload));
  }

  return payload;
}

export async function registerUser(
  username: string,
  password: string
): Promise<AuthSession> {
  const email = `${username.toLowerCase().replace(/[^a-z0-9]/g, "")}.${Date.now()}@chat.local`;

  const response = await fetch(`${STRAPI_URL}/api/auth/local/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      email,
      password,
    }),
  });

  const payload = await readJsonResponse<{
    jwt: string;
    user: { id: number; username: string };
  }>(response);

  return {
    jwt: payload.jwt,
    user: {
      id: payload.user.id,
      username: payload.user.username,
    },
  };
}

export async function loginUser(
  username: string,
  password: string
): Promise<AuthSession> {
  const response = await fetch(`${STRAPI_URL}/api/auth/local`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      identifier: username,
      password,
    }),
  });

  const payload = await readJsonResponse<{
    jwt: string;
    user: { id: number; username: string };
  }>(response);

  return {
    jwt: payload.jwt,
    user: {
      id: payload.user.id,
      username: payload.user.username,
    },
  };
}

export async function getRoomMessages(
  jwt: string,
  room: string
): Promise<ChatMessage[]> {
  const query = new URLSearchParams({
    "filters[room][$eq]": room,
    sort: "createdAt:asc",
  });

  const response = await fetch(`${STRAPI_URL}/api/chat-messages?${query.toString()}`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
    cache: "no-store",
  });

  const payload = await readJsonResponse<StrapiCollectionResponse<StrapiEntity>>(response);

  return payload.data.map(normalizeMessage);
}

export async function sendRoomMessage(
  jwt: string,
  room: string,
  message: string
): Promise<void> {
  const response = await fetch(`${STRAPI_URL}/api/chat-messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({
      data: {
        room,
        message,
      },
    }),
  });

  await readJsonResponse(response);
}
