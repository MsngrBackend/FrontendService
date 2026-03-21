import { useEffect, useState } from "react";
import {
  Settings,
  Copy,
  Check,
  Hash,
  Clock,
  Calendar,
  AtSign,
} from "lucide-react";
import { useAuthStore } from "../../../entities/session/model/authStore";
import { useDisplayName } from "../../../shared/hooks/useDisplayName";
import { Modal } from "../../../shared/ui/Modal";
import { Avatar } from "../../../shared/ui/Avatar";
import { Spinner } from "../../../shared/ui/Spinner";
import { profileApi } from "../../../shared/api/profile";
import type { Profile } from "../../../shared/types/profile";

interface ProfileViewProps {
  onClose: () => void;
  onOpenSettings?: () => void;
  /** Если передан — показываем чужой профиль */
  userId?: string;
}

const formatLastSeen = (iso: string | undefined): string => {
  if (!iso) return "неизвестно";
  const date = new Date(iso);
  const now = new Date();
  const diffMin = Math.floor((now.getTime() - date.getTime()) / 60000);
  if (diffMin < 1) return "только что";
  if (diffMin < 60) return `${diffMin} мин. назад`;
  const timeStr = date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (dateDay.getTime() === today.getTime()) return `сегодня в ${timeStr}`;
  if (dateDay.getTime() === yesterday.getTime()) return `вчера в ${timeStr}`;
  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatJoined = (iso: string): string =>
  new Date(iso).toLocaleDateString("ru-RU", { month: "long", year: "numeric" });

const isRecentlyOnline = (lastSeenAt: string | undefined): boolean =>
  !!lastSeenAt && Date.now() - new Date(lastSeenAt).getTime() < 5 * 60 * 1000;

const HiddenBadge = () => (
  <span className="text-xs text-(--text-muted) italic">скрыто</span>
);

const CopyIdButton = ({ userId }: { userId: string }) => {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(userId).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      const el = document.createElement("textarea");
      el.value = userId;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 group"
      title="Нажмите, чтобы скопировать"
      aria-label="Скопировать ID пользователя"
    >
      <span className="text-sm font-mono text-(--text-primary) group-hover:text-(--accent) transition-colors">
        {userId.slice(0, 8)}…
      </span>
      {copied ? (
        <Check size={13} className="text-green-500" />
      ) : (
        <Copy
          size={13}
          className="text-(--text-muted) group-hover:text-(--accent) transition-colors"
        />
      )}
    </button>
  );
};

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex items-center gap-3 px-4 py-3">
    <div className="w-7 h-7 rounded-lg bg-(--surface) flex items-center justify-center text-(--text-muted) shrink-0">
      {icon}
    </div>
    <span className="text-sm text-(--text-muted) flex-1 min-w-0">{label}</span>
    <div className="text-sm text-(--text-primary)">{value}</div>
  </div>
);

export const ProfileView = ({
  onClose,
  onOpenSettings,
  userId,
}: ProfileViewProps) => {
  const { profile: myProfile } = useAuthStore();
  const myDisplayName = useDisplayName();

  const [fetchResult, setFetchResult] = useState<{
    userId: string | null;
    profile: Profile | null;
    hidden: boolean;
  }>({ userId: null, profile: null, hidden: false });

  const loadingOther = !!userId && fetchResult.userId !== userId;

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    profileApi
      .getProfileById(userId)
      .then((p) => {
        if (!cancelled) setFetchResult({ userId, profile: p, hidden: false });
      })
      .catch((e: { status?: number }) => {
        if (!cancelled)
          setFetchResult({ userId, profile: null, hidden: e?.status === 403 });
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const isOther = !!userId;
  const otherProfile = fetchResult.profile;
  const profileHidden = fetchResult.hidden;
  const fetchedForUserId = fetchResult.userId;
  const profile = isOther ? otherProfile : myProfile;
  const displayName = isOther
    ? otherProfile
      ? [otherProfile.first_name, otherProfile.last_name]
          .filter(Boolean)
          .join(" ") ||
        otherProfile.username ||
        userId!.slice(0, 8) + "…"
      : userId!.slice(0, 8) + "…"
    : myDisplayName;

  const profileUserId = isOther ? userId! : myProfile?.user_id;
  const online = isRecentlyOnline(profile?.last_seen_at);

  // Для чужого профиля определяем, скрыты ли поля настройками приватности:
  // бэкенд возвращает null/undefined для скрытых полей.
  const lastSeenHidden =
    isOther && fetchedForUserId === userId && !profile?.last_seen_at;

  const settingsButton =
    !isOther && onOpenSettings ? (
      <button
        onClick={() => {
          onClose();
          onOpenSettings();
        }}
        className="p-1.5 rounded-lg hover:bg-(--hover) transition-colors text-(--text-muted)"
        aria-label="Настройки профиля"
      >
        <Settings size={17} />
      </button>
    ) : undefined;

  return (
    <Modal
      title={isOther ? "Профиль пользователя" : "Мой профиль"}
      onClose={onClose}
      headerActions={settingsButton}
      maxWidth="max-w-sm"
    >
      {isOther && loadingOther ? (
        <div className="flex justify-center py-12">
          <Spinner size={24} className="text-accent" />
        </div>
      ) : isOther && profileHidden ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-(--text-muted)">
          <span className="text-4xl opacity-30">🔒</span>
          <p className="text-sm font-medium">Профиль скрыт</p>
          <p className="text-xs text-center px-6">
            Этот пользователь ограничил доступ к своему профилю
          </p>
        </div>
      ) : (
        <div className="flex flex-col overflow-y-auto">
          {/* Gradient hero banner */}
          <div
            className="h-28 shrink-0"
            aria-hidden
            style={{
              background:
                "linear-gradient(145deg, var(--accent) 0%, rgba(255,70,85,0.18) 50%, transparent 100%)",
            }}
          />

          {/* Avatar + identity */}
          <div className="flex flex-col items-center -mt-11 px-5 pb-5 gap-4">
            {/* Avatar with online indicator */}
            <div className="relative">
              <Avatar
                src={profile?.avatar_url}
                name={displayName}
                size={88}
                className="ring-[3px] ring-(--surface) shadow-lg"
              />
              <span
                className={`absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border-2 border-(--surface) transition-colors ${
                  online ? "bg-green-500" : "bg-(--text-muted)/30"
                }`}
                aria-hidden="true"
              />
            </div>

            {/* Name + username + status */}
            <div className="text-center">
              <h3 className="text-xl font-semibold text-(--text-primary) leading-tight">
                {displayName}
              </h3>
              {profile?.username && (
                <p className="text-sm text-(--text-muted) mt-0.5">
                  @{profile.username}
                </p>
              )}
              <p
                className={`text-xs mt-1.5 font-medium ${
                  online ? "text-green-500" : "text-(--text-muted)"
                }`}
              >
                {online
                  ? "● в сети"
                  : lastSeenHidden
                  ? "был(а) скрыто"
                  : `был(а) ${formatLastSeen(profile?.last_seen_at)}`}
              </p>
            </div>

            {/* Bio */}
            {profile?.bio && (
              <div className="w-full bg-(--hover) rounded-xl px-4 py-3">
                <p className="text-sm text-(--text-secondary) text-center leading-relaxed">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Info rows */}
            <div className="w-full bg-(--hover) rounded-xl overflow-hidden divide-y divide-(--border)">
              {profile?.username && (
                <InfoRow
                  icon={<AtSign size={14} />}
                  label="Имя пользователя"
                  value={`@${profile.username}`}
                />
              )}
              {profileUserId && (
                <InfoRow
                  icon={<Hash size={14} />}
                  label="ID"
                  value={<CopyIdButton userId={profileUserId} />}
                />
              )}
              <InfoRow
                icon={<Clock size={14} />}
                label="Последний визит"
                value={
                  lastSeenHidden ? (
                    <HiddenBadge />
                  ) : (
                    formatLastSeen(profile?.last_seen_at)
                  )
                }
              />
              {profile?.created_at && (
                <InfoRow
                  icon={<Calendar size={14} />}
                  label="В сервисе с"
                  value={formatJoined(profile.created_at)}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
