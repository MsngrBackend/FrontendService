import { useRef, useState } from "react";

interface UseChatInputOptions {
  sendMessage: (text: string) => void;
  sendTyping: () => void;
}

export const useChatInput = ({ sendMessage, sendTyping }: UseChatInputOptions) => {
  const [input, setInput] = useState("");
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    sendTyping();
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
  };

  return { input, handleSend, handleKeyDown, handleInputChange };
}
