import { useEffect, useRef } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { Avatar } from "../../ui/Avatar";
import { Spinner } from "../../ui/Spinner";
import type { Message } from "../../../types/chat";

const formatTime = (iso: string) => {
  return new Date(iso).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

interface MessageBubbleProps {
  msg: Message;
  isMine: boolean;
  senderName: string;
  isEditing: boolean;
  editText: string;
  editSaving: boolean;
  isHovered: boolean;
  onStartEdit: (id: number, content: string) => void;
  onDelete: (id: number) => void;
  onEditChange: (text: string) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onEditKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onAvatarClick?: (userId: string) => void;
}

export const MessageBubble = ({
  msg,
  isMine,
  senderName,
  isEditing,
  editText,
  editSaving,
  isHovered,
  onStartEdit,
  onDelete,
  onEditChange,
  onEditSave,
  onEditCancel,
  onEditKeyDown,
  onMouseEnter,
  onMouseLeave,
  onAvatarClick,
}: MessageBubbleProps) => {
  const editRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing) editRef.current?.focus();
  }, [isEditing]);

  return (
    <div
      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className={`flex gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
        {!isMine && onAvatarClick ? (
          <button
            onClick={() => onAvatarClick(msg.sender_id)}
            className="shrink-0 mr-2 mt-1 rounded-full transition-all"
          >
            <Avatar name={senderName} size={28} />
          </button>
        ) : (
          <Avatar name={senderName} size={28} className="mr-2 mt-1 shrink-0" />
        )}
        <div className="flex flex-col max-w-[70%]">
          {!isMine && (
            <span className="text-[11px] text-(--text-muted) mb-0.5 ml-1">
              {senderName}
            </span>
          )}
          <div
            className={`flex items-end gap-1 ${
              isMine ? "flex-row-reverse" : "flex-row"
            }`}
          >
            {isMine && !isEditing && !msg._temp && isHovered && (
              <div className="flex gap-0.5 mb-1">
                <button
                  onClick={() => onStartEdit(msg.id, msg.content)}
                  className="p-1 rounded-lg text-(--text-muted) hover:text-(--accent) hover:bg-(--accent)/10 transition-colors"
                  title="Редактировать"
                >
                  <Pencil size={12} />
                </button>
                <button
                  onClick={() => onDelete(msg.id)}
                  className="p-1 rounded-lg text-(--text-muted) hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  title="Удалить"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )}

            <div
              className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                isMine
                  ? "bg-(--accent) text-white rounded-br-sm"
                  : "bg-(--surface) text-(--text-primary) border border-(--border) rounded-bl-sm"
              }`}
            >
              {isEditing ? (
                <div className="flex flex-col gap-1.5 min-w-40">
                  <textarea
                    ref={editRef}
                    value={editText}
                    onChange={(e) => onEditChange(e.target.value)}
                    onKeyDown={onEditKeyDown}
                    rows={2}
                    className="bg-white/10 rounded-lg px-2 py-1 text-sm text-white placeholder-white/50 outline-none resize-none"
                  />
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={onEditCancel}
                      className="p-1 rounded-lg hover:bg-white/20 transition-colors"
                      title="Отмена (Esc)"
                    >
                      <X size={12} />
                    </button>
                    <button
                      onClick={onEditSave}
                      disabled={editSaving || !editText.trim()}
                      className="p-1 rounded-lg hover:bg-white/20 transition-colors disabled:opacity-40"
                      title="Сохранить (Enter)"
                    >
                      {editSaving ? <Spinner size={12} /> : <Check size={12} />}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="wrap-break-word">{msg.content}</p>
                  <p
                    className={`text-[10px] mt-1 text-right ${
                      isMine ? "text-white/60" : "text-(--text-muted)"
                    }`}
                  >
                    {formatTime(msg.created_at)}
                    {msg.updated_at && (
                      <span className="ml-1 italic">изм.</span>
                    )}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
