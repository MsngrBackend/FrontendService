import { Users, ChevronLeft } from "lucide-react";
import { Avatar } from "../../../shared/ui/Avatar";
import type { Chat } from "../../../shared/types/chat";

interface ChatHeaderProps {
  chat: Chat;
  isTyping: boolean;
  showMembers: boolean;
  membersCount: number;
  userName: string;
  onToggleMembers: () => void;
  onBack?: () => void;
}

const pluralMembers = (n: number) => {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return `${n} участников`;
  if (mod10 === 1) return `${n} участник`;
  if (mod10 >= 2 && mod10 <= 4) return `${n} участника`;
  return `${n} участников`;
};

export const ChatHeader = ({
  chat,
  isTyping,
  showMembers,
  membersCount,
  userName,
  onToggleMembers,
  onBack,
}: ChatHeaderProps) => {
  return (
    <header className="flex items-center gap-2.5 px-4 pb-3 border-b border-(--border) bg-(--surface) shrink-0 safe-top">
      {onBack && (
        <button
          onClick={onBack}
          aria-label="Назад к списку чатов"
          className="md:hidden w-11 h-11 flex items-center justify-center -ml-2 rounded-xl hover:bg-(--hover) text-(--text-muted) transition-colors"
        >
          <ChevronLeft size={20} aria-hidden="true" />
        </button>
      )}

      <Avatar name={chat.name} size={38} />

      <div className="flex-1 min-w-0">
        <p className="text-3.5 font-semibold text-(--text-primary) leading-tight truncate">
          {chat.name}
        </p>
        <div
          className="h-4 flex items-center"
          aria-live="polite"
          aria-atomic="true"
        >
          {isTyping ? (
            <span className="text-xs text-(--accent) font-medium flex items-center gap-1">
              {userName} печатает
              <span className="inline-flex gap-0.5 ml-0.5" aria-hidden="true">
                <span
                  className="w-1 h-1 rounded-full bg-(--accent) animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="w-1 h-1 rounded-full bg-(--accent) animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="w-1 h-1 rounded-full bg-(--accent) animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </span>
            </span>
          ) : (
            <span className="text-xs text-(--text-muted)">
              {pluralMembers(membersCount)}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={onToggleMembers}
        aria-label={showMembers ? "Скрыть участников" : "Показать участников"}
        aria-pressed={showMembers}
        className={`w-11 h-11 flex items-center justify-center rounded-xl transition-colors ${
          showMembers
            ? "bg-(--accent)/12 text-(--accent)"
            : "hover:bg-(--hover) text-(--text-muted) hover:text-(--text-primary)"
        }`}
      >
        <Users size={17} aria-hidden="true" />
      </button>
    </header>
  );
};
