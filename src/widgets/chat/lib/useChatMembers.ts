import { useEffect, useState, useCallback } from 'react';
import { chatsApi } from '../../../shared/api/chats';
import { profileApi } from '../../../shared/api/profile';
import type { ChatMember } from '../../../shared/types/chat';
import type { Profile } from '../../../shared/types/profile';

export const useChatMembers = (chatId: number) => {
  const [members, setMembers] = useState<ChatMember[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await chatsApi.getMembers(chatId);
      setMembers(list);
      const results = await Promise.allSettled(
        list.map((m) => profileApi.getProfileById(m.user_id))
      );
      const map: Record<string, Profile> = {};
      results.forEach((res, i) => {
        if (res.status === 'fulfilled') map[list[i]!.user_id] = res.value;
      });
      setProfiles(map);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  useEffect(() => {
    load();
  }, [load]);

  const addMember = useCallback(async (userId: string) => {
    await chatsApi.addMember(chatId, userId);
    await load();
  }, [chatId, load]);

  const removeMember = useCallback(async (userId: string) => {
    await chatsApi.removeMember(chatId, userId);
    setMembers((prev) => prev.filter((m) => m.user_id !== userId));
  }, [chatId]);

  return { members, profiles, loading, addMember, removeMember, reload: load };
};
