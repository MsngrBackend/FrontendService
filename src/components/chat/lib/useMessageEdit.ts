import { useState } from "react";

interface UseMessageEditOptions {
  editMessage: (id: number, content: string) => Promise<void>;
  deleteMessage: (id: number) => Promise<void>;
}

export const useMessageEdit = ({ editMessage, deleteMessage }: UseMessageEditOptions) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const startEdit = (id: number, content: string) => {
    setEditingId(id);
    setEditText(content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const saveEdit = async () => {
    if (!editingId || !editText.trim()) return;
    setEditSaving(true);
    try {
      await editMessage(editingId, editText.trim());
      setEditingId(null);
      setEditText("");
    } catch {
      // ignore
    } finally {
      setEditSaving(false);
    }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      saveEdit();
    }
    if (e.key === "Escape") cancelEdit();
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMessage(id);
    } catch {
      // ignore
    }
  };

  return {
    editingId,
    editText,
    editSaving,
    hoveredId,
    setEditText,
    setHoveredId,
    startEdit,
    cancelEdit,
    saveEdit,
    handleEditKeyDown,
    handleDelete,
  };
}
