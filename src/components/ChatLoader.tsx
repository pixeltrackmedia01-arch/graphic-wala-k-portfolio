"use client";
import dynamic from "next/dynamic";

// Lazy-loaded after hydration so the assistant never competes with the hero for bandwidth.
const ChatWidget = dynamic(() => import("./ChatWidget").then((m) => m.ChatWidget), { ssr: false });

export function ChatLoader() {
  return <ChatWidget />;
}
