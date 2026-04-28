import type { Metadata,Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Backbencher Message",
  description: "Chat and Video Call Application",
  manifest: "/manifest.json", // Add this line
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Backbencher",
  },
};

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
