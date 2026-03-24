import { useEffect, useState } from "react";
import { chatsApi } from "../../../shared/api/chats";
import { profileApi } from "../../../shared/api/profile";

interface SenderInfo {
  name: string;
  avatarUrl?: string;
}

export const useSenderNames = (chatId: number) => {
  const [senderInfo, setSenderInfo] = useState<Record<string, SenderInfo>>({});

  useEffect(() => {
    let cancelled = false;
    chatsApi
      .getMembers(chatId)
      .then(async (members) => {
        const results = await Promise.allSettled(
          members.map((m) => profileApi.getProfileById(m.user_id))
        );
        if (cancelled) return;
        const map: Record<string, SenderInfo> = {};
        results.forEach((res, i) => {
          const userId = members[i].user_id;
          if (res.status === "fulfilled") {
            const p = res.value;
            const name = [p.first_name, p.last_name].filter(Boolean).join(" ");
            map[userId] = {
              name: name || p.username || userId.slice(0, 8),
              avatarUrl: p.avatar_url,
            };
          } else {
            map[userId] = { name: userId.slice(0, 8) };
          }
        });
        setSenderInfo(map);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [chatId]);

  return senderInfo;
}
