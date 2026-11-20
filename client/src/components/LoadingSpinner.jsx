import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ size = 'md', message = 'Processing data with MongoDB...' }) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 space-y-3">
      <div className="relative">
        <Loader2 className={`${sizeClasses[size] || sizeClasses.md} text-cyan-400 animate-spin`} />
        <div className="absolute inset-0 blur-md bg-cyan-500/20 rounded-full animate-pulse -z-10" />
      </div>
      {message && <p className="text-slate-400 text-sm font-medium tracking-wide animate-pulse">{message}</p>}
    </div>
  );
}

