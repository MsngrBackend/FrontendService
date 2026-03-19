import { useEffect, useState } from "react";
import { chatsApi } from "../../../shared/api/chats";
import { profileApi } from "../../../shared/api/profile";

export const useSenderNames = (chatId: number) => {
  const [senderNames, setSenderNames] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    chatsApi
      .getMembers(chatId)
      .then(async (members) => {
        const results = await Promise.allSettled(
          members.map((m) => profileApi.getProfileById(m.user_id))
        );
        if (cancelled) return;
        const map: Record<string, string> = {};
        results.forEach((res, i) => {
          const userId = members[i].user_id;
          if (res.status === "fulfilled") {
            const p = res.value;
            const name = [p.first_name, p.last_name].filter(Boolean).join(" ");
            map[userId] = name || p.username || userId.slice(0, 8);
          } else {
            map[userId] = userId.slice(0, 8);
          }
        });
        setSenderNames(map);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [chatId]);

  return senderNames;
}
