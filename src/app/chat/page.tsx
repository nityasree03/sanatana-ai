import type { Metadata } from "next";
import { Suspense } from "react";
import { ChatScreen } from "@/components/ChatScreen";

export const metadata: Metadata = { title: "Chat" };

function ChatLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 text-center text-muted" role="status">
      Opening the chat…
    </div>
  );
}

export default function ChatPage() {
  // ChatScreen reads ?companion= from the URL, so it sits inside a Suspense boundary.
  return (
    <Suspense fallback={<ChatLoading />}>
      <ChatScreen />
    </Suspense>
  );
}
