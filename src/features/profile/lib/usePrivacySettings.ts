import { useEffect, useState } from 'react';
import { profileApi } from '../../../shared/api/profile';
import type { PrivacySettings } from '../../../shared/types/profile';

const DEFAULTS: Omit<PrivacySettings, 'user_id'> = {
  profile_visibility: 'everyone',
  last_seen_visibility: 'everyone',
  avatar_visibility: 'everyone',
};

export const usePrivacySettings = (enabled: boolean) => {
  const [privacy, setPrivacy] = useState<PrivacySettings | null>(null);
  const [draft, setDraft] = useState<PrivacySettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    profileApi
      .getPrivacy()
      .then((s) => { setPrivacy(s); setDraft(s); })
      .catch(async () => {
        try {
          await profileApi.updatePrivacy(DEFAULTS);
          const fresh = await profileApi.getPrivacy();
          setPrivacy(fresh);
          setDraft(fresh);
        } catch {
          const fallback = { user_id: '', ...DEFAULTS };
          setPrivacy(fallback);
          setDraft(fallback);
        }
      });
  }, [enabled]);

  const change = (field: keyof Omit<PrivacySettings, 'user_id'>, value: string) => {
    setDraft((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    setSaveSuccess(false);
    try {
      await profileApi.updatePrivacy({
        profile_visibility: draft.profile_visibility,
        last_seen_visibility: draft.last_seen_visibility,
        avatar_visibility: draft.avatar_visibility,
      });
      const fresh = await profileApi.getPrivacy();
      setPrivacy(fresh);
      setDraft(fresh);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch {
      setDraft(privacy);
    } finally {
      setSaving(false);
    }
  };

  const isDirty =
    draft !== null &&
    privacy !== null &&
    (draft.profile_visibility !== privacy.profile_visibility ||
      draft.last_seen_visibility !== privacy.last_seen_visibility ||
      draft.avatar_visibility !== privacy.avatar_visibility);

  return { draft, saving, saveSuccess, isDirty, change, save };
}
