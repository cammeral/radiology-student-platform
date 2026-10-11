import React from 'react';
import { Activity, Sparkles, CheckCircle2 } from 'lucide-react';

interface TelegramToastProps {
  show: boolean;
  message?: string;
}

export const TelegramToast: React.FC<TelegramToastProps> = ({
  show,
  message = 'تم حفظ الملاحظة الكتابية واضافتها الى التقويم',
}) => {
  if (!show) return null;

  return (
    <div className="fixed top-14 inset-x-0 z-50 flex justify-center pointer-events-none px-4 animate-classic">
      <div
        className="pointer-events-auto py-2.5 px-4 rounded-2xl bg-slate-900/95 dark:bg-slate-950/95 text-white border border-cyan-500/40 shadow-2xl shadow-cyan-950/50 text-xs font-bold transition-all duration-300 backdrop-blur-xl flex items-center gap-3"
        dir="rtl"
      >
        {/* Brand Emblem / Logo (شعار التطبيق) */}
        <div className="relative shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-cyan-500/30 border border-white/20">
            <Activity className="w-4 h-4 drop-shadow animate-pulse" />
          </div>
          <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-slate-950 border border-cyan-400 text-cyan-300 flex items-center justify-center">
            <Sparkles className="w-2 h-2 text-cyan-300" />
          </span>
        </div>

        {/* Message and Subtitle */}
        <div className="flex flex-col text-right">
          <div className="flex items-center gap-1.5 text-[10px] text-cyan-300 font-extrabold">
            <CheckCircle2 className="w-3 h-3 text-teal-400 shrink-0" />
            <span>راديو بلس • تقويم الطالب</span>
          </div>
          <span className="text-xs font-bold text-slate-100 tracking-tight leading-snug">
            {message}
          </span>
        </div>
      </div>
    </div>
  );
};
