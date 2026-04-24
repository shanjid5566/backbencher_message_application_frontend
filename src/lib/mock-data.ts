import { Conversation, User } from "@/types/chat";

// ─── Active / Online Users ────────────────────────────────────────────────────
export const ONLINE_USERS: User[] = [
  {
    id: "u1",
    name: "Aria Chen",
    avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=Aria&backgroundColor=b6e3f4",
    isOnline: true,
  },
  {
    id: "u2",
    name: "Marcus Lee",
    avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=Marcus&backgroundColor=c0aede",
    isOnline: true,
  },
  {
    id: "u3",
    name: "Sofia Park",
    avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=Sofia&backgroundColor=ffdfbf",
    isOnline: false,
    lastSeen: "5m ago",
  },
  {
    id: "u4",
    name: "Jake Torres",
    avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=Jake&backgroundColor=d1d4f9",
    isOnline: true,
  },
  {
    id: "u5",
    name: "Priya Nair",
    avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=Priya&backgroundColor=ffd5dc",
    isOnline: true,
  },
  {
    id: "u6",
    name: "Liam Walsh",
    avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=Liam&backgroundColor=b6e3f4",
    isOnline: false,
    lastSeen: "1h ago",
  },
];

// ─── Current Logged-in User ───────────────────────────────────────────────────
export const CURRENT_USER: User = {
  id: "me",
  name: "You",
  avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=CurrentUser&backgroundColor=c0aede",
  isOnline: true,
};

// ─── Conversations (with embedded messages) ───────────────────────────────────
export const CONVERSATIONS: Conversation[] = [
  {
    id: "c1",
    participant: ONLINE_USERS[0],
    lastMessage: "Sounds great! Let's catch up later 🙌",
    lastMessageTime: "9:42 AM",
    unreadCount: 3,
    messages: [
      {
        id: "m1",
        senderId: "u1",
        text: "Hey! Are you free this weekend?",
        timestamp: "2026-04-24T09:30:00Z",
        status: "read",
      },
      {
        id: "m2",
        senderId: "me",
        text: "Yeah, what did you have in mind?",
        timestamp: "2026-04-24T09:32:00Z",
        status: "read",
      },
      {
        id: "m3",
        senderId: "u1",
        text: "I was thinking maybe a coffee meetup or a quick hike?",
        timestamp: "2026-04-24T09:35:00Z",
        status: "read",
      },
      {
        id: "m4",
        senderId: "me",
        text: "Hike sounds fun! Let's do Saturday morning 🏔️",
        timestamp: "2026-04-24T09:38:00Z",
        status: "read",
      },
      {
        id: "m5",
        senderId: "u1",
        text: "Sounds great! Let's catch up later 🙌",
        timestamp: "2026-04-24T09:42:00Z",
        status: "read",
      },
    ],
  },
  {
    id: "c2",
    participant: ONLINE_USERS[1],
    lastMessage: "Did you push the latest changes to GitHub?",
    lastMessageTime: "8:15 AM",
    unreadCount: 0,
    messages: [
      {
        id: "m6",
        senderId: "me",
        text: "Hey Marcus, quick question about the project.",
        timestamp: "2026-04-24T08:00:00Z",
        status: "read",
      },
      {
        id: "m7",
        senderId: "u2",
        text: "Sure, what's up?",
        timestamp: "2026-04-24T08:05:00Z",
        status: "read",
      },
      {
        id: "m8",
        senderId: "u2",
        text: "Did you push the latest changes to GitHub?",
        timestamp: "2026-04-24T08:15:00Z",
        status: "delivered",
      },
    ],
  },
  {
    id: "c3",
    participant: ONLINE_USERS[2],
    lastMessage: "Looking forward to the meeting tomorrow 📅",
    lastMessageTime: "Yesterday",
    unreadCount: 1,
    messages: [
      {
        id: "m9",
        senderId: "u3",
        text: "Hey, can you confirm the meeting time?",
        timestamp: "2026-04-23T14:00:00Z",
        status: "read",
      },
      {
        id: "m10",
        senderId: "me",
        text: "It's at 10 AM tomorrow, should be around an hour.",
        timestamp: "2026-04-23T14:10:00Z",
        status: "read",
      },
      {
        id: "m11",
        senderId: "u3",
        text: "Looking forward to the meeting tomorrow 📅",
        timestamp: "2026-04-23T14:15:00Z",
        status: "delivered",
      },
    ],
  },
  {
    id: "c4",
    participant: ONLINE_USERS[3],
    lastMessage: "Let me know when you're done reviewing the PR.",
    lastMessageTime: "Yesterday",
    unreadCount: 0,
    messages: [
      {
        id: "m12",
        senderId: "u4",
        text: "Hey, I opened a PR for the new feature. Can you review?",
        timestamp: "2026-04-23T10:00:00Z",
        status: "read",
      },
      {
        id: "m13",
        senderId: "me",
        text: "On it! Will check by EOD.",
        timestamp: "2026-04-23T10:05:00Z",
        status: "read",
      },
      {
        id: "m14",
        senderId: "u4",
        text: "Let me know when you're done reviewing the PR.",
        timestamp: "2026-04-23T10:10:00Z",
        status: "delivered",
      },
    ],
  },
  {
    id: "c5",
    participant: ONLINE_USERS[4],
    lastMessage: "I sent you the design files ✨",
    lastMessageTime: "Mon",
    unreadCount: 2,
    messages: [
      {
        id: "m15",
        senderId: "u5",
        text: "Here are the updated Figma frames.",
        timestamp: "2026-04-21T11:00:00Z",
        status: "read",
      },
      {
        id: "m16",
        senderId: "u5",
        text: "I sent you the design files ✨",
        timestamp: "2026-04-21T11:05:00Z",
        status: "delivered",
      },
    ],
  },
  {
    id: "c6",
    participant: ONLINE_USERS[5],
    lastMessage: "Good night 🌙",
    lastMessageTime: "Sun",
    unreadCount: 0,
    messages: [
      {
        id: "m17",
        senderId: "me",
        text: "Heading to bed, talk tomorrow!",
        timestamp: "2026-04-20T23:00:00Z",
        status: "read",
      },
      {
        id: "m18",
        senderId: "u6",
        text: "Good night 🌙",
        timestamp: "2026-04-20T23:02:00Z",
        status: "read",
      },
    ],
  },
];
