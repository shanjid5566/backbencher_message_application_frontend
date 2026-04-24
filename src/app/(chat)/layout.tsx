import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Backbencher – Chats",
  description: "Your conversations — powered by Backbencher Messenger.",
};

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
