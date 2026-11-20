import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Alert({ type = 'info', message, onClose }) {
  if (!message) return null;

  const styles = {
    success: {
      bg: 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    },
    error: {
      bg: 'bg-rose-950/60 border-rose-500/40 text-rose-200',
      icon: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    },
    warning: {
      bg: 'bg-amber-950/60 border-amber-500/40 text-amber-200',
      icon: <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />,
    },
    info: {
      bg: 'bg-cyan-950/60 border-cyan-500/40 text-cyan-200',
      icon: <Info className="w-5 h-5 text-cyan-400 shrink-0" />,
    },
  };

  const current = styles[type] || styles.info;

  return (
    <div
      className={`flex items-start justify-between p-4 rounded-xl border backdrop-blur-md shadow-lg transition-all animate-in fade-in slide-in-from-top-2 duration-300 ${current.bg}`}
    >
      <div className="flex items-center space-x-3">
        {current.icon}
        <span className="text-sm font-medium leading-relaxed">{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

