export type SlaSeverity = 'normal' | 'warning' | 'critical';

export function getWaitSeverity(createdAt: string): SlaSeverity {
  const minutes = (Date.now() - new Date(createdAt).getTime()) / 60000;
  if (minutes > 120) return 'critical';
  if (minutes > 60) return 'warning';
  return 'normal';
}

export function getSlaColor(severity: SlaSeverity): string {
  switch (severity) {
    case 'critical': 
      return 'bg-red-50 text-red-700 border-red-200 animate-pulse';
    case 'warning': 
      return 'bg-amber-50 text-amber-700 border-amber-200';
    default: 
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }
}
