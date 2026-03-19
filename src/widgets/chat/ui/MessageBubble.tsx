import { useEffect, useRef } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { Avatar } from "../../../shared/ui/Avatar";
import { Spinner } from "../../../shared/ui/Spinner";
import type { Message } from "../../../shared/types/chat";

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });

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
      className={`flex animate-msg-in px-1 ${isMine ? "justify-end" : "justify-start"}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onMouseEnter}
    >
      <div className={`flex gap-2 max-w-[72%] ${isMine ? "flex-row-reverse" : "flex-row"}`}>

        {/* Avatar */}
        {!isMine && (
          onAvatarClick ? (
            <button
              onClick={() => onAvatarClick(msg.sender_id)}
              aria-label={`Профиль ${senderName}`}
              className="shrink-0 self-end mb-1 rounded-full hover:opacity-80 transition-opacity"
            >
              <Avatar name={senderName} size={28} />
            </button>
          ) : (
            <div className="shrink-0 self-end mb-1" aria-hidden="true">
              <Avatar name={senderName} size={28} />
            </div>
          )
        )}

        {/* Bubble + actions */}
        <div className="flex flex-col">
          {!isMine && (
            <span className="text-2.75 font-medium text-(--text-muted) mb-1 ml-1">
              {senderName}
            </span>
          )}

          <div className={`relative flex items-end gap-1.5 ${isMine ? "flex-row-reverse" : "flex-row"}`}>

            {/* Floating action toolbar */}
            {isMine && !isEditing && !msg._temp && (
              <div
                role="toolbar"
                aria-label="Действия с сообщением"
                className={`flex gap-0.5 mb-1 transition-all duration-150 ${
                  isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1 pointer-events-none"
                }`}
              >
                <button
                  onClick={() => onStartEdit(msg.id, msg.content)}
                  aria-label="Редактировать сообщение"
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-(--text-muted) hover:text-accent hover:bg-accent/10 transition-colors"
                >
                  <Pencil size={14} aria-hidden="true" />
                </button>
                <button
                  onClick={() => onDelete(msg.id)}
                  aria-label="Удалить сообщение"
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-(--text-muted) hover:text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              </div>
            )}

            {/* Bubble */}
            <div
              className={`px-3.5 py-2.5 text-sm leading-relaxed ${
                isMine
                  ? "bg-(--msg-mine-bg) text-(--msg-mine-text) rounded-2xl rounded-br-md"
                  : "bg-(--msg-other-bg) text-(--msg-other-text) rounded-2xl rounded-bl-md"
              } ${msg._temp ? "opacity-60" : ""}`}
            >
              {isEditing ? (
                <div className="flex flex-col gap-2 min-w-44" role="form" aria-label="Редактирование сообщения">
                  <textarea
                    ref={editRef}
                    value={editText}
                    onChange={(e) => onEditChange(e.target.value)}
                    onKeyDown={onEditKeyDown}
                    rows={2}
                    aria-label="Текст сообщения"
                    className="bg-(--msg-mine-text)/15 rounded-lg px-2.5 py-1.5 text-sm text-(--msg-mine-text) placeholder-(--msg-mine-text)/50 outline-none resize-none w-full"
                    style={{ lineHeight: "1.4" }}
                  />
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={onEditCancel}
                      aria-label="Отмена (Esc)"
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-(--msg-mine-text)/20 transition-colors text-(--msg-mine-text)/80"
                    >
                      <X size={13} aria-hidden="true" />
                    </button>
                    <button
                      onClick={onEditSave}
                      disabled={editSaving || !editText.trim()}
                      aria-label="Сохранить (Enter)"
                      aria-busy={editSaving}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-(--msg-mine-text)/20 transition-colors text-(--msg-mine-text) disabled:opacity-40"
                    >
                      {editSaving ? <Spinner size={12} /> : <Check size={13} aria-hidden="true" />}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="wrap-break-word whitespace-pre-wrap">{msg.content}</p>
                  <p
                    className={`text-2.5 mt-1 text-right select-none ${
                      isMine ? "text-white/55" : "text-(--text-muted)"
                    }`}
                    aria-label={`Отправлено в ${formatTime(msg.created_at)}${msg.updated_at ? ", изменено" : ""}`}
                  >
                    {formatTime(msg.created_at)}
                    {msg.updated_at && (
                      <span className="ml-1 opacity-70">· изм.</span>
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
