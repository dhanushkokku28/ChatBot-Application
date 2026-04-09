# Real-Time Chat App (Next.js + Strapi + Socket.io)

This repository contains the full-stack assignment implementation:

- `frontend` - Next.js app for authentication, room navigation, and chat UI.
- `backend` - Strapi app for authentication and chat message persistence.
- `backend/realtime-server.js` - Socket.io relay server that receives Strapi webhooks and broadcasts messages in real time.

## Implemented Features

- Username/password registration and login (Strapi users-permissions auth).
- Google OAuth login (Strapi provider + frontend callback flow).
- Facebook OAuth login (Strapi provider + frontend callback flow).
- Room-based chat with dynamic route (`/chat/[room]`).
- Real-time message delivery using Socket.io and webhook bridge.
- Active users list per room from Socket.io presence tracking.
- Message history persisted in Strapi (`Chat Message` content type).
- Basic validation, error feedback, and responsive UI.

## Architecture

1. Frontend logs in or registers via Strapi auth endpoints.
2. Frontend sends chat messages to Strapi REST API (`POST /api/chat-messages`).
3. Strapi stores the message in SQLite.
4. Strapi webhook (`entry.create`) posts payload to relay server (`/webhooks/chat-message`).
5. Relay server emits `message:new` to all socket clients in the target room.
6. Clients subscribe to `room:users` to show active participants.

## Quick Start

## 1) Backend (Strapi)

```bash
cd backend
cp .env.example .env
npm install
npm run develop
```

This starts Strapi on `http://localhost:1337`.

### Configure Google OAuth

1. Create an OAuth Client in Google Cloud Console (Web application).
2. Note your Google Project ID if you want it for console tracking, but the app does not use it directly.
3. Add this authorized redirect URI:
  - `http://localhost:1337/api/connect/google/callback`
4. Put credentials in `backend/.env`:
  - `GOOGLE_CLIENT_ID=...`
  - `GOOGLE_CLIENT_SECRET=...`
5. Ensure frontend callback URL remains `http://localhost:3000/auth/google/callback`.

Google and Facebook OAuth buttons.

### Configure Facebook OAuth

1. Create an App in [Facebook Developers Console](https://developers.facebook.com/).
2. Add `Facebook Login` product to the app.
3. Under App Settings > Basic, get **App ID** and **App Secret**.
4. Add this authorized redirect URI in Facebook Login settings:
  - `http://localhost:1337/api/connect/facebook/callback`
5. Put credentials in `backend/.env`:
  - `FACEBOOK_APP_ID=...`
  - `FACEBOOK_APP_SECRET=...`
6. Ensure frontend callback URL remains `http://localhost:3000/auth/facebook/callback`.

After restarting Strapi, the login page allows `Continue with Facebook
After restarting Strapi, the login page includes `Continue with Google`.

### Create admin user

On first run, Strapi asks for an admin account in browser.

### Configure API permissions

In Strapi Admin:

1. Open `Settings -> Users & Permissions Plugin -> Roles -> Authenticated`.
2. Under `Chat Message`, enable `find` and `create`.
3. Save.

Note: this project also auto-enables these two permissions at bootstrap for convenience.

### Configure webhook to Socket relay

In Strapi Admin:

1. Open `Settings -> Webhooks`.
2. Create webhook:
   - Name: `Chat Message Relay`
   - URL: `http://localhost:3001/webhooks/chat-message`
   - Events: `Entry create`
   - Headers:
     - `Authorization: Bearer chat-webhook-secret`
3. Save and enable.

## 2) Realtime Socket relay

Open a second terminal:

```bash
cd backend
npm run realtime
```

This starts relay server on `http://localhost:3001`.

## 3) Frontend (Next.js)

Open a third terminal:

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev with social auth buttons.
- `frontend/src/app/auth/google/callback/page.tsx` - completes Google OAuth by reading token and storing session.
- `frontend/src/app/auth/facebook/callback/page.tsx` - completes Facebook

Frontend runs on `http://localhost:3000`.

## Room Flow

1. Register or login with username/password.
2. Enter a room name from the lobby.
3. Send messages.
4. Open multiple tabs/users to see real-time updates and active users list.

## Code Structure

- `frontend/src/components/AuthPanel.tsx` - registration/login component.
- `frontend/src/app/auth/google/callback/page.tsx` - completes Google OAuth by reading token and storing session.
- `frontend/src/components/RoomJoinPanel.tsx` - room selection interface.
- `frontend/src/components/ChatRoom.tsx` - chat room shell, socket and data handling.
- `frontend/src/components/ChatMessageItem.tsx` - individual message component.
- `frontend/src/components/ActiveUsersPanel.tsx` - online users list.
- `frontend/src/lib/api.ts` - Strapi auth/message API calls.
- `frontend/src/lib/socket.ts` - Socket.io client factory.
- `backend/src/api/chat-message/...` - Strapi content type, routes, controller, service.
- `backend/realtime-server.js` - Socket.io relay and webhook endpoint.

## Notes

- Registration uses Strapi's auth model and auto-generates a local email from username because Strapi registration requires email by default.
- Google login uses Strapi provider endpoints (`/api/connect/google`) and redirects through frontend callback.
- Database is SQLite (quickstart default), so message history is persisted locally in backend data files.
- If webhook auth token changes, update both `backend/.env` and Strapi webhook header.
