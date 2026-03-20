import { Send } from "lucide-react";
import { Avatar } from "../../../shared/ui/Avatar";

interface MessageInputProps {
  profileAvatarUrl?: string | null;
  displayName: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
}

export const MessageInput = ({
  profileAvatarUrl,
  displayName,
  value,
  onChange,
  onKeyDown,
  onSend,
}: MessageInputProps) => {
  const canSend = value.trim().length > 0;

  return (
    <div className="px-4 py-3 border-t border-(--border) bg-(--surface) shrink-0">
      <div className="flex gap-2.5 items-end">
        <Avatar src={profileAvatarUrl} name={displayName || "?"} size={32} className="mb-1.5 shrink-0" />
        <div className="flex-1 flex gap-2 bg-(--input-bg) rounded-2xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-(--accent)/20 transition-all items-center">
          <textarea
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            placeholder="Сообщение..."
            rows={1}
            aria-label="Введите сообщение"
            aria-multiline="true"
            className="flex-1 resize-none bg-transparent py-1.5 text-sm text-(--text-primary) placeholder-(--text-muted) outline-none max-h-32 overflow-y-auto"
            style={{ lineHeight: "1.5" }}
          />
          <button
            onClick={onSend}
            disabled={!canSend}
            aria-label="Отправить сообщение"
            className={`w-11 h-11 flex items-center justify-center rounded-xl mb-0.5 shrink-0 transition-all ${
              canSend
                ? "bg-(--accent) text-white hover:bg-(--accent-hover) cursor-pointer scale-100"
                : "bg-transparent text-(--text-muted) scale-90 opacity-40 cursor-not-allowed"
            }`}
          >
            <Send size={15} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};
