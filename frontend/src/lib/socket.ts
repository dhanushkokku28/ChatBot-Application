import { io, type Socket } from "socket.io-client";
import { SOCKET_URL } from "@/lib/config";

export function createSocketClient(): Socket {
  return io(SOCKET_URL, {
    autoConnect: true,
  });
}
