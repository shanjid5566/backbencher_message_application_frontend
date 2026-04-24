# Backend Integration Guide

This guide shows you how to connect the frontend UI to your Node.js/Prisma backend.

## 🔗 API Endpoints Expected

### Authentication
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/signup` - Register new user
- `GET /api/auth/me` - Get current user

### Conversations
- `GET /api/conversations` - Get user's conversations
- `POST /api/conversations` - Create new conversation
- `GET /api/conversations/:id` - Get conversation details
- `PUT /api/conversations/:id` - Update conversation
- `DELETE /api/conversations/:id` - Delete conversation

### Messages
- `GET /api/conversations/:conversationId/messages` - Get messages
- `POST /api/messages` - Send message
- `PUT /api/messages/:id` - Edit message
- `DELETE /api/messages/:id` - Delete message

### Users
- `GET /api/users` - Get all users (for online status)
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile

---

## 📝 Integration Examples

### 1. Replace Mock Data in Chat Layout

**File: `src/app/(chat)/layout.tsx`**

```typescript
"use client";

import React, { useState, useEffect } from "react";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatWindow } from "@/components/ChatWindow";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [conversations, setConversations] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch conversations and online users
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch conversations
        const conversationsResponse = await fetch("/api/conversations", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
        const conversationsData = await conversationsResponse.json();
        setConversations(conversationsData);

        // Fetch online users
        const usersResponse = await fetch("/api/users", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
        const usersData = await usersResponse.json();
        setOnlineUsers(usersData.filter((u: any) => u.isOnline));

        // Set default conversation
        if (conversationsData.length > 0) {
          setSelectedConversationId(conversationsData[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const selectedConversation = conversations.find(
    (c: any) => c.id === selectedConversationId
  ) || conversations[0];

  if (loading) {
    return <div>Loading...</div>; // Use LoadingSkeleton component
  }

  return (
    <div className="h-screen flex flex-col md:flex-row bg-slate-900 overflow-hidden">
      <div className="w-full md:w-80 h-full md:h-screen border-r border-slate-800 flex-shrink-0">
        <ChatSidebar
          conversations={conversations}
          onlineUsers={onlineUsers}
          selectedConversationId={selectedConversationId}
          onSelectConversation={setSelectedConversationId}
        />
      </div>

      <div className="flex-1 h-full">
        {selectedConversation && (
          <ChatWindow
            conversationName={selectedConversation.name}
            conversationAvatar={selectedConversation.avatar}
            conversationOnline={selectedConversation.isOnline}
            messages={selectedConversation.messages || []}
          />
        )}
      </div>
    </div>
  );
}
```

### 2. Fetch Messages in ChatWindow

**File: `src/app/components/ChatWindow.tsx`**

```typescript
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Phone, Video, Info, Send, Paperclip } from "lucide-react";
import { MessageBubble } from "./MessageBubble";

interface ChatWindowProps {
  conversationId: string;
  conversationName: string;
  conversationAvatar: string;
  conversationOnline: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversationId,
  conversationName,
  conversationAvatar,
  conversationOnline,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages when conversation changes
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/conversations/${conversationId}/messages`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Set up WebSocket for real-time updates
    const ws = new WebSocket(`ws://localhost:3001/conversations/${conversationId}`);
    
    ws.onmessage = (event) => {
      const newMessage = JSON.parse(event.data);
      setMessages((prev) => [...prev, newMessage]);
    };

    return () => ws.close();
  }, [conversationId]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          conversationId,
          text: inputValue,
        }),
      });

      if (response.ok) {
        const newMessage = await response.json();
        setMessages((prev) => [...prev, newMessage]);
        setInputValue("");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <img
            src={conversationAvatar}
            alt={conversationName}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h2 className="text-sm font-semibold text-white">
              {conversationName}
            </h2>
            <p className="text-xs text-slate-400">
              {conversationOnline ? "Active now" : "Active 2h ago"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-slate-700 rounded-full">
            <Phone size={18} className="text-slate-400" />
          </button>
          <button className="p-2 hover:bg-slate-700 rounded-full">
            <Video size={18} className="text-slate-400" />
          </button>
          <button className="p-2 hover:bg-slate-700 rounded-full">
            <Info size={18} className="text-slate-400" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div>Loading messages...</div>
        ) : (
          messages.map((message: any) => (
            <MessageBubble
              key={message.id}
              message={message.text}
              isSender={message.senderId === localStorage.getItem("userId")}
              timestamp={new Date(message.createdAt).toLocaleTimeString()}
              senderName={message.sender?.name}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-slate-700 rounded-full">
            <Paperclip size={18} className="text-slate-400" />
          </button>
          <input
            type="text"
            placeholder="Write a message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="flex-1 bg-slate-800 text-white rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSendMessage}
            className="p-2 bg-blue-600 hover:bg-blue-700 rounded-full"
          >
            <Send size={18} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};
```

### 3. Real-Time Updates with Socket.io

```typescript
// Create a WebSocket/Socket.io service
// src/services/socket.ts

import io, { Socket } from "socket.io-client";

let socket: Socket | null = null;

export const initializeSocket = (token: string) => {
  if (socket) return socket;

  socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001", {
    auth: {
      token,
    },
  });

  socket.on("message:new", (message) => {
    // Emit custom event for components to listen
    window.dispatchEvent(
      new CustomEvent("newMessage", { detail: message })
    );
  });

  socket.on("user:status", (user) => {
    window.dispatchEvent(
      new CustomEvent("userStatus", { detail: user })
    );
  });

  return socket;
};

export const sendMessage = (conversationId: string, text: string) => {
  if (socket) {
    socket.emit("message:send", { conversationId, text });
  }
};

export const getSocket = () => socket;
```

### 4. Authentication Integration

**File: `src/app/auth/login/page.tsx`**

```typescript
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();
      
      // Store auth token
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userId", data.user.id);

      // Redirect to chat
      router.push("/(chat)");
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // ... form JSX
  );
}
```

---

## 🔌 Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=ws://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🔒 Authentication Flow

1. User logs in → Store token in localStorage
2. Add token to all API requests in `Authorization` header
3. Redirect to `/(chat)` on successful login
4. Create middleware to check auth on protected routes

---

## ⚡ Real-Time Updates with Socket.io

```typescript
// Listen for real-time updates in components
useEffect(() => {
  const handleNewMessage = (event: any) => {
    setMessages((prev) => [...prev, event.detail]);
  };

  window.addEventListener("newMessage", handleNewMessage);
  return () => window.removeEventListener("newMessage", handleNewMessage);
}, []);
```

---

## 🧪 Testing API Integration

Use Postman or curl to test your endpoints:

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Fetch conversations
curl -X GET http://localhost:3001/api/conversations \
  -H "Authorization: Bearer YOUR_TOKEN"

# Send message
curl -X POST http://localhost:3001/api/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"conversationId":"123","text":"Hello"}'
```

---

## 📚 Additional Resources

- [Next.js Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [Socket.io Client](https://socket.io/docs/v4/client-api/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [React Query/TanStack Query](https://tanstack.com/query/latest)

---

## ✅ Checklist for Full Integration

- [ ] Set up API endpoints on backend
- [ ] Configure CORS for frontend-backend communication
- [ ] Implement authentication flow
- [ ] Set up Socket.io for real-time messaging
- [ ] Replace mock data with API calls
- [ ] Add error handling and loading states
- [ ] Implement offline support (optional)
- [ ] Add message caching (optional)
- [ ] Set up Redux/Zustand for state management (optional)

---

**Happy integrating! 🚀**
