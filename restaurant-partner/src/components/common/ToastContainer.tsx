import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        const getIcon = () => {
          switch (toast.type) {
            case 'success':
              return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
            case 'error':
              return <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />;
            case 'warning':
              return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
            default:
              return <Info className="w-5 h-5 text-blue-500 shrink-0" />;
          }
        };

        const getBorder = () => {
          switch (toast.type) {
            case 'success':
              return 'border-emerald-200 bg-white/95 text-slate-800 shadow-lg shadow-emerald-500/10';
            case 'error':
              return 'border-rose-200 bg-white/95 text-slate-800 shadow-lg shadow-rose-500/10';
            case 'warning':
              return 'border-amber-200 bg-white/95 text-slate-800 shadow-lg shadow-amber-500/10';
            default:
              return 'border-blue-200 bg-white/95 text-slate-800 shadow-lg shadow-blue-500/10';
          }
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md transition-all duration-300 transform translate-y-0 opacity-100 ${getBorder()}`}
          >
            {getIcon()}
            <p className="text-sm font-medium leading-tight flex-1">{toast.message}</p>
          </div>
        );
      })}
    </div>
  );
};
