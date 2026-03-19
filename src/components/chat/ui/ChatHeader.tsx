import { Users, ChevronLeft } from "lucide-react";
import { Avatar } from "../../ui/Avatar";
import type { Chat } from "../../../types/chat";

interface ChatHeaderProps {
  chat: Chat;
  isTyping: boolean;
  showMembers: boolean;
  userName: string;
  onToggleMembers: () => void;
  onBack?: () => void;
}

export const ChatHeader = ({
  chat,
  isTyping,
  showMembers,
  userName,
  onToggleMembers,
  onBack,
}: ChatHeaderProps) => {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-(--border) bg-(--surface) shrink-0">
      {onBack && (
        <button
          onClick={onBack}
          className="md:hidden p-1.5 -ml-1 rounded-lg hover:bg-(--hover) text-(--text-muted) transition-colors"
        >
          <ChevronLeft size={22} />
        </button>
      )}
      <Avatar name={chat.name} size={38} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-(--text-primary)">
          {chat.name}
        </p>
        {isTyping && (
          <p className="text-xs text-(--accent)">{`${userName} печатает...`}</p>
        )}
      </div>
      <button
        onClick={onToggleMembers}
        className={`p-2 rounded-lg transition-colors ${
          showMembers
            ? "bg-(--accent)/15 text-(--accent)"
            : "hover:bg-(--hover) text-(--text-muted)"
        }`}
        title="Участники"
      >
        <Users size={18} />
      </button>
    </div>
  );
};
