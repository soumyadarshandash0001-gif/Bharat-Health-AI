import React from 'react';
import { Bell, Droplets, Footprints, Monitor } from 'lucide-react';

export default function HealthReminders({ reminders }) {
  if (!reminders || reminders.length === 0) return null;

  const icons = {
    water: <Droplets size={16} className="text-blue-500" />,
    activity: <Footprints size={16} className="text-emerald-500" />,
    behavior: <Bell size={16} className="text-orange-500" />,
    default: <Monitor size={16} className="text-slate-500" />
  };

  return (
    <div className="mt-4 p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 animate-in fade-in slide-in-from-bottom-3 duration-700">
      <div className="flex items-center gap-2 mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
        <Bell size={12} fill="currentColor" />
        Health Reminders
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {reminders.slice(0, 3).map((r, i) => (
          <div key={i} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-1">
            <div className="flex items-center gap-2">
              {icons[r.type] || icons.default}
              <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                {r.text}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">
              {r.time || 'Next Scheduled'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
