import { useState } from "react";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import type { Message } from "./types";

export function ChatView() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (content: string) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // TODO: 실제 AI API 연동
    // 지금은 에코 응답
    setTimeout(() => {
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `받은 메시지: "${content}"\n\n아직 AI 연동이 안 되어서 에코 응답입니다.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-900">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-zinc-700 bg-zinc-900">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
          C
        </div>
        <div>
          <h1 className="text-zinc-100 font-semibold">Careti</h1>
          <p className="text-xs text-zinc-500">AI Assistant</p>
        </div>
      </header>

      {/* Messages */}
      <MessageList messages={messages} />

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={isLoading} />
    </div>
  );
}
