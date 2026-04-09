export type AuthUser = {
  id: number;
  username: string;
};

export type AuthSession = {
  jwt: string;
  user: AuthUser;
};

export type ChatMessage = {
  id: string;
  room: string;
  sender: string;
  message: string;
  createdAt: string;
};
