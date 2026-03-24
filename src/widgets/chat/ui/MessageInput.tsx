import { useEffect, useRef } from "react";
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

const LINE_HEIGHT = 1.5; // em, matches style below
const FONT_SIZE_PX = 14; // text-sm = 14px
const ONE_LINE_PX = Math.round(LINE_HEIGHT * FONT_SIZE_PX); // ~21px
const VERTICAL_PADDING_PX = 12; // py-1.5 * 2 = 6+6
const MIN_HEIGHT_PX = ONE_LINE_PX + VERTICAL_PADDING_PX; // ~33px
const MAX_HEIGHT_PX = ONE_LINE_PX * 5 + VERTICAL_PADDING_PX; // 5 lines ~117px

export const MessageInput = ({
  profileAvatarUrl,
  displayName,
  value,
  onChange,
  onKeyDown,
  onSend,
}: MessageInputProps) => {
  const canSend = value.trim().length > 0;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT_PX)}px`;
  }, [value]);

  return (
    <div className="px-4 pt-3 border-t border-(--border) bg-(--surface) shrink-0 safe-bottom">
      <div className="flex gap-2.5 items-end">
        <Avatar
          src={profileAvatarUrl}
          name={displayName || "?"}
          size={32}
          className="mb-1.5 shrink-0"
        />
        <div className="flex-1 flex gap-2 bg-(--input-bg) rounded-2xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-(--accent)/20 transition-all items-center">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            placeholder="Сообщение..."
            rows={1}
            aria-label="Введите сообщение"
            aria-multiline="true"
            className="flex-1 resize-none bg-transparent py-1.5 text-sm text-(--text-primary) placeholder-(--text-muted) outline-none overflow-y-auto"
            style={{
              lineHeight: LINE_HEIGHT,
              minHeight: `${MIN_HEIGHT_PX}px`,
              maxHeight: `${MAX_HEIGHT_PX}px`,
            }}
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
