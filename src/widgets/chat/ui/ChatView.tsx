import { useEffect, useRef, useState } from "react";
import { useChat } from "../../../shared/hooks/useChat";
import { useAuthStore } from "../../../entities/session/model/authStore";
import { useDisplayName } from "../../../shared/hooks/useDisplayName";
import { ChatMembersPanel } from "./ChatMembersPanel";
import { ChatHeader } from "./ChatHeader";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { MessageSkeleton } from "../../../shared/ui/Skeleton";
import { useSenderNames } from "../lib/useSenderNames";
import { useChatMembers } from "../lib/useChatMembers";
import { useChatInput } from "../lib/useChatInput";
import { useMessageEdit } from "../lib/useMessageEdit";
import { ProfileView } from "../../../features/profile/ui/ProfileView";
import type { Chat } from "../../../shared/types/chat";

interface ChatViewProps {
  chat: Chat;
  onBack?: () => void;
}

const MESSAGE_SKELETON_PATTERN = [false, true, false, false, true, false];

const VALORANT_BACKGROUNDS = [
  "chat-bg-ascent",
  "chat-bg-icebox",
  "chat-bg-bind",
  "chat-bg-haven",
  "chat-bg-fracture",
];

export const ChatView = ({ chat, onBack }: ChatViewProps) => {
  const { profile } = useAuthStore();
  const displayName = useDisplayName();
  const {
    messages,
    loading,
    typingUserId,
    fetchError,
    myUserId,
    sendMessage,
    sendTyping,
    editMessage,
    deleteMessage,
  } = useChat({ chatId: chat.id, username: displayName });

  const [showMembers, setShowMembers] = useState(false);
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [viewingOwnProfile, setViewingOwnProfile] = useState(false);

  const handleAvatarClick = (userId: string) => {
    if (userId === myUserId) setViewingOwnProfile(true);
    else setViewingUserId(userId);
  };
  const chatBg = VALORANT_BACKGROUNDS[Math.abs(Number(chat.id) || 0) % VALORANT_BACKGROUNDS.length] ?? VALORANT_BACKGROUNDS[0]!;
  const bottomRef = useRef<HTMLDivElement>(null);

  const { members } = useChatMembers(chat.id);
  const senderNames = useSenderNames(chat.id);
  const { input, handleSend, handleKeyDown, handleInputChange } = useChatInput({
    sendMessage,
    sendTyping,
  });
  const {
    editingId,
    editText,
    editSaving,
    setEditText,
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
    <div className="flex h-full overflow-hidden w-full animate-chat-in">
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        <ChatHeader
          chat={chat}
          isTyping={!!typingUserId}
          showMembers={showMembers}
          membersCount={members.length}
          onToggleMembers={() => setShowMembers((v) => !v)}
          onBack={onBack}
          userName={
            typingUserId
              ? (senderNames[typingUserId] ?? typingUserId.slice(0, 8))
              : ""
          }
        />

        <div
          className={`flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 flex flex-col gap-2 ${chatBg}`}
          role="log"
          aria-label="Сообщения"
          aria-live="polite"
          aria-relevant="additions"
        >
          {loading ? (
            MESSAGE_SKELETON_PATTERN.map((isMine, i) => (
              <MessageSkeleton key={i} isMine={isMine} />
            ))
          ) : fetchError ? (
            <div className="flex flex-col items-center justify-center flex-1 gap-2" role="alert">
              <p className="text-sm text-red-500">{fetchError}</p>
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
                senderName={senderNames[msg.sender_id] ?? msg.sender_id.slice(0, 8)}
                isEditing={editingId === msg.id}
                editText={editText}
                editSaving={editSaving}
                onStartEdit={startEdit}
                onDelete={handleDelete}
                onEditChange={setEditText}
                onEditSave={saveEdit}
                onEditCancel={cancelEdit}
                onEditKeyDown={handleEditKeyDown}
                onAvatarClick={handleAvatarClick}
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

      {viewingOwnProfile && (
        <ProfileView onClose={() => setViewingOwnProfile(false)} />
      )}
    </div>
  );
};
