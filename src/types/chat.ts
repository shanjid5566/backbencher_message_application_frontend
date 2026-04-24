// ─── User & Conversation Types ────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  isOnline: boolean;
  lastSeen?: string; // e.g. "2 mins ago"
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string; // ISO string
  status?: "sent" | "delivered" | "read";
  fileUrl?: string | null;
  fileType?: string | null;
}

export interface Conversation {
  id: string;
  participant: User;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
}
