import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface SlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'default' | 'wide';
}

export default function SlideOver({ isOpen, onClose, title, children, size = 'default' }: SlideOverProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative flex max-h-[calc(100dvh-2rem)] w-full flex-col overflow-hidden rounded-xl bg-white shadow-2xl sm:max-h-[calc(100dvh-3rem)] ${size === 'wide' ? 'max-w-5xl' : 'max-w-md'}`}>
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              <button 
                onClick={onClose}
                type="button"
                aria-label="Close dialog"
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="relative min-h-0 flex-1 overflow-y-auto p-6 text-sm">
              {children}
            </div>
      </div>
    </div>
  );
}