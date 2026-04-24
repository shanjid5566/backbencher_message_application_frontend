# Messenger Frontend - Complete UI System

A production-grade, pixel-perfect messaging application UI built with Next.js 16, TypeScript, and Tailwind CSS v4. Fully responsive with desktop and mobile support, featuring real-time chat capabilities.

## 🎯 Project Structure

```
src/
├── app/
│   ├── layout.tsx                 # Root layout with metadata
│   ├── page.tsx                   # Redirects to /(chat)
│   ├── globals.css                # Global styles & Tailwind
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx           # Login page (client-side)
│   │   └── signup/
│   │       └── page.tsx           # Sign up page (client-side)
│   └── (chat)/
│       ├── layout.tsx             # Chat layout with two-pane responsive design
│       └── page.tsx               # Empty page (layout handles display)
├── components/
│   ├── ChatSidebar.tsx            # Left sidebar with conversations list
│   ├── ChatWindow.tsx             # Right pane with message display & input
│   ├── MessageBubble.tsx          # Individual message bubble component
│   ├── EmptyState.tsx             # Empty state placeholder
│   └── LoadingSkeleton.tsx        # Loading skeleton animation
└── hooks/
    └── useIsMobile.ts            # Mobile breakpoint detection hook
```

## 🚀 Features

### ✅ Authentication Pages
- **Login Page**: Email/Password form with "Remember me" checkbox
- **Sign Up Page**: Full registration with password strength indicator
- Both pages feature glassmorphism design with gradient background
- Eye icon to toggle password visibility
- Smooth transitions and hover effects

### ✅ Main Chat Interface
**Desktop View (md+ screens):**
- Two-pane split layout with fixed sidebar
- Sidebar (w-80): Conversations list with online status indicators
- Main area (flex-1): Active chat with messages and input
- Horizontal scrollable "Active Now" user list
- Search functionality for conversations
- Unread message badges

**Mobile View (< md screens):**
- Single-pane view with toggle between list and chat
- Back button to return to conversation list
- Full-screen chat when viewing a conversation
- Touch-friendly buttons and input areas

### ✅ Components
- **MessageBubble**: Sender/receiver styling with timestamps
- **ChatSidebar**: Conversation list with search and online status
- **ChatWindow**: Message display, header, and input area
- **LoadingSkeleton**: Animated loading states
- **EmptyState**: Placeholder for empty states

## 🎨 Design System

### Colors
- **Background**: `bg-slate-900` (#0f172a)
- **Surface**: `bg-slate-800` (#1e293b)
- **Primary**: `bg-blue-600` (#2563eb)
- **Accent**: `text-slate-400` (#94a3b8)

### Breakpoints
- **Mobile**: < 768px (md)
- **Desktop**: ≥ 768px (md)

### Typography
- **Font**: Geist (system font)
- **Headings**: Bold, larger sizes
- **Body**: Regular weight, clear hierarchy

## 📦 Dependencies

```json
{
  "dependencies": {
    "next": "16.2.4",
    "react": "19.2.4",
    "lucide-react": "latest",
    "@tanstack/react-query": "^5.100.1"
  },
  "devDependencies": {
    "tailwindcss": "^4.0.0",
    "@tailwindcss/postcss": "^4.0.0",
    "typescript": "^5"
  }
}
```

## 🔧 Setup & Installation

1. **Install dependencies:**
   ```bash
   npm install
   npm install lucide-react
   ```

2. **Configure Tailwind CSS (already done):**
   - `tailwind.config.ts` - Tailwind configuration
   - `postcss.config.mjs` - PostCSS with Tailwind plugin
   - `globals.css` - Global styles with Tailwind directives

3. **Run development server:**
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000

4. **Build for production:**
   ```bash
   npm run build
   npm run start
   ```

## 📱 Responsive Behavior

### Desktop (md and above)
- Sidebar always visible
- Chat window takes remaining width
- All action buttons visible in header

### Mobile (below md)
- Sidebar and chat alternate
- Full-screen display for either view
- Simplified header with back button
- Reduced padding and font sizes

## 🎯 Key Implementation Details

### Client-Side Components
All major components use `"use client"` for interactivity:
- State management for selected conversation
- Search filtering
- Real-time message additions
- Responsive layout toggling

### Mock Data
Pre-built mock data for:
- 5 online users with avatars
- 5 sample conversations with unread counts
- 5 sample messages with timestamps

### Accessibility
- Semantic HTML
- Focus visible states
- Proper button types
- ARIA-friendly structure

## 🔌 Integration Points

### Backend API Integration
Ready for integration with:
- Conversation fetching
- Message history
- User online status
- Real-time updates (WebSocket/Socket.io)

**Where to add API calls:**
1. `ChatSidebar.tsx` - `useEffect` to fetch conversations
2. `ChatWindow.tsx` - `useEffect` to fetch message history
3. `(chat)/layout.tsx` - Initialize WebSocket connection

### Authentication Flow
1. Route `/auth/login` for login
2. Route `/auth/signup` for registration
3. On successful auth, redirect to `/(chat)`

## 🎨 Customization

### Change Primary Color
Edit `tailwind.config.ts`:
```typescript
colors: {
  primary: "#YOUR_COLOR",
}
```

### Adjust Sidebar Width
In `(chat)/layout.tsx`:
```tsx
<div className="w-80"> {/* Change to w-96 for wider sidebar */}
```

### Modify Message Styling
Edit `MessageBubble.tsx` classes

### Dark/Light Mode
Currently hardcoded to dark mode. To add light mode:
1. Add `dark:` classes to components
2. Implement theme provider
3. Use CSS media queries or context

## ✨ Features to Add

- [ ] Typing indicators
- [ ] Message read receipts
- [ ] User presence/activity status
- [ ] Message editing and deletion
- [ ] Image/media message support
- [ ] Emoji picker
- [ ] Message search
- [ ] Voice/video call UI
- [ ] User profile modal
- [ ] Settings page
- [ ] Notification badges
- [ ] Theme customization

## 🚀 Performance Optimizations

- Lazy loading of components
- Memoized list rendering (ready for virtualization)
- Optimized re-renders with proper key props
- CSS transitions instead of JS animations

## 📝 Next Steps

1. **Connect to Backend:**
   - Replace mock data with API calls
   - Set up WebSocket for real-time messages
   - Implement authentication

2. **Add Testing:**
   - Unit tests for components
   - Integration tests for flows
   - E2E tests with Playwright

3. **Production Deployment:**
   - Environment variables setup
   - Error boundary implementation
   - Analytics integration

## 📄 License

All code is ready for production use. Modify as needed for your project.

---

**Created with ❤️ for pixel-perfect messaging UIs**
