import { useEffect, useRef, useState } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { Avatar } from "../../../shared/ui/Avatar";
import { Spinner } from "../../../shared/ui/Spinner";
import type { Message } from "../../../shared/types/chat";
import { MarkdownMessage } from "./MarkdownMessage";

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
  onStartEdit: (id: number, content: string) => void;
  onDelete: (id: number) => void;
  onEditChange: (text: string) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onEditKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onAvatarClick?: (userId: string) => void;
}

const LONG_PRESS_MS = 500;

export const MessageBubble = ({
  msg,
  isMine,
  senderName,
  isEditing,
  editText,
  editSaving,
  onStartEdit,
  onDelete,
  onEditChange,
  onEditSave,
  onEditCancel,
  onEditKeyDown,
  onAvatarClick,
}: MessageBubbleProps) => {
  const editRef = useRef<HTMLTextAreaElement>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    if (isEditing) editRef.current?.focus();
  }, [isEditing]);

  // Close actions on outside click
  useEffect(() => {
    if (!showActions) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (bubbleRef.current && !bubbleRef.current.contains(e.target as Node)) {
        setShowActions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [showActions]);

  const handleContextMenu = (e: React.MouseEvent) => {
    if (!isMine || msg._temp) return;
    e.preventDefault();
    setShowActions((v) => !v);
  };

  const handleTouchStart = () => {
    if (!isMine || msg._temp) return;
    longPressTimer.current = setTimeout(
      () => setShowActions((v) => !v),
      LONG_PRESS_MS
    );
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  return (
    <div
      className={`flex animate-msg-in px-1 ${
        isMine ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`flex gap-2 max-w-[72%] ${
          isMine ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {/* Avatar */}
        {onAvatarClick ? (
          <button
            onClick={() => onAvatarClick(msg.sender_id)}
            aria-label={`Профиль ${senderName}`}
            className="shrink-0 self-end mb-1 rounded-full hover:opacity-80 transition-opacity p-2 -m-2"
          >
            <Avatar name={senderName} size={28} />
          </button>
        ) : (
          <div className="shrink-0 self-end mb-1" aria-hidden="true">
            <Avatar name={senderName} size={28} />
          </div>
        )}

        {/* Bubble + actions */}
        <div className="flex flex-col min-w-0">
          {!isMine && (
            <span className="text-2.75 font-medium text-(--text-muted) mb-1 ml-1">
              {senderName}
            </span>
          )}

          <div className="relative flex items-end" ref={bubbleRef}>
            {/* Context menu (Telegram-style) */}
            {isMine && !isEditing && !msg._temp && (
              <div
                role="menu"
                aria-label="Действия с сообщением"
                className={`absolute bottom-full right-0 mb-2 z-20 min-w-44 origin-bottom-right
                  bg-(--surface) border border-(--border) rounded-2xl shadow-xl overflow-hidden
                  transition-all duration-200 ease-out
                  ${
                    showActions
                      ? "opacity-100 translate-y-0 scale-100"
                      : "opacity-0 translate-y-1 scale-95 pointer-events-none"
                  }`}
              >
                <button
                  role="menuitem"
                  onClick={() => {
                    onStartEdit(msg.id, msg.content);
                    setShowActions(false);
                  }}
                  aria-label="Редактировать сообщение"
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-(--text-primary) hover:bg-(--hover) transition-colors"
                >
                  <Pencil
                    size={16}
                    className="text-(--text-muted) shrink-0"
                    aria-hidden="true"
                  />
                  Редактировать
                </button>
                <div className="h-px bg-(--border)" role="separator" />
                <button
                  role="menuitem"
                  onClick={() => {
                    onDelete(msg.id);
                    setShowActions(false);
                  }}
                  aria-label="Удалить сообщение"
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/8 transition-colors"
                >
                  <Trash2 size={16} className="shrink-0" aria-hidden="true" />
                  Удалить
                </button>
              </div>
            )}

            {/* Bubble */}
            <div
              onContextMenu={handleContextMenu}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onTouchMove={handleTouchEnd}
              className={`px-3.5 py-2.5 text-sm leading-relaxed wrap-break-word min-w-0 overflow-hidden ${
                isMine
                  ? "bubble-mine text-(--msg-mine-text) rounded-2xl rounded-br-md"
                  : "bg-(--msg-other-bg) text-(--msg-other-text) rounded-2xl rounded-bl-md"
              }`}
            >
              {isEditing ? (
                <div
                  className="flex flex-col gap-2 min-w-44"
                  role="form"
                  aria-label="Редактирование сообщения"
                >
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
                      {editSaving ? (
                        <Spinner size={12} />
                      ) : (
                        <Check size={13} aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <MarkdownMessage content={msg.content} isMine={isMine} />
                  <p
                    className={`text-2.5 mt-1 text-right select-none ${
                      isMine ? "text-white/55" : "text-(--text-muted)"
                    }`}
                    aria-label={`Отправлено в ${formatTime(msg.created_at)}${
                      msg.updated_at ? ", изменено" : ""
                    }`}
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
