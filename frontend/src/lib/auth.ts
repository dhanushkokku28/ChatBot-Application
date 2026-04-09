import type { AuthSession } from "@/types/chat";

const SESSION_STORAGE_KEY = "chat-app-session";

function parseSession(rawSession: string | null): AuthSession | null {
  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession) as AuthSession;
  } catch {
    return null;
  }
}

export function getStoredSessionRaw(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(SESSION_STORAGE_KEY);
}

export function getStoredSession(): AuthSession | null {
  return parseSession(getStoredSessionRaw());
}

export function parseStoredSession(rawSession: string | null): AuthSession | null {
  return parseSession(rawSession);
}

export function storeSession(session: AuthSession): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(SESSION_STORAGE_KEY);
}

export function subscribeSessionChange(onChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const listener = () => onChange();
  window.addEventListener("storage", listener);

  return () => {
    window.removeEventListener("storage", listener);
  };
}
