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
import { useAuthStore } from "../../../entities/session/model/authStore";
import { useThemeStore } from "../../../shared/model/themeStore";
import { useDisplayName } from "../../../shared/hooks/useDisplayName";
import { useProfileForm } from "../../../features/profile/lib/useProfileForm";
import { useAvatarUpload } from "../../../features/profile/lib/useAvatarUpload";
import { usePrivacySettings } from "../../../features/profile/lib/usePrivacySettings";
import {
  useSessions,
  parseUserAgent,
} from "../../../features/profile/lib/useSessions";
import { Avatar } from "../../../shared/ui/Avatar";
import { Input } from "../../../shared/ui/Input";
import { Textarea } from "../../../shared/ui/Textarea";
import { Button } from "../../../shared/ui/Button";
import { Spinner } from "../../../shared/ui/Spinner";

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

export const SettingsPage = () => {
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

  const currentNavItem = navItems.find((n) => n.key === tab);

  return (
    <div className="flex h-dvh bg-(--base) overflow-hidden">
      {/* ── Left sidebar ── */}
      <aside
        className={`${
          mobileShowContent ? "hidden md:flex" : "flex"
        } flex-col w-full md:w-72 lg:w-80 bg-sidebar border-r border-border shrink-0 safe-top`}
      >
        {/* Top bar */}
        <div className="flex items-center gap-2 px-4 min-h-14 border-b border-border shrink-0">
          <button
            onClick={() => navigate("/")}
            className="p-1.5 rounded-lg hover:bg-(--hover) transition-colors text-(--text-muted) hover:text-(--text-primary)"
          >
            <ArrowLeft size={18} />
          </button>
          <span className="text-sm font-semibold text-(--text-primary)">
            Настройки
          </span>
        </div>

        {/* Profile card */}
        <div className="px-4 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <Avatar src={profile?.avatar_url} name={displayName} size={40} />
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
        <nav className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-0.5">
          {navItems.map(({ key, label, description, icon, iconBg, badge }) => {
            const isActive = tab === key;
            return (
              <button
                key={key}
                onClick={() => handleNavClick(key)}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all text-left group ${
                  isActive ? "bg-accent/10" : "hover:bg-(--hover)"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 ${iconBg} ${
                    isActive
                      ? "opacity-100"
                      : "opacity-75 group-hover:opacity-100"
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
        } flex-1 flex-col overflow-hidden safe-top`}
      >
        {/* Content header */}
        <div className="flex items-center gap-3 px-6 md:px-10 h-14 border-b border-border shrink-0">
          <button
            onClick={() => setMobileShowContent(false)}
            className="md:hidden p-1.5 rounded-lg hover:bg-(--hover) transition-colors text-(--text-muted)"
          >
            <ArrowLeft size={18} />
          </button>
          <div
            className={`hidden md:flex w-7 h-7 rounded-lg items-center justify-center text-white shrink-0 ${currentNavItem?.iconBg}`}
          >
            {currentNavItem?.icon}
          </div>
          <div>
            <h1 className="text-sm font-semibold text-(--text-primary) leading-tight">
              {currentNavItem?.label}
            </h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* ── Profile tab ── */}
          {tab === "profile" && (
            <div className="flex flex-col">
              {/* Avatar hero */}
              <div className="flex flex-col items-center gap-3 py-10 px-6 border-b border-border">
                <div
                  className="relative group cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {avatarLoading ? (
                    <div className="w-20 h-20 rounded-full bg-(--hover) flex items-center justify-center">
                      <Spinner size={24} className="text-accent" />
                    </div>
                  ) : (
                    <>
                      <Avatar
                        src={profile?.avatar_url}
                        name={displayName}
                        size={80}
                      />
                      <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera size={18} className="text-white" />
                      </div>
                    </>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-base font-semibold text-(--text-primary)">
                    {displayName}
                  </p>
                  {profile?.username && (
                    <p className="text-sm text-(--text-muted) mt-0.5">
                      @{profile.username}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm">
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
                        className="flex items-center gap-1.5 text-(--text-muted) hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={12} />
                        Удалить
                      </button>
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
              </div>

              {/* Form fields */}
              <form
                onSubmit={onSubmit}
                className="px-6 md:px-10 py-8 flex flex-col gap-6 max-w-2xl"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-(--text-muted) mb-4">
                    Личные данные
                  </p>
                  <div className="flex flex-col gap-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Имя *"
                        placeholder="Ваше имя"
                        error={errors.firstName?.message}
                        {...register("firstName")}
                      />
                      <Input
                        label="Фамилия"
                        placeholder="Ваша фамилия"
                        error={errors.lastName?.message}
                        {...register("lastName")}
                      />
                    </div>
                    <Input
                      label="Имя пользователя"
                      placeholder="ivan_ivanov"
                      hint="Буквы, цифры и _, от 3 до 20 символов"
                      error={errors.username?.message}
                      {...register("username")}
                    />
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
                  <p className="text-sm text-red-500">{serverError}</p>
                )}

                <div className="flex items-center gap-4">
                  <Button
                    type="submit"
                    loading={isSubmitting}
                    disabled={!isDirty}
                  >
                    Сохранить изменения
                  </Button>
                  {saveSuccess && (
                    <span className="flex items-center gap-1.5 text-sm text-green-600">
                      <CheckCircle2 size={14} />
                      Сохранено
                    </span>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* ── Privacy tab ── */}
          {tab === "privacy" && (
            <div className="px-6 md:px-10 py-8 max-w-2xl flex flex-col gap-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-(--text-muted) mb-1">
                  Приватность
                </p>
                <p className="text-sm text-(--text-muted)">
                  Управляйте тем, что видят другие пользователи
                </p>
              </div>

              {privacy.draft === null ? (
                <div className="flex justify-center py-16">
                  <Spinner size={28} className="text-accent" />
                </div>
              ) : (
                <>
                  <div className="flex flex-col divide-y divide-border">
                    {PRIVACY_FIELDS.map(({ field, label, description }) => (
                      <div
                        key={field}
                        className="flex flex-col sm:flex-row sm:items-center gap-3 py-4 first:pt-0 last:pb-0"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-(--text-primary)">
                            {label}
                          </p>
                          <p className="text-xs text-(--text-muted) mt-0.5">
                            {description}
                          </p>
                        </div>
                        <div className="flex gap-0.5 p-0.5 bg-(--hover) rounded-xl shrink-0">
                          {VISIBILITY_OPTIONS.map((opt) => {
                            const isSelected =
                              privacy.draft![field] === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => privacy.change(field, opt.value)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                                  isSelected
                                    ? "bg-(--surface) shadow-sm text-accent"
                                    : "text-(--text-muted) hover:text-(--text-primary)"
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

                  <div className="flex items-center gap-4">
                    <Button
                      onClick={privacy.save}
                      loading={privacy.saving}
                      disabled={!privacy.isDirty}
                    >
                      Сохранить
                    </Button>
                    {privacy.saveSuccess && (
                      <span className="flex items-center gap-1.5 text-sm text-green-600">
                        <CheckCircle2 size={14} />
                        Сохранено
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Appearance tab ── */}
          {tab === "appearance" && (
            <div className="px-6 md:px-10 py-8 max-w-2xl flex flex-col gap-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-(--text-muted) mb-1">
                  Оформление
                </p>
                <p className="text-sm text-(--text-muted)">
                  Выберите тему интерфейса
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {THEME_OPTIONS.map(
                  ({ key, label, description, bg, accent, Icon }) => {
                    const isActive = theme === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setTheme(key)}
                        className={`relative flex flex-col gap-4 p-5 rounded-2xl transition-all text-left ${
                          isActive
                            ? "bg-(--surface) ring-2 ring-accent"
                            : "bg-(--surface) hover:bg-(--hover) ring-1 ring-border hover:ring-accent/30"
                        }`}
                      >
                        {/* Theme preview */}
                        <div
                          className="w-full h-20 rounded-xl flex items-end p-3 overflow-hidden"
                          style={{ background: bg }}
                        >
                          {/* Mini UI mockup */}
                          <div className="flex items-center gap-2 w-full">
                            <div
                              className="w-5 h-5 rounded-full shrink-0"
                              style={{ background: accent }}
                            />
                            <div className="flex-1 flex flex-col gap-1">
                              <div
                                className="h-1.5 rounded-full w-3/4 opacity-60"
                                style={{ background: accent }}
                              />
                              <div className="h-1.5 rounded-full w-1/2 bg-white/20" />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-(--text-primary) flex items-center gap-2">
                              <Icon size={14} className="text-(--text-muted)" />
                              {label}
                            </p>
                            <p className="text-xs text-(--text-muted) mt-0.5">
                              {description}
                            </p>
                          </div>
                          {isActive && (
                            <CheckCircle2
                              size={18}
                              className="text-accent shrink-0"
                            />
                          )}
                        </div>
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          )}

          {/* ── Security tab ── */}
          {tab === "security" && (
            <div className="px-6 md:px-10 py-8 max-w-2xl flex flex-col gap-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-(--text-muted) mb-1">
                  Активные сессии
                </p>
                <p className="text-sm text-(--text-muted)">
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
                <div className="flex flex-col divide-y divide-border">
                  {sessions.sessions.map((session) => {
                    const isCurrent = sessions.currentSessionId === session.id;
                    const label = parseUserAgent(session.user_agent);
                    const isMobile = /mobile|android|iphone|ipad/i.test(
                      session.user_agent
                    );
                    return (
                      <div
                        key={session.id}
                        className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                      >
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            isCurrent ? "bg-accent/10" : "bg-(--hover)"
                          }`}
                        >
                          {isMobile ? (
                            <Smartphone
                              size={18}
                              className={
                                isCurrent
                                  ? "text-accent"
                                  : "text-(--text-muted)"
                              }
                            />
                          ) : (
                            <Monitor
                              size={18}
                              className={
                                isCurrent
                                  ? "text-accent"
                                  : "text-(--text-muted)"
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
                              <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-accent/10 text-2.5 font-bold uppercase tracking-wider text-accent">
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
                                  {new Date(
                                    session.created_at
                                  ).toLocaleDateString("ru-RU", {
                                    day: "numeric",
                                    month: "short",
                                  })}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {!isCurrent && (
                          <button
                            onClick={() => sessions.revoke(session.id)}
                            disabled={sessions.revoking === session.id}
                            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-(--text-muted) hover:text-red-500 hover:bg-red-500/10 transition-all disabled:opacity-40"
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
