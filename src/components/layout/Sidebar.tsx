import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Settings,
  LogOut,
  Edit3,
  MessageSquare,
  Users,
  Plus,
  RefreshCw,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useDisplayName } from "../../hooks/useDisplayName";
import { Avatar } from "../ui/Avatar";
import { ContactsList } from "../contacts/ContactsList";
import { chatsApi } from "../../api/chats";
import { Spinner } from "../ui/Spinner";
import type { Chat } from "../../types/chat";

interface SidebarProps {
  onOpenProfile: () => void;
  onSelectChat: (chat: Chat) => void;
  selectedChatId: number | null;
}

type SidebarTab = "chats" | "contacts" | "settings";

const TABS: { key: SidebarTab; Icon: typeof MessageSquare; label: string }[] = [
  { key: "chats", Icon: MessageSquare, label: "Чаты" },
  { key: "contacts", Icon: Users, label: "Контакты" },
  { key: "settings", Icon: Settings, label: "Настройки" },
];

export const Sidebar = ({
  onOpenProfile,
  onSelectChat,
  selectedChatId,
}: SidebarProps) => {
  const navigate = useNavigate();
  const { profile, logout } = useAuthStore();
  const displayName = useDisplayName();
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<SidebarTab>("chats");
  const [chats, setChats] = useState<Chat[]>([]);
  const [chatsLoading, setChatsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newChatName, setNewChatName] = useState("");
  const [creating, setCreating] = useState(false);

  const loadChats = () => {
    setChatsLoading(true);
    chatsApi
      .getMyChats()
      .then(setChats)
      .catch(() => setChats([]))
      .finally(() => setChatsLoading(false));
  };

  useEffect(() => {
    if (activeTab !== "chats") return;
    loadChats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
  };

  const handleTabClick = (tab: SidebarTab) => {
    if (tab === "settings") {
      navigate("/settings");
      return;
    }
    setActiveTab(tab);
  };

  const handleCreateChat = async () => {
    const name = newChatName.trim();
    if (!name) return;
    setCreating(true);
    try {
      const chat = await chatsApi.createChat(name);
      setChats((prev) => [...prev, chat]);
      onSelectChat(chat);
      setNewChatName("");
      setShowCreateForm(false);
    } catch {
      // ignore
    } finally {
      setCreating(false);
    }
  };

  const filtered = chats.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="flex flex-col w-full md:w-[320px] bg-(--sidebar) border-r border-(--border) h-full shrink-0">
      {/* Header — only on chats tab */}
      {activeTab === "chats" && (
        <div className="flex items-center gap-2 px-4 py-3 border-b border-(--border)">
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="p-1.5 rounded-lg hover:bg-(--hover) transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect
                  x="2"
                  y="4"
                  width="16"
                  height="1.8"
                  rx="0.9"
                  fill="var(--text-muted)"
                />
                <rect
                  x="2"
                  y="9.1"
                  width="16"
                  height="1.8"
                  rx="0.9"
                  fill="var(--text-muted)"
                />
                <rect
                  x="2"
                  y="14.2"
                  width="16"
                  height="1.8"
                  rx="0.9"
                  fill="var(--text-muted)"
                />
              </svg>
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute left-0 top-10 z-20 bg-(--surface) rounded-xl shadow-lg border border-(--border) py-1.5 w-48">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/settings");
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-(--text-secondary) hover:bg-(--hover) transition-colors"
                  >
                    <Settings size={16} className="text-(--text-muted)" />
                    Настройки
                  </button>
                  <div className="my-1 border-t border-(--border)" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut size={16} />
                    Выйти
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="flex-1 relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted)"
            />
            <input
              type="search"
              placeholder="Поиск"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-(--input-bg) rounded-xl text-sm outline-none text-(--text-primary) placeholder-(--text-muted) focus:ring-1 focus:ring-(--accent)/30 transition-all"
            />
          </div>

          <button
            onClick={loadChats}
            disabled={chatsLoading}
            className="p-1.5 rounded-lg hover:bg-(--hover) transition-colors disabled:opacity-40"
            title="Обновить список чатов"
          >
            <RefreshCw
              size={16}
              className={`text-(--text-muted) ${
                chatsLoading ? "animate-spin" : ""
              }`}
            />
          </button>
          <button
            onClick={() => setShowCreateForm((v) => !v)}
            className="p-1.5 rounded-lg hover:bg-(--hover) transition-colors"
            title="Новый чат"
          >
            <Edit3 size={18} className="text-(--text-muted)" />
          </button>
        </div>
      )}

      {/* Create chat form */}
      {activeTab === "chats" && showCreateForm && (
        <div className="flex items-center gap-2 px-4 py-2 border-b border-(--border) bg-(--surface)">
          <input
            autoFocus
            type="text"
            placeholder="Название чата"
            value={newChatName}
            onChange={(e) => setNewChatName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateChat()}
            className="flex-1 bg-(--input-bg) rounded-xl px-3 py-1.5 text-sm outline-none text-(--text-primary) placeholder-(--text-muted) focus:ring-1 focus:ring-(--accent)/30"
          />
          <button
            onClick={handleCreateChat}
            disabled={!newChatName.trim() || creating}
            className="p-1.5 rounded-lg bg-(--accent) text-white hover:bg-(--accent)/90 transition-colors disabled:opacity-40"
          >
            {creating ? <Spinner size={14} /> : <Plus size={14} />}
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {activeTab === "chats" && (
          <div className="flex-1 overflow-y-auto">
            {chatsLoading ? (
              <div className="flex justify-center py-10">
                <Spinner size={24} className="text-(--accent)" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-(--text-muted) gap-2">
                <p className="text-sm">
                  {search ? "Ничего не найдено" : "Нет чатов"}
                </p>
                {!search && (
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="text-xs text-(--accent) hover:underline"
                  >
                    Создать первый чат
                  </button>
                )}
              </div>
            ) : (
              filtered.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => onSelectChat(chat)}
                  className={`flex items-center gap-3 w-full px-4 py-3 transition-colors text-left ${
                    selectedChatId === chat.id
                      ? "bg-(--accent)/10 border-r-2 border-(--accent)"
                      : "hover:bg-(--hover)"
                  }`}
                >
                  <Avatar name={chat.name} size={46} />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold text-(--text-primary) truncate block">
                      {chat.name}
                    </span>
                    <span className="text-xs text-(--text-muted)">
                      Чат #{chat.id}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        )}

        {activeTab === "contacts" && <ContactsList />}
      </div>

      {/* Profile strip — only on chats tab */}
      {activeTab === "chats" && (
        <div className="flex items-center gap-3 px-4 py-2 border-t border-(--border)">
          <div
            className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer hover:bg-(--hover) rounded-xl px-1 py-1 -mx-1 transition-colors"
            onClick={onOpenProfile}
          >
            <div className="relative shrink-0">
              <Avatar src={profile?.avatar_url} name={displayName} size={36} />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-(--online) rounded-full border-2 border-(--sidebar)" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-(--text-primary) truncate">
                {displayName}
              </p>
              {profile?.username && (
                <p className="text-xs text-(--text-muted) truncate">
                  @{profile.username}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom tab bar */}
      <div className="flex border-t border-(--border) bg-(--sidebar)">
        {TABS.map(({ key, Icon, label }) => (
          <button
            key={key}
            onClick={() => handleTabClick(key)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${
              activeTab === key
                ? "text-(--accent)"
                : "text-(--text-muted) hover:text-(--text-secondary)"
            }`}
            title={label}
          >
            <Icon size={20} />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        ))}
      </div>
    </aside>
  );
};
