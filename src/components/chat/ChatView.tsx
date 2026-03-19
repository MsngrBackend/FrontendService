import { useEffect, useRef, useState } from "react";
import { useChat } from "../../hooks/useChat";
import { useAuthStore } from "../../store/authStore";
import { useDisplayName } from "../../hooks/useDisplayName";
import { Spinner } from "../ui/Spinner";
import { ChatMembersPanel } from "./ChatMembersPanel";
import { ChatHeader } from "./ui/ChatHeader";
import { MessageBubble } from "./ui/MessageBubble";
import { MessageInput } from "./ui/MessageInput";
import { useSenderNames } from "./lib/useSenderNames";
import { useChatInput } from "./lib/useChatInput";
import { useMessageEdit } from "./lib/useMessageEdit";
import { ProfileView } from "../profile/ProfileView";
import type { Chat } from "../../types/chat";

interface ChatViewProps {
  chat: Chat;
  onBack?: () => void;
}

export const ChatView = ({ chat, onBack }: ChatViewProps) => {
  const { profile } = useAuthStore();
  const displayName = useDisplayName();
  const {
    messages,
    loading,
    typingUserId,
    myUserId,
    sendMessage,
    sendTyping,
    editMessage,
    deleteMessage,
  } = useChat({ chatId: chat.id, username: displayName });

  const [showMembers, setShowMembers] = useState(false);
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const senderNames = useSenderNames(chat.id);
  const { input, handleSend, handleKeyDown, handleInputChange } = useChatInput({
    sendMessage,
    sendTyping,
  });
  const {
    editingId,
    editText,
    editSaving,
    hoveredId,
    setEditText,
    setHoveredId,
    startEdit,
    cancelEdit,
    saveEdit,
    handleEditKeyDown,
    handleDelete,
  } = useMessageEdit({ editMessage, deleteMessage });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-full overflow-hidden w-full">
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        <ChatHeader
          chat={chat}
          isTyping={!!typingUserId}
          showMembers={showMembers}
          onToggleMembers={() => setShowMembers((v) => !v)}
          onBack={onBack}
          userName={
            typingUserId
              ? senderNames[typingUserId] ?? typingUserId.slice(0, 8)
              : ""
          }
        />

        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2">
          {loading ? (
            <div className="flex justify-center py-10">
              <Spinner size={24} className="text-[(--accent)]" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-(--text-muted)">
              <p className="text-sm">Начните переписку</p>
            </div>
          ) : (
            messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                msg={msg}
                isMine={msg.sender_id === myUserId}
                senderName={
                  senderNames[msg.sender_id] ?? msg.sender_id.slice(0, 8)
                }
                isEditing={editingId === msg.id}
                editText={editText}
                editSaving={editSaving}
                isHovered={hoveredId === msg.id}
                onStartEdit={startEdit}
                onDelete={handleDelete}
                onEditChange={setEditText}
                onEditSave={saveEdit}
                onEditCancel={cancelEdit}
                onEditKeyDown={handleEditKeyDown}
                onMouseEnter={() => setHoveredId(msg.id)}
                onMouseLeave={() => setHoveredId(null)}
                onAvatarClick={setViewingUserId}
              />
            ))
          )}
          <div ref={bottomRef} />
        </div>

        <MessageInput
          profileAvatarUrl={profile?.avatar_url}
          displayName={displayName}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onSend={handleSend}
        />
      </div>

      {showMembers && (
        <ChatMembersPanel
          chatId={chat.id}
          myUserId={myUserId}
          onClose={() => setShowMembers(false)}
        />
      )}

      {viewingUserId && (
        <ProfileView
          userId={viewingUserId}
          onClose={() => setViewingUserId(null)}
        />
      )}
    </div>
  );
};
