import { useState } from 'react';
import { X, UserPlus, Trash2 } from 'lucide-react';
import { profileApi } from '../../../shared/api/profile';
import { Avatar } from '../../../shared/ui/Avatar';
import { Spinner } from '../../../shared/ui/Spinner';
import { useChatMembers } from '../lib/useChatMembers';
import type { Profile } from '../../../shared/types/profile';

interface Props {
  chatId: number;
  myUserId: string | null;
  onClose: () => void;
}

const getDisplayName = (profile: Profile | null, userId: string): string => {
  if (!profile) return userId.slice(0, 8) + '…';
  const name = [profile.first_name, profile.last_name].filter(Boolean).join(' ');
  return name || profile.username || userId.slice(0, 8) + '…';
}

export const ChatMembersPanel = ({ chatId, myUserId, onClose }: Props) => {
  const { members, profiles, loading, addMember, removeMember } = useChatMembers(chatId);
  const [newUserId, setNewUserId] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const resolveUserId = async (input: string): Promise<string> => {
    if (input.startsWith('@')) {
      const profile = await profileApi.getProfileByUsername(input.slice(1));
      return profile.user_id;
    }
    return input;
  };

  const handleAdd = async () => {
    const raw = newUserId.trim();
    if (!raw) return;
    setAdding(true);
    setError('');
    try {
      const uid = await resolveUserId(raw);
      await addMember(uid);
      setNewUserId('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка');
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (userId: string) => {
    try {
      await removeMember(userId);
    } catch {
      // ignore
    }
  };

  return (
    <div className="w-64 border-l border-(--border) bg-(--surface) flex flex-col h-full shrink-0">
      <div className="flex items-center justify-between px-4 py-3 border-b border-(--border)">
        <span className="text-sm font-semibold text-(--text-primary)">
          Участники {!loading && `(${members.length})`}
        </span>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-(--hover) transition-colors"
        >
          <X size={16} className="text-(--text-muted)" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner size={20} className="text-(--accent)" />
          </div>
        ) : members.length === 0 ? (
          <p className="text-xs text-(--text-muted) text-center py-8">Нет участников</p>
        ) : (
          members.map((m) => {
            const profile = profiles[m.user_id] ?? null;
            const name = getDisplayName(profile, m.user_id);
            const isMe = m.user_id === myUserId;
            return (
              <div
                key={m.id}
                className="flex items-center gap-3 px-4 py-2 hover:bg-(--hover) transition-colors group"
              >
                <Avatar src={profile?.avatar_url} name={name} size={32} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-(--text-primary) truncate">
                    {name}
                    {isMe && (
                      <span className="text-(--text-muted) text-xs ml-1">(вы)</span>
                    )}
                  </p>
                  {profile?.username && (
                    <p className="text-xs text-(--text-muted) truncate">
                      @{profile.username}
                    </p>
                  )}
                </div>
                {!isMe && (
                  <button
                    onClick={() => handleRemove(m.user_id)}
                    className="p-1 rounded-lg text-(--text-muted) hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                    title="Удалить из чата"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="px-3 py-3 border-t border-(--border)">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="ID или @username"
            value={newUserId}
            onChange={(e) => {
              setNewUserId(e.target.value);
              setError('');
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            className="flex-1 bg-(--input-bg) rounded-xl px-3 py-1.5 text-xs outline-none text-(--text-primary) placeholder-(--text-muted) focus:ring-1 focus:ring-(--accent)/30"
          />
          <button
            onClick={handleAdd}
            disabled={!newUserId.trim() || adding}
            className="p-1.5 rounded-lg bg-(--accent) text-white hover:bg-(--accent)/90 transition-colors disabled:opacity-40"
            title="Добавить участника"
          >
            {adding ? <Spinner size={14} /> : <UserPlus size={14} />}
          </button>
        </div>
        {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
      </div>
    </div>
  );
}
