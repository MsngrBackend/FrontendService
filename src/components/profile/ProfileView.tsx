import { useEffect, useState } from "react";
import { Settings, Copy, Check } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useDisplayName } from "../../hooks/useDisplayName";
import { Modal } from "../ui/Modal";
import { Avatar } from "../ui/Avatar";
import { Spinner } from "../ui/Spinner";
import { profileApi } from "../../api/profile";
import type { Profile } from "../../types/profile";

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

const CopyIdButton = ({ userId }: { userId: string }) => {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(userId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 group"
      title="Нажмите, чтобы скопировать"
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

export const ProfileView = ({
  onClose,
  onOpenSettings,
  userId,
}: ProfileViewProps) => {
  const { profile: myProfile } = useAuthStore();
  const myDisplayName = useDisplayName();

  const [otherProfile, setOtherProfile] = useState<Profile | null>(null);
  const [fetchedForUserId, setFetchedForUserId] = useState<string | null>(null);
  const loadingOther = !!userId && fetchedForUserId !== userId;

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    profileApi
      .getProfileById(userId)
      .then((p) => {
        if (!cancelled) setOtherProfile(p);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setFetchedForUserId(userId);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const isOther = !!userId;
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

  const fields = [
    { label: "Имя", value: profile?.first_name },
    { label: "Фамилия", value: profile?.last_name },
    {
      label: "Имя пользователя",
      value: profile?.username ? `@${profile.username}` : undefined,
    },
  ].filter((f) => f.value);

  const settingsButton =
    !isOther && onOpenSettings ? (
      <button
        onClick={() => {
          onClose();
          onOpenSettings();
        }}
        className="p-1.5 rounded-lg hover:bg-(--hover) transition-colors text-(--text-muted)"
        title="Настройки"
      >
        <Settings size={17} />
      </button>
    ) : undefined;

  const profileUserId = isOther ? userId! : myProfile?.user_id;

  return (
    <Modal
      title={isOther ? "Профиль пользователя" : "Профиль"}
      onClose={onClose}
      headerActions={settingsButton}
      maxWidth="max-w-sm"
    >
      {isOther && loadingOther ? (
        <div className="flex justify-center py-12">
          <Spinner size={24} className="text-(--accent)" />
        </div>
      ) : (
        <div className="p-6 flex flex-col items-center gap-5">
          <Avatar src={profile?.avatar_url} name={displayName} size={88} />

          <div className="text-center">
            <p className="text-lg font-semibold text-(--text-primary)">
              {displayName}
            </p>
            {profile?.username && (
              <p className="text-sm text-(--text-muted) mt-0.5">
                @{profile.username}
              </p>
            )}
          </div>

          {profile?.bio && (
            <div className="w-full bg-(--hover) rounded-xl px-4 py-3">
              <p className="text-sm text-(--text-secondary) text-center">
                {profile.bio}
              </p>
            </div>
          )}

          <div className="w-full flex flex-col">
            {fields.map(({ label, value }) => (
              <div
                key={label}
                className="flex justify-between items-center py-2.5 border-b border-(--border)"
              >
                <span className="text-xs text-(--text-muted)">{label}</span>
                <span className="text-sm text-(--text-primary)">{value}</span>
              </div>
            ))}

            {profileUserId && (
              <div className="flex justify-between items-center py-2.5 border-b border-(--border)">
                <span className="text-xs text-(--text-muted)">
                  ID пользователя
                </span>
                <CopyIdButton userId={profileUserId} />
              </div>
            )}

            <div className="flex justify-between items-center py-2.5">
              <span className="text-xs text-(--text-muted)">
                Последний визит
              </span>
              <span className="text-sm text-(--text-primary)">
                {formatLastSeen(profile?.last_seen_at)}
              </span>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
