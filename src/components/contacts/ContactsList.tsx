import { useEffect, useState } from "react";
import { UserPlus, Trash2, UserCircle2, X } from "lucide-react";
import { profileApi } from "../../api/profile";
import type { Contact } from "../../types/profile";
import { Avatar } from "../ui/Avatar";
import { Spinner } from "../ui/Spinner";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";

const getContactDisplayName = (c: Contact): string => {
  if (c.alias) return c.alias;
  if (c.profile?.first_name || c.profile?.last_name) {
    return [c.profile.first_name, c.profile.last_name].filter(Boolean).join(" ");
  }
  if (c.profile?.username) return `@${c.profile.username}`;
  return c.contact_id.slice(0, 8) + "…";
}

export const ContactsList = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addId, setAddId] = useState("");
  const [addAlias, setAddAlias] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await profileApi.getContacts();
      setContacts(data ?? []);
    } catch (e: unknown) {
      setError((e as { message?: string }).message ?? "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }

  const resolveUserId = async (input: string): Promise<string> => {
    if (input.startsWith("@")) {
      const profile = await profileApi.getProfileByUsername(input.slice(1));
      return profile.user_id;
    }
    return input;
  };

  const handleAdd = async () => {
    const raw = addId.trim();
    if (!raw) return;
    setAdding(true);
    setAddError(null);
    try {
      const contactId = await resolveUserId(raw);
      const contact = await profileApi.addContact({
        contact_id: contactId,
        alias: addAlias.trim() || undefined,
      });
      setContacts((prev) => [...prev, contact]);
      setAddId("");
      setAddAlias("");
      setShowAddForm(false);
    } catch (e: unknown) {
      setAddError((e as { message?: string }).message ?? "Ошибка");
    } finally {
      setAdding(false);
    }
  }

  const handleRemove = async (contactId: string) => {
    setRemovingId(contactId);
    try {
      await profileApi.removeContact(contactId);
      setContacts((prev) => prev.filter((c) => c.contact_id !== contactId));
    } catch {
      // ignore
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-(--border)">
        <span className="text-sm font-semibold text-(--text-primary)">Контакты</span>
        <button
          onClick={() => setShowAddForm((v) => !v)}
          className="p-1.5 rounded-lg hover:bg-(--hover) transition-colors"
          title="Добавить контакт"
        >
          {showAddForm ? (
            <X size={18} className="text-(--text-muted)" />
          ) : (
            <UserPlus size={18} className="text-(--text-muted)" />
          )}
        </button>
      </div>

      {/* Add form */}
      {showAddForm && (
        <div className="px-4 py-3 border-b border-(--border) flex flex-col gap-2 bg-(--surface)">
          <Input
            label="ID или @username"
            placeholder="uuid или @username"
            value={addId}
            onChange={(e) => setAddId(e.target.value)}
          />
          <Input
            label="Псевдоним (необязательно)"
            placeholder="Как вы его зовёте"
            value={addAlias}
            onChange={(e) => setAddAlias(e.target.value)}
          />
          {addError && (
            <p className="text-xs text-red-500">{addError}</p>
          )}
          <Button onClick={handleAdd} loading={adding} disabled={!addId.trim()} className="w-full">
            Добавить
          </Button>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner size={24} className="text-(--accent)" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2 text-(--text-muted)">
            <p className="text-sm">{error}</p>
            <button
              onClick={load}
              className="text-xs text-(--accent) hover:underline"
            >
              Повторить
            </button>
          </div>
        ) : contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-(--text-muted)">
            <UserCircle2 size={40} className="opacity-30" />
            <p className="text-sm">Контактов пока нет</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="text-xs text-(--accent) hover:underline"
            >
              Добавить первый контакт
            </button>
          </div>
        ) : (
          contacts.map((contact) => (
            <div
              key={contact.contact_id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-(--hover) transition-colors"
            >
              <Avatar
                src={contact.profile?.avatar_url}
                name={getContactDisplayName(contact)}
                size={46}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-(--text-primary) truncate">
                  {getContactDisplayName(contact)}
                </p>
                {contact.profile?.username && (
                  <p className="text-xs text-(--text-muted) truncate">
                    @{contact.profile.username}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleRemove(contact.contact_id)}
                disabled={removingId === contact.contact_id}
                className="p-1.5 rounded-lg text-(--text-muted) hover:text-red-500 hover:bg-red-500/10 transition-colors"
                title="Удалить контакт"
              >
                {removingId === contact.contact_id ? (
                  <Spinner size={14} />
                ) : (
                  <Trash2 size={14} />
                )}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
