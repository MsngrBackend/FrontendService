import { Send } from "lucide-react";
import { Avatar } from "../../ui/Avatar";

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
  return (
    <div className="px-4 py-3 border-t border-(--border) bg-(--surface) shrink-0">
      <div className="flex items-end gap-2">
        <Avatar
          src={profileAvatarUrl ?? undefined}
          name={displayName}
          size={32}
          className="shrink-0 mb-0.5"
        />
        <div className="flex-1 relative">
          <textarea
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            placeholder="Сообщение..."
            rows={1}
            className="w-full resize-none bg-(--input-bg) rounded-2xl px-4 py-2.5 text-sm text-(--text-primary) placeholder-(--text-muted) outline-none focus:ring-1 focus:ring-(--accent)/30 transition-all max-h-32 overflow-y-auto"
            style={{ lineHeight: "1.5" }}
          />
        </div>
        <button
          onClick={onSend}
          disabled={!value.trim()}
          className="p-2.5 rounded-full bg-(--accent) text-white hover:bg-(--accent)/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0 mb-0.5"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
