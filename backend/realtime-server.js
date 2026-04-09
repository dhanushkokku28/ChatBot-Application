require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const SOCKET_PORT = Number(process.env.SOCKET_PORT || 3001);
const STRAPI_WEBHOOK_TOKEN = process.env.STRAPI_WEBHOOK_TOKEN || "chat-webhook-secret";

const app = express();
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
  },
});

const roomUsers = new Map();

function normalizeText(value) {
  return String(value || "").trim();
}

function getPublicUserList(room) {
  const members = roomUsers.get(room);

  if (!members) {
    return [];
  }

  return Array.from(new Set(Array.from(members.values())));
}

function emitRoomUsers(room) {
  io.to(room).emit("room:users", getPublicUserList(room));
}

function removeSocketFromRooms(socketId) {
  roomUsers.forEach((members, room) => {
    if (members.delete(socketId)) {
      emitRoomUsers(room);
    }

    if (members.size === 0) {
      roomUsers.delete(room);
    }
  });
}

io.on("connection", (socket) => {
  socket.on("room:join", ({ room, username }) => {
    const safeRoom = normalizeText(room);
    const safeUsername = normalizeText(username);

    if (!safeRoom || !safeUsername) {
      socket.emit("room:error", "Room and username are required.");
      return;
    }

    removeSocketFromRooms(socket.id);

    socket.join(safeRoom);

    if (!roomUsers.has(safeRoom)) {
      roomUsers.set(safeRoom, new Map());
    }

    roomUsers.get(safeRoom).set(socket.id, safeUsername);

    emitRoomUsers(safeRoom);

    socket.emit("room:joined", {
      room: safeRoom,
      username: safeUsername,
    });
  });

  socket.on("disconnect", () => {
    removeSocketFromRooms(socket.id);
  });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/rooms/:room/users", (req, res) => {
  res.json({ users: getPublicUserList(req.params.room) });
});

app.post("/webhooks/chat-message", (req, res) => {
  const authorization = req.headers.authorization || "";

  if (STRAPI_WEBHOOK_TOKEN && authorization !== `Bearer ${STRAPI_WEBHOOK_TOKEN}`) {
    return res.status(401).json({ error: "Unauthorized webhook request." });
  }

  const event = req.body?.event;
  const model = req.body?.model;
  const entry = req.body?.entry;

  if (event !== "entry.create") {
    return res.status(202).json({ ignored: true, reason: "Unsupported webhook event." });
  }

  if (typeof model === "string" && !model.includes("chat-message")) {
    return res.status(202).json({ ignored: true, reason: "Not a chat-message model event." });
  }

  const room = normalizeText(entry?.room);
  const message = normalizeText(entry?.message);
  const sender = normalizeText(entry?.sender) || "Anonymous";

  if (!room || !message) {
    return res.status(400).json({ error: "Webhook entry is missing room or message." });
  }

  io.to(room).emit("message:new", {
    id: entry?.id || entry?.documentId || Date.now(),
    room,
    message,
    sender,
    createdAt: entry?.createdAt || new Date().toISOString(),
  });

  return res.json({ delivered: true });
});

httpServer.listen(SOCKET_PORT, () => {
  console.log(`Socket relay server listening on http://localhost:${SOCKET_PORT}`);
});
