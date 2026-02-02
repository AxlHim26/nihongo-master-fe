export type ConversationMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  emotion?: "happy" | "sad" | "surprised" | "caring" | "shy" | "confused" | "neutral";
};

export type Conversation = {
  id: string;
  title: string;
  createdAt: string;
  messages: ConversationMessage[];
};
