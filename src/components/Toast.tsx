'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle, WarningCircle, Info, type Icon as PhosphorIcon } from '@phosphor-icons/react';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

const ToastContext = createContext<{ toast: (message: string, type?: ToastType) => void }>({
  toast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

const toastConfig: Record<ToastType, { cls: string; icon: PhosphorIcon }> = {
  success: { cls: 'bg-pine-700 text-white', icon: CheckCircle },
  error: { cls: 'bg-clay-700 text-white', icon: WarningCircle },
  info: { cls: 'bg-ink-900 text-white', icon: Info },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev.slice(-2), { id, message, type }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[100] flex flex-col gap-2 sm:left-auto sm:right-6 sm:w-96 sm:max-w-[calc(100vw-3rem)]"
      >
        {toasts.map((t) => {
          const { cls, icon: Icon } = toastConfig[t.type];
          return (
            <div
              key={t.id}
              role="status"
              className={`anim-scale-in pointer-events-auto flex items-start gap-2.5 rounded-control px-4 py-3 text-sm font-medium shadow-pop ${cls}`}
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0" weight="fill" aria-hidden="true" />
              <span className="leading-snug">{t.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
