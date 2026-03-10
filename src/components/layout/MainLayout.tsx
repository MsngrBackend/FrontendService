import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { ChatView } from "../chat/ChatView";
import { ChatPlaceholder } from "../chat/ChatPlaceholder";
import { ProfileSettings } from "../profile/ProfileSettings";
import { ProfileView } from "../profile/ProfileView";
import type { Chat } from "../../types/chat";

export const MainLayout = () => {
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  const handleSelectChat = (chat: Chat) => {
    setSelectedChat(chat);
  };

  const handleBack = () => {
    setSelectedChat(null);
  };

  return (
    <div className="flex h-screen bg-(--base) overflow-hidden">
      {/* Sidebar: on mobile shown only when no chat selected */}
      <div
        className={`${
          selectedChat ? "hidden md:flex" : "flex"
        } md:flex h-full w-screen`}
      >
        <Sidebar
          onOpenProfile={() => setShowProfile(true)}
          onOpenSettings={() => setShowSettings(true)}
          onSelectChat={handleSelectChat}
          selectedChatId={selectedChat?.id ?? null}
        />
      </div>

      {/* Main area: on mobile shown only when chat selected */}
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
          onOpenSettings={() => setShowSettings(true)}
        />
      )}

      {showSettings && (
        <ProfileSettings onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
};
