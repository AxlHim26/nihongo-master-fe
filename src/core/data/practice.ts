import type { Conversation } from "@/features/practice/types/practice";

export const conversations: Conversation[] = [
  {
    id: "conv-1",
    title: "Cuộc trò chuyện mới",
    createdAt: "2024-06-20T08:00:00.000Z",
    messages: [
      {
        id: "msg-1",
        role: "assistant",
        content: "Chào bạn! Hôm nay bạn muốn luyện ngữ pháp hay từ vựng?",
        createdAt: "2024-06-20T08:00:00.000Z",
      },
    ],
  },
  {
    id: "conv-2",
    title: "Luyện hội thoại nhà hàng",
    createdAt: "2024-06-18T08:00:00.000Z",
    messages: [
      {
        id: "msg-2",
        role: "assistant",
        content: "Cùng luyện hội thoại đặt món nhé!",
        createdAt: "2024-06-18T08:00:00.000Z",
      },
    ],
  },
];
