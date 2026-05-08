import * as React from 'react';
import { Activity, WifiOff, LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  role: string;
  lang: 'en' | 'hi';
  isOffline?: boolean;
  isSyncing?: boolean;
  pendingCount?: number;
  icon?: LucideIcon;
  actions?: React.ReactNode;
}

export function DashboardHeader({
  title,
  subtitle,
  role,
  lang,
  isOffline,
  isSyncing,
  pendingCount,
  icon: Icon = Activity,
  actions,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
      <div className="space-y-0.5">
        <div className="flex items-center gap-2 text-primary font-bold text-[11px] uppercase tracking-[0.2em]">
          <Icon className="w-3.5 h-3.5" />
          {role} {lang === 'en' ? 'Dashboard' : 'डैशबोर्ड'}
        </div>
        <h2 className="font-black text-neutral-900 tracking-tight leading-tight text-2xl md:text-3xl">
          {title}
        </h2>
        {subtitle && <p className="text-neutral-500 text-sm font-medium">{subtitle}</p>}
        
        {isSyncing && (
          <Badge variant="outline" className="rounded-full px-3 py-1 bg-blue-50 text-blue-600 animate-pulse border-blue-100 flex gap-2 items-center w-fit mt-2">
            <Activity className="w-3 h-3" />
            Syncing {pendingCount} records...
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-3">
        {isOffline && (
          <Badge variant="outline" className="rounded-full px-4 py-1.5 border-rose-200 bg-rose-50 text-rose-600 shadow-sm flex gap-2 items-center font-bold">
            <WifiOff className="w-4 h-4" />
            OFFLINE MODE
          </Badge>
        )}
        {actions}
      </div>
    </div>
  );
}
