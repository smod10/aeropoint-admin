import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Optional max width class, e.g. 'max-w-md' (default) or 'max-w-2xl' */
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClass: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={`relative w-full ${sizeClass[size]} rounded-2xl bg-white shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 shrink-0">
          <h2 id="modal-title" className="text-base font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6 text-sm">
          {children}
        </div>
      </div>
    </div>
  );
}

