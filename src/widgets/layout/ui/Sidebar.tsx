import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Settings,
  LogOut,
  MessageSquare,
  Users,
  Plus,
  RefreshCw,
  PenSquare,
  X,
  Trash2,
} from "lucide-react";
import { useAuthStore } from "../../../entities/session/model/authStore";
import { useDisplayName } from "../../../shared/hooks/useDisplayName";
import { Avatar } from "../../../shared/ui/Avatar";
import { ContactsList } from "../../../features/contacts/ui/ContactsList";
import { chatsApi } from "../../../shared/api/chats";
import { ChatItemSkeleton } from "../../../shared/ui/Skeleton";
import type { Chat } from "../../../shared/types/chat";

interface SidebarProps {
  onOpenProfile: () => void;
  onSelectChat: (chat: Chat) => void;
  selectedChatId: number | null;
  onChatDeleted?: (chatId: number) => void;
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
  onChatDeleted,
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
  const [createError, setCreateError] = useState("");
  const [deletingChatId, setDeletingChatId] = useState<number | null>(null);

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

  const handleDeleteChat = async (chatId: number) => {
    setDeletingChatId(chatId);
    try {
      await chatsApi.deleteChat(chatId);
      setChats((prev) => prev.filter((c) => c.id !== chatId));
      onChatDeleted?.(chatId);
    } catch {
      // silent fail
    } finally {
      setDeletingChatId(null);
    }
  };

  const handleCreateChat = async () => {
    const name = newChatName.trim();
    if (!name) return;
    setCreating(true);
    setCreateError("");
    try {
      const chat = await chatsApi.createChat(name);
      setChats((prev) => [...prev, chat]);
      onSelectChat(chat);
      setNewChatName("");
      setShowCreateForm(false);
    } catch {
      setCreateError("Не удалось создать чат. Попробуйте ещё раз.");
    } finally {
      setCreating(false);
    }
  };

  const filtered = chats.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside
      className="flex flex-col w-full md:w-80 bg-(--sidebar) border-r border-(--border) h-full shrink-0"
      aria-label="Панель навигации"
    >
      {/* ── Header ── */}
      {activeTab === "chats" && (
        <div className="flex items-center gap-2 px-3 pt-3 pb-2">
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Меню"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-(--hover) transition-colors text-(--text-muted) hover:text-(--text-primary)"
            >
              <svg
                width="18"
                height="14"
                viewBox="0 0 18 14"
                fill="none"
                aria-hidden="true"
              >
                <rect width="18" height="2" rx="1" fill="currentColor" />
                <rect y="6" width="18" height="2" rx="1" fill="currentColor" />
                <rect y="12" width="12" height="2" rx="1" fill="currentColor" />
              </svg>
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                  aria-hidden="true"
                />
                <div
                  role="menu"
                  className="absolute left-0 top-11 z-20 bg-(--surface) rounded-2xl border border-(--border) py-1.5 w-52 overflow-hidden"
                  style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
                >
                  <button
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/settings");
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-(--text-secondary) hover:bg-(--hover) transition-colors"
                  >
                    <Settings
                      size={15}
                      className="text-(--text-muted)"
                      aria-hidden="true"
                    />
                    Настройки
                  </button>
                  <div
                    className="my-1 mx-3 border-t border-(--border)"
                    role="separator"
                  />
                  <button
                    role="menuitem"
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/8 transition-colors"
                  >
                    <LogOut size={15} aria-hidden="true" />
                    Выйти из аккаунта
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="flex-1 relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Поиск"
              aria-label="Поиск чатов"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-(--input-bg) rounded-xl text-3.25 outline-none text-(--text-primary) placeholder-(--text-muted) focus:ring-2 focus:ring-(--accent)/20 transition-all"
            />
          </div>

          <button
            onClick={loadChats}
            disabled={chatsLoading}
            aria-label="Обновить список чатов"
            className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-(--hover) transition-colors text-(--text-muted) hover:text-(--text-primary) disabled:opacity-40"
          >
            <RefreshCw
              size={15}
              className={chatsLoading ? "animate-spin" : ""}
              aria-hidden="true"
            />
          </button>

          <button
            onClick={() => setShowCreateForm((v) => !v)}
            aria-label="Создать новый чат"
            aria-expanded={showCreateForm}
            className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-(--hover) transition-colors text-(--text-muted) hover:text-(--text-primary)"
          >
            <PenSquare size={16} aria-hidden="true" />
          </button>
        </div>
      )}

      {/* ── Create chat form ── */}
      {activeTab === "chats" && showCreateForm && (
        <div className="flex flex-col gap-1 px-3 pb-2">
          <div className="flex items-center gap-2">
            <input
              autoFocus
              type="text"
              placeholder="Название чата..."
              aria-label="Название нового чата"
              value={newChatName}
              onChange={(e) => {
                setNewChatName(e.target.value);
                setCreateError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleCreateChat()}
              className="flex-1 bg-(--input-bg) rounded-xl px-3 py-2 text-3.25 outline-none text-(--text-primary) placeholder-(--text-muted) focus:ring-2 focus:ring-(--accent)/20"
            />
            <button
              onClick={handleCreateChat}
              disabled={!newChatName.trim() || creating}
              aria-label="Подтвердить создание чата"
              className="w-11 h-11 flex items-center justify-center rounded-xl bg-(--accent) text-white hover:bg-(--accent-hover) transition-colors disabled:opacity-40 shrink-0"
            >
              <Plus size={16} aria-hidden="true" />
            </button>
            <button
              onClick={() => {
                setShowCreateForm(false);
                setNewChatName("");
                setCreateError("");
              }}
              aria-label="Отмена"
              className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-(--hover) transition-colors text-(--text-muted) shrink-0"
            >
              <X size={15} aria-hidden="true" />
            </button>
          </div>
          {createError && (
            <p role="alert" className="text-xs text-red-500 px-1">
              {createError}
            </p>
          )}
        </div>
      )}

      {/* ── Content ── */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {activeTab === "chats" && (
          <div
            className="flex-1 overflow-y-auto py-1"
            role="list"
            aria-label="Список чатов"
            aria-busy={chatsLoading}
          >
            {chatsLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <ChatItemSkeleton key={i} />
              ))
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 gap-2 px-6 text-center">
                <MessageSquare
                  size={32}
                  className="text-(--text-muted) opacity-20"
                  aria-hidden="true"
                />
                <p className="text-sm font-medium text-(--text-muted)">
                  {search ? "Ничего не найдено" : "Нет чатов"}
                </p>
                {!search && (
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="text-xs text-(--accent) font-medium hover:underline mt-1"
                  >
                    Создать первый чат
                  </button>
                )}
              </div>
            ) : (
              filtered.map((chat) => {
                const isSelected = selectedChatId === chat.id;
                const isDeleting = deletingChatId === chat.id;
                return (
                  <div key={chat.id} className="relative group">
                    <button
                      onClick={() => onSelectChat(chat)}
                      aria-pressed={isSelected}
                      aria-label={`Чат ${chat.name}`}
                      className={`flex items-center gap-3 w-full px-3 py-2.5 pr-10 transition-colors text-left relative ${
                        isSelected ? "bg-(--accent)/8" : "hover:bg-(--hover)"
                      }`}
                    >
                      {isSelected && (
                        <span
                          className="absolute left-0 top-2 bottom-2 w-0.75 rounded-r-full bg-(--accent)"
                          aria-hidden="true"
                        />
                      )}
                      <Avatar name={chat.name} size={46} />
                      <div className="flex-1 min-w-0">
                        <span
                          className={`text-3.5 font-semibold truncate block leading-tight ${
                            isSelected
                              ? "text-(--accent)"
                              : "text-(--text-primary)"
                          }`}
                        >
                          {chat.name}
                        </span>
                      </div>
                    </button>
                    <button
                      onClick={() => handleDeleteChat(chat.id)}
                      disabled={isDeleting}
                      aria-label={`Удалить чат ${chat.name}`}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg text-(--text-muted) hover:text-red-500 hover:bg-red-500/10 md:opacity-0 md:group-hover:opacity-100 transition-all disabled:opacity-40"
                    >
                      <Trash2 size={15} aria-hidden="true" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === "contacts" && <ContactsList />}
      </div>

      {/* ── Profile strip ── */}
      <div className="px-3 pb-1 pt-1 border-t border-(--border)">
        <button
          onClick={onOpenProfile}
          aria-label="Открыть профиль"
          className="flex items-center gap-3 w-full rounded-xl px-2 py-2 hover:bg-(--hover) transition-colors text-left"
        >
          <div className="relative shrink-0">
            <Avatar src={profile?.avatar_url} name={displayName} size={34} />
            <span
              className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-(--online) rounded-full border-2 border-(--sidebar)"
              aria-label="В сети"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-3.25 font-semibold text-(--text-primary) truncate leading-tight">
              {displayName}
            </p>
            {profile?.username && (
              <p className="text-xs text-(--text-muted) truncate leading-tight mt-0.5">
                @{profile.username}
              </p>
            )}
          </div>
        </button>
      </div>

      {/* ── Tab bar ── */}
      <nav aria-label="Основная навигация">
        <div className="flex border-t border-(--border) bg-(--sidebar)">
          {TABS.map(({ key, Icon, label }) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => handleTabClick(key)}
                aria-label={label}
                aria-current={isActive ? "page" : undefined}
                className={`flex-1 flex flex-col items-center gap-1 py-2.5 transition-colors relative ${
                  isActive
                    ? "text-(--accent)"
                    : "text-(--text-muted) hover:text-(--text-secondary)"
                }`}
              >
                {isActive && (
                  <span
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-(--accent)"
                    aria-hidden="true"
                  />
                )}
                <Icon
                  size={15}
                  strokeWidth={isActive ? 2.2 : 1.8}
                  aria-hidden="true"
                />
                <span className="text-xs tracking-wide">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </aside>
  );
};
