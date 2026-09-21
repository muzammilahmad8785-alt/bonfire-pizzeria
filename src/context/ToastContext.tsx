import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { soundFx } from '../utils/sound';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 3500) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    
    // Play sound according to toast type
    if (type === 'success') {
      soundFx.playSaveSuccess();
    } else if (type === 'error') {
      soundFx.playError();
    } else {
      soundFx.playClick();
    }

    setToasts((prev) => [...prev, { id, type, message, duration }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  const success = useCallback((msg: string, dur?: number) => showToast(msg, 'success', dur), [showToast]);
  const error = useCallback((msg: string, dur?: number) => showToast(msg, 'error', dur), [showToast]);
  const info = useCallback((msg: string, dur?: number) => showToast(msg, 'info', dur), [showToast]);
  const warning = useCallback((msg: string, dur?: number) => showToast(msg, 'warning', dur), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}

      {/* Floating Toast Portal Container */}
      <div 
        id="toast-container" 
        className="fixed bottom-6 right-4 sm:right-6 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-2"
      >
        {toasts.map((toast) => {
          let bg = 'bg-zinc-900/95 border-zinc-800 text-zinc-100';
          let icon = <Info className="w-5 h-5 text-blue-400 shrink-0" />;

          if (toast.type === 'success') {
            bg = 'bg-[#121814]/95 border-emerald-500/40 text-emerald-100 shadow-lg shadow-emerald-950/40';
            icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
          } else if (toast.type === 'error') {
            bg = 'bg-[#1c1214]/95 border-red-500/40 text-red-100 shadow-lg shadow-red-950/40';
            icon = <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />;
          } else if (toast.type === 'warning') {
            bg = 'bg-[#1c1810]/95 border-amber-500/40 text-amber-100 shadow-lg shadow-amber-950/40';
            icon = <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl border backdrop-blur-md shadow-2xl transition-all animate-fadeIn ${bg}`}
              role="alert"
            >
              <div className="flex items-center gap-3 min-w-0">
                {icon}
                <p className="text-xs sm:text-sm font-semibold tracking-wide leading-tight break-words">
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors shrink-0"
                aria-label="Dismiss toast"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
