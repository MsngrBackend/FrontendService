import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { ChatView } from "../chat/ChatView";
import { ChatPlaceholder } from "../chat/ChatPlaceholder";
import { ProfileView } from "../profile/ProfileView";
import type { Chat } from "../../types/chat";

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
      >
        {selectedChat ? (
          <ChatView chat={selectedChat} onBack={handleBack} />
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
