import React from 'react';
import { Bell, Droplets, Footprints, Accessibility } from 'lucide-react';

export default function RemindersSection({ reminders }) {
  if (!reminders || reminders.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'water': return <Droplets className="text-blue-400" size={18} />;
      case 'activity': return <Footprints className="text-emerald-400" size={18} />;
      case 'posture': return <Accessibility className="text-orange-400" size={18} />;
      default: return <Bell className="text-primary-400" size={18} />;
    }
  };

  return (
    <div className="mt-6 p-4 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex items-center gap-2 mb-3">
        <Bell size={16} className="text-primary-500 animate-bounce-subtle" />
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Health Reminders</span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {reminders.slice(0, 3).map((r, i) => (
          <div key={i} className="p-3 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-primary-500/30 transition-all group">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/5 group-hover:scale-110 transition-transform">
                {getIcon(r.type)}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200 leading-tight">{r.text}</p>
                <p className="text-[10px] text-slate-500 mt-1 uppercase font-medium">{r.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
