import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { ToastMessage } from '../../types';

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onDismiss();
      }, toast.duration || 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, onDismiss]);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-indigo-400 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
  };

  const borderColors = {
    success: 'border-emerald-500/30',
    error: 'border-rose-500/30',
    info: 'border-indigo-500/30',
    warning: 'border-amber-500/30'
  };

  const displayText = toast.title || toast.text || toast.description || '';

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounceIn max-w-md">
      <div
        className={`flex items-center gap-3 bg-[#12161f] border ${borderColors[toast.type]} shadow-2xl rounded-xl p-4 text-slate-100 backdrop-blur-lg`}
      >
        {icons[toast.type]}
        <div className="text-xs font-medium">{displayText}</div>
        <button
          onClick={onDismiss}
          className="ml-auto p-1 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
