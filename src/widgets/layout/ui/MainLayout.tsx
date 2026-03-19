import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { ChatView } from "../../chat/ui/ChatView";
import { ChatPlaceholder } from "../../chat/ui/ChatPlaceholder";
import { ProfileView } from "../../../features/profile/ui/ProfileView";
import type { Chat } from "../../../shared/types/chat";

export const MainLayout = () => {
  const [showProfile, setShowProfile] = useState(false);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  const handleSelectChat = (chat: Chat) => {
    setSelectedChat(chat);
  };

  const handleBack = () => {
    setSelectedChat(null);
  };

  return (
    <div className="flex h-screen bg-(--base) overflow-hidden">
      <div
        className={`${
          selectedChat ? "hidden md:flex" : "flex"
        } h-full w-full md:w-auto`}
      >
        <Sidebar
          onOpenProfile={() => setShowProfile(true)}
          onSelectChat={handleSelectChat}
          selectedChatId={selectedChat?.id ?? null}
        />
      </div>

      <main
        className={`${
          selectedChat ? "flex" : "hidden md:flex"
        } flex-1 overflow-hidden`}
        aria-label="Область чата"
      >
        {selectedChat ? (
          /* key forces remount → plays animate-chat-in on every chat switch */
          <ChatView key={selectedChat.id} chat={selectedChat} onBack={handleBack} />
        ) : (
          <ChatPlaceholder />
        )}
      </main>

      {showProfile && (
        <ProfileView
          onClose={() => setShowProfile(false)}
          onOpenSettings={() => {}}
        />
      )}
    </div>
  );
};
