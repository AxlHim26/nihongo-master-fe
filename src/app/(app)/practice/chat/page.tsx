import type { Metadata } from "next";

import PracticeChatView from "@/features/practice/components/practice-chat-view";

export const metadata: Metadata = {
  title: "Trò chuyện AI",
  description: "Luyện hội thoại và hỏi đáp ngữ pháp với AI",
};

export default function PracticeChatPage() {
  return <PracticeChatView />;
}
