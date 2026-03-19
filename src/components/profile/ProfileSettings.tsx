import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  Trash2,
  Lock,
  Sun,
  Moon,
  Shield,
  Monitor,
  Smartphone,
  LogOut,
  User,
  ArrowLeft,
  Eye,
  EyeOff,
  Clock,
  CheckCircle2,
  Palette,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useThemeStore } from "../../store/themeStore";
import { useDisplayName } from "../../hooks/useDisplayName";
import { useProfileForm } from "../../hooks/useProfileForm";
import { useAvatarUpload } from "../../hooks/useAvatarUpload";
import { usePrivacySettings } from "../../hooks/usePrivacySettings";
import { useSessions, parseUserAgent } from "../../hooks/useSessions";
import { Avatar } from "../ui/Avatar";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { Button } from "../ui/Button";
import { Spinner } from "../ui/Spinner";

type Tab = "profile" | "privacy" | "appearance" | "security";

const VISIBILITY_OPTIONS = [
  { value: "everyone", label: "Все", icon: Eye },
  { value: "contacts", label: "Контакты", icon: User },
  { value: "nobody", label: "Никто", icon: EyeOff },
] as const;

const THEME_OPTIONS = [
  {
    key: "dark" as const,
    label: "Тёмная",
    description: "Для ночного времени",
    bg: "#0F1923",
    accent: "#FF4655",
    Icon: Moon,
  },
  {
    key: "light" as const,
    label: "Светлая",
    description: "Для дневного времени",
    bg: "#ECE8E1",
    accent: "#FF4655",
    Icon: Sun,
  },
];

const PRIVACY_FIELDS = [
  {
    field: "profile_visibility" as const,
    label: "Видимость профиля",
    description: "Кто может просматривать ваш профиль",
  },
  {
    field: "last_seen_visibility" as const,
    label: "Был(а) в сети",
    description: "Кто видит время вашей последней активности",
  },
  {
    field: "avatar_visibility" as const,
    label: "Фото профиля",
    description: "Кто может видеть ваш аватар",
  },
];

interface NavItem {
  key: Tab;
  label: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  badge?: number;
}

export const ProfileSettings = () => {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const displayName = useDisplayName();
  const [tab, setTab] = useState<Tab>("profile");
  const [mobileShowContent, setMobileShowContent] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { form, onSubmit, serverError, saveSuccess } = useProfileForm();
  const { loading: avatarLoading, upload, remove } = useAvatarUpload();
  const privacy = usePrivacySettings(tab === "privacy");
  const sessions = useSessions(tab === "security");

  const {
    register,
    formState: { errors, isSubmitting, isDirty },
  } = form;

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await upload(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const navItems: NavItem[] = [
    {
      key: "profile",
      label: "Мой профиль",
      description: "Имя, фото, о себе",
      icon: <User size={15} />,
      iconBg: "bg-blue-500",
    },
    {
      key: "privacy",
      label: "Приватность",
      description: "Видимость данных",
      icon: <Lock size={15} />,
      iconBg: "bg-slate-500",
    },
    {
      key: "appearance",
      label: "Оформление",
      description: "Тема интерфейса",
      icon: <Palette size={15} />,
      iconBg: "bg-purple-500",
    },
    {
      key: "security",
      label: "Активные сессии",
      description: "Устройства и входы",
      icon: <Shield size={15} />,
      iconBg: "bg-orange-500",
      badge: sessions.sessions.length || undefined,
    },
  ];

  const handleNavClick = (key: Tab) => {
    setTab(key);
    setMobileShowContent(true);
  };

  const currentTabLabel = navItems.find((n) => n.key === tab)?.label;

  return (
    <div className="flex h-screen bg-(--base) overflow-hidden">
      {/* ── Left sidebar ── */}
      <aside
        className={`${
          mobileShowContent ? "hidden md:flex" : "flex"
        } flex-col w-full md:w-72 lg:w-80 bg-sidebar border-r border-border shrink-0`}
      >
        {/* Top bar */}
        <div className="flex items-center gap-2 px-4 h-14 border-b border-border">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg hover:bg-(--hover) transition-colors text-(--text-muted) hover:text-(--text-primary)"
          >
            <ArrowLeft size={18} />
          </button>
          <span className="text-sm font-semibold text-(--text-primary)">
            Настройки
          </span>
        </div>

        {/* Profile card */}
        <div className="px-3 py-4">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-(--surface) border border-border">
            <Avatar src={profile?.avatar_url} name={displayName} size={44} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-(--text-primary) truncate leading-tight">
                {displayName}
              </p>
              {profile?.username ? (
                <p className="text-xs text-(--text-muted) truncate mt-0.5">
                  @{profile.username}
                </p>
              ) : (
                <p className="text-xs text-(--text-muted) mt-0.5">
                  Имя пользователя не задано
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4 flex flex-col gap-0.5">
          {navItems.map(({ key, label, description, icon, iconBg, badge }) => {
            const isActive = tab === key;
            return (
              <button
                key={key}
                onClick={() => handleNavClick(key)}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all text-left group ${
                  isActive
                    ? "bg-accent/10"
                    : "hover:bg-(--hover)"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 ${iconBg} ${
                    isActive ? "opacity-100" : "opacity-80 group-hover:opacity-100"
                  }`}
                >
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium leading-tight ${
                      isActive ? "text-accent" : "text-(--text-primary)"
                    }`}
                  >
                    {label}
                  </p>
                  <p className="text-xs text-(--text-muted) leading-tight mt-0.5 truncate">
                    {description}
                  </p>
                </div>
                {badge != null && badge > 0 && (
                  <span className="shrink-0 min-w-5 h-5 px-1.5 rounded-full bg-(--hover) text-xs font-semibold text-(--text-muted) flex items-center justify-center">
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ── Right content ── */}
      <main
        className={`${
          mobileShowContent ? "flex" : "hidden md:flex"
        } flex-1 flex-col overflow-hidden`}
      >
        {/* Mobile back header */}
        <div className="md:hidden flex items-center gap-2 px-4 h-14 border-b border-border bg-sidebar shrink-0">
          <button
            onClick={() => setMobileShowContent(false)}
            className="p-1.5 rounded-lg hover:bg-(--hover) transition-colors text-(--text-muted)"
          >
            <ArrowLeft size={18} />
          </button>
          <span className="text-sm font-semibold text-(--text-primary)">
            {currentTabLabel}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* ── Profile tab ── */}
          {tab === "profile" && (
            <form
              onSubmit={onSubmit}
              className="max-w-md mx-auto px-6 py-8 flex flex-col gap-6"
            >
              {/* Avatar section */}
              <div className="flex flex-col items-center gap-3">
                <div
                  className="relative group cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {avatarLoading ? (
                    <div className="w-24 h-24 rounded-full bg-(--hover) flex items-center justify-center">
                      <Spinner size={28} className="text-accent" />
                    </div>
                  ) : (
                    <>
                      <Avatar
                        src={profile?.avatar_url}
                        name={displayName}
                        size={96}
                      />
                      <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera size={22} className="text-white" />
                      </div>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <div className="flex items-center gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-accent hover:underline font-medium transition-colors"
                  >
                    Загрузить фото
                  </button>
                  {profile?.avatar_url && (
                    <>
                      <span className="text-border">·</span>
                      <button
                        type="button"
                        onClick={remove}
                        className="flex items-center gap-1 text-(--text-muted) hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={11} />
                        Удалить
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Form fields */}
              <div className="bg-(--surface) rounded-2xl border border-border divide-y divide-border">
                <div className="px-4 py-3.5">
                  <Input
                    label="Имя *"
                    placeholder="Ваше имя"
                    error={errors.firstName?.message}
                    {...register("firstName")}
                  />
                </div>
                <div className="px-4 py-3.5">
                  <Input
                    label="Фамилия"
                    placeholder="Ваша фамилия"
                    error={errors.lastName?.message}
                    {...register("lastName")}
                  />
                </div>
                <div className="px-4 py-3.5">
                  <Input
                    label="Имя пользователя"
                    placeholder="ivan_ivanov"
                    hint="Буквы, цифры и _, от 3 до 20 символов"
                    error={errors.username?.message}
                    {...register("username")}
                  />
                </div>
                <div className="px-4 py-3.5">
                  <Textarea
                    label="О себе"
                    placeholder="Расскажите о себе..."
                    rows={3}
                    maxLength={200}
                    error={errors.bio?.message}
                    {...register("bio")}
                  />
                </div>
              </div>

              {serverError && (
                <p className="text-sm text-red-500 text-center">{serverError}</p>
              )}
              {saveSuccess && (
                <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                  <CheckCircle2 size={15} />
                  Изменения сохранены
                </div>
              )}

              <Button
                type="submit"
                loading={isSubmitting}
                disabled={!isDirty}
                className="w-full"
              >
                Сохранить изменения
              </Button>
            </form>
          )}

          {/* ── Privacy tab ── */}
          {tab === "privacy" && (
            <div className="max-w-md mx-auto px-6 py-8 flex flex-col gap-6">
              <div>
                <h2 className="text-base font-semibold text-(--text-primary)">
                  Приватность
                </h2>
                <p className="text-sm text-(--text-muted) mt-1">
                  Управляйте тем, что видят другие пользователи
                </p>
              </div>

              {privacy.draft === null ? (
                <div className="flex justify-center py-16">
                  <Spinner size={28} className="text-accent" />
                </div>
              ) : (
                <>
                  <div className="bg-(--surface) rounded-2xl border border-border divide-y divide-border">
                    {PRIVACY_FIELDS.map(({ field, label, description }) => (
                      <div key={field} className="px-4 py-4 flex flex-col gap-3">
                        <div>
                          <p className="text-sm font-medium text-(--text-primary)">
                            {label}
                          </p>
                          <p className="text-xs text-(--text-muted) mt-0.5">
                            {description}
                          </p>
                        </div>
                        <div className="flex gap-1.5 p-1 bg-(--base) rounded-xl border border-border">
                          {VISIBILITY_OPTIONS.map((opt) => {
                            const isSelected = privacy.draft![field] === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => privacy.change(field, opt.value)}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                                  isSelected
                                    ? "bg-(--surface) shadow-sm text-accent border border-border"
                                    : "text-(--text-muted) hover:text-(--text-secondary)"
                                }`}
                              >
                                <opt.icon size={11} />
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {privacy.saveSuccess && (
                    <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                      <CheckCircle2 size={15} />
                      Изменения сохранены
                    </div>
                  )}

                  <Button
                    onClick={privacy.save}
                    loading={privacy.saving}
                    disabled={!privacy.isDirty}
                    className="w-full"
                  >
                    Сохранить
                  </Button>
                </>
              )}
            </div>
          )}

          {/* ── Appearance tab ── */}
          {tab === "appearance" && (
            <div className="max-w-md mx-auto px-6 py-8 flex flex-col gap-6">
              <div>
                <h2 className="text-base font-semibold text-(--text-primary)">
                  Оформление
                </h2>
                <p className="text-sm text-(--text-muted) mt-1">
                  Выберите тему интерфейса
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {THEME_OPTIONS.map(({ key, label, description, bg, Icon }) => {
                  const isActive = theme === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setTheme(key)}
                      className={`relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all text-center ${
                        isActive
                          ? "border-accent bg-accent/5"
                          : "border-border bg-(--surface) hover:border-accent/30 hover:bg-(--hover)"
                      }`}
                    >
                      {/* Theme preview circle */}
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center shadow-md"
                        style={{ background: bg }}
                      >
                        <Icon size={22} color="#FF4655" />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-(--text-primary)">
                          {label}
                        </p>
                        <p className="text-xs text-(--text-muted) mt-0.5">
                          {description}
                        </p>
                      </div>

                      {isActive && (
                        <div className="absolute top-3 right-3">
                          <CheckCircle2 size={16} className="text-accent" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Security tab ── */}
          {tab === "security" && (
            <div className="max-w-md mx-auto px-6 py-8 flex flex-col gap-6">
              <div>
                <h2 className="text-base font-semibold text-(--text-primary)">
                  Активные сессии
                </h2>
                <p className="text-sm text-(--text-muted) mt-1">
                  Устройства, авторизованные в вашем аккаунте
                </p>
              </div>

              {sessions.error && (
                <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <p className="text-sm text-red-500">{sessions.error}</p>
                </div>
              )}

              {sessions.loading ? (
                <div className="flex justify-center py-16">
                  <Spinner size={28} className="text-accent" />
                </div>
              ) : sessions.sessions.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-16 text-(--text-muted)">
                  <Shield size={36} className="opacity-30" />
                  <p className="text-sm">Нет активных сессий</p>
                </div>
              ) : (
                <div className="bg-(--surface) rounded-2xl border border-border divide-y divide-border">
                  {sessions.sessions.map((session) => {
                    const isCurrent = sessions.currentSessionId === session.id;
                    const label = parseUserAgent(session.user_agent);
                    const isMobile = /mobile|android|iphone|ipad/i.test(
                      session.user_agent
                    );
                    return (
                      <div
                        key={session.id}
                        className="flex items-center gap-3 px-4 py-3.5"
                      >
                        {/* Device icon */}
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isCurrent
                              ? "bg-accent/10"
                              : "bg-(--hover)"
                          }`}
                        >
                          {isMobile ? (
                            <Smartphone
                              size={17}
                              className={
                                isCurrent ? "text-accent" : "text-(--text-muted)"
                              }
                            />
                          ) : (
                            <Monitor
                              size={17}
                              className={
                                isCurrent ? "text-accent" : "text-(--text-muted)"
                              }
                            />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-(--text-primary) truncate">
                              {label}
                            </span>
                            {isCurrent && (
                              <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-accent/10 text-[10px] font-bold uppercase tracking-wider text-accent">
                                Текущая
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-(--text-muted)">
                              {session.ip}
                            </span>
                            {session.created_at && (
                              <>
                                <span className="text-border">·</span>
                                <span className="flex items-center gap-1 text-xs text-(--text-muted)">
                                  <Clock size={10} />
                                  {new Date(session.created_at).toLocaleDateString(
                                    "ru-RU",
                                    { day: "numeric", month: "short" }
                                  )}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {!isCurrent && (
                          <button
                            onClick={() => sessions.revoke(session.id)}
                            disabled={sessions.revoking === session.id}
                            className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-(--text-muted) hover:text-red-500 hover:bg-red-500/10 transition-all disabled:opacity-40"
                            title="Завершить сессию"
                          >
                            {sessions.revoking === session.id ? (
                              <Spinner size={12} />
                            ) : (
                              <>
                                <LogOut size={12} />
                                Выйти
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
