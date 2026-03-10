import { useRef, useState } from "react";
import { Camera, Trash2, Lock, Sun, Moon } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useThemeStore } from "../../store/themeStore";
import { useDisplayName } from "../../hooks/useDisplayName";
import { useProfileForm } from "../../hooks/useProfileForm";
import { useAvatarUpload } from "../../hooks/useAvatarUpload";
import { usePrivacySettings } from "../../hooks/usePrivacySettings";
import { Modal } from "../ui/Modal";
import { Avatar } from "../ui/Avatar";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { Button } from "../ui/Button";
import { Spinner } from "../ui/Spinner";

interface ProfileSettingsProps {
  onClose: () => void;
}

type Tab = "profile" | "privacy" | "appearance";

const VISIBILITY_OPTIONS = [
  { value: "everyone", label: "Все" },
  { value: "contacts", label: "Контакты" },
  { value: "nobody", label: "Никто" },
] as const;

const THEME_OPTIONS = [
  { key: "dark" as const, label: "Тёмная", bg: "#0F1923", Icon: Moon },
  { key: "light" as const, label: "Светлая", bg: "#ECE8E1", Icon: Sun },
];

const PRIVACY_FIELDS = [
  { field: "profile_visibility" as const, label: "Видимость профиля" },
  { field: "last_seen_visibility" as const, label: "Был(а) в сети" },
  { field: "avatar_visibility" as const, label: "Фото профиля" },
];

const TABS: { key: Tab; label: string }[] = [
  { key: "profile", label: "Профиль" },
  { key: "privacy", label: "Приватность" },
  { key: "appearance", label: "Внешний вид" },
];

export const ProfileSettings = ({ onClose }: ProfileSettingsProps) => {
  const { profile } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const displayName = useDisplayName();
  const [tab, setTab] = useState<Tab>("profile");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { form, onSubmit, serverError, saveSuccess } = useProfileForm();
  const { loading: avatarLoading, upload, remove } = useAvatarUpload();
  const privacy = usePrivacySettings(tab === "privacy");

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

  return (
    <Modal title="Настройки" onClose={onClose}>
      {/* Tabs */}
      <div className="flex border-b border-(--border) px-5">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`py-3 px-1 mr-5 text-sm font-medium border-b-2 transition-colors ${
              tab === key
                ? "border-(--accent) text-(--accent)"
                : "border-transparent text-(--text-muted) hover:text-(--text-secondary)"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Profile tab */}
        {tab === "profile" && (
          <form onSubmit={onSubmit} className="p-5 flex flex-col gap-4">
            <div className="flex flex-col items-center gap-3">
              <div
                className="relative group cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {avatarLoading ? (
                  <div className="w-20 h-20 rounded-full bg-(--hover) flex items-center justify-center">
                    <Spinner size={24} className="text-(--accent)" />
                  </div>
                ) : (
                  <>
                    <Avatar src={profile?.avatar_url} name={displayName} size={80} />
                    <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
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
              {profile?.avatar_url && (
                <button
                  type="button"
                  onClick={remove}
                  className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={12} />
                  Удалить фото
                </button>
              )}
            </div>

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
            <Input
              label="Имя пользователя"
              placeholder="ivan_ivanov"
              hint="Только буквы, цифры и _, 3–20 символов"
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

            {serverError && (
              <p className="text-sm text-red-500 text-center">{serverError}</p>
            )}
            {saveSuccess && (
              <p className="text-sm text-green-600 text-center">Изменения сохранены ✓</p>
            )}

            <Button type="submit" loading={isSubmitting} disabled={!isDirty} className="w-full">
              Сохранить
            </Button>
          </form>
        )}

        {/* Privacy tab */}
        {tab === "privacy" && (
          <div className="p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-(--text-muted)">
              <Lock size={14} />
              <span className="text-xs">Кто может видеть вашу информацию</span>
            </div>

            {privacy.draft === null ? (
              <div className="flex justify-center py-8">
                <Spinner size={24} className="text-(--accent)" />
              </div>
            ) : (
              <>
                {PRIVACY_FIELDS.map(({ field, label }) => (
                  <div key={field} className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-(--text-secondary)">
                      {label}
                    </label>
                    <div className="flex gap-2">
                      {VISIBILITY_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => privacy.change(field, opt.value)}
                          className={`flex-1 py-2 text-xs font-medium rounded-xl border transition-all ${
                            privacy.draft![field] === opt.value
                              ? "bg-(--accent) border-(--accent) text-white"
                              : "bg-(--input-bg) border-(--border) text-(--text-secondary) hover:border-(--accent)/40"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {privacy.saveSuccess && (
                  <p className="text-sm text-green-600 text-center">Изменения сохранены ✓</p>
                )}

                <Button
                  onClick={privacy.save}
                  loading={privacy.saving}
                  disabled={!privacy.isDirty}
                  className="w-full mt-1"
                >
                  Сохранить
                </Button>
              </>
            )}
          </div>
        )}

        {/* Appearance tab */}
        {tab === "appearance" && (
          <div className="p-5 flex flex-col gap-4">
            <p className="text-xs text-(--text-muted)">Выберите тему оформления</p>
            <div className="flex gap-3">
              {THEME_OPTIONS.map(({ key, label, bg, Icon }) => (
                <button
                  key={key}
                  onClick={() => setTheme(key)}
                  className={`flex-1 flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    theme === key
                      ? "border-(--accent) bg-(--accent-dim)"
                      : "border-(--border) bg-(--hover) hover:border-(--accent)/40"
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: bg }}
                  >
                    <Icon size={18} className="text-[#FF4655]" />
                  </div>
                  <span className="text-sm font-medium text-(--text-primary)">{label}</span>
                  {theme === key && (
                    <span className="text-[10px] font-bold tracking-widest uppercase text-(--accent)">
                      Активна
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
