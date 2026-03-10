import { X } from 'lucide-react';
import type { ReactNode } from 'react';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  headerActions?: ReactNode;
  maxWidth?: string;
}

export const Modal = ({
  title,
  onClose,
  children,
  headerActions,
  maxWidth = 'max-w-md',
}: ModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className={`bg-(--surface) w-full ${maxWidth} rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-(--border)`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-(--border)">
          <h2 className="text-base font-semibold text-(--text-primary)">{title}</h2>
          <div className="flex items-center gap-1">
            {headerActions}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-(--hover) transition-colors text-(--text-muted)"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
