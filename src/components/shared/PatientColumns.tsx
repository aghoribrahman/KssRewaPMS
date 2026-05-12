
import { Column } from './GenericTable';
import { Patient } from '../../types';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { MapPin, Clock, History, Cloud } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { formatTime, formatDate } from '../../lib/dateUtils';
import { getWaitSeverity, getSlaColor } from '../../lib/slaUtils';

/**
 * Shared column definitions for the PatientDirectory table.
 * Reduces duplication across role-specific dashboards.
 */
export const getSharedPatientColumns = (
  t: any, 
  onViewDetails: (p: Patient) => void,
  lang: 'en' | 'hi'
): Column<Patient>[] => [
  {
    header: t.fullName,
    accessor: (p) => (
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-xl bg-neutral-100 overflow-hidden flex items-center justify-center">
            {p.registrar_image_url ? (
              <img src={p.registrar_image_url} className="w-full h-full object-cover" />
            ) : (
              <span className="text-lg font-black text-neutral-400">{p.name.charAt(0)}</span>
            )}
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="font-bold text-neutral-900 text-sm">{p.name}</p>
            {(p as any).visit_count && (p as any).visit_count > 1 ? (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[9px] px-1.5 py-0 font-black flex items-center gap-1">
                <History className="w-2.5 h-2.5" />
                {lang === 'en' ? `Visit #${(p as any).visit_count}` : `विजिट #${(p as any).visit_count}`}
              </Badge>
            ) : null}
          </div>
          <p className="text-xs text-neutral-500">
            {p.age}y • {p.contact}
          </p>
        </div>
      </div>
    )
  },
  {
    header: t.district,
    accessor: (p) => (
      <Badge variant="outline" className="rounded-xl font-bold bg-neutral-50 border-neutral-100 text-neutral-600 px-3 py-1">
        <MapPin className="w-3 h-3 mr-1.5 opacity-50" />
        {p.district}
      </Badge>
    )
  },
  {
    header: t.status,
    accessor: (p) => p.is_offline_pending ? (
      <Badge variant="outline" className="bg-neutral-50 text-neutral-600 border-neutral-200 text-xs px-2.5 py-1 font-bold flex items-center gap-1.5 w-fit">
        <Cloud className="w-3.5 h-3.5 text-neutral-400" />
        {lang === 'en' ? "Pending Sync" : "सिंक लंबित"}
      </Badge>
    ) : (
      <StatusBadge status={p.status} />
    )
  },
  {
    header: t.timeAdded,
    accessor: (p) => {
      const severity = getWaitSeverity(p.created_at || new Date().toISOString());
      const slaColor = getSlaColor(severity);
      let slaText = '';
      if (severity === 'critical') slaText = lang === 'en' ? '>2h Wait' : '>2 घंटे प्रतीक्षा';
      else if (severity === 'warning') slaText = lang === 'en' ? '>1h Wait' : '>1 घंटा प्रतीक्षा';

      return (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-neutral-900 font-bold">
            <Clock className="w-3 h-3 text-neutral-400" />
            {formatTime(p.created_at)}
          </div>
          <div className="flex flex-wrap items-center gap-1 pl-4">
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">
              {formatDate(p.created_at)}
            </span>
            {severity !== 'normal' && p.status !== 'complete' && (
              <Badge variant="outline" className={`text-[9px] px-1.5 py-0 font-bold border ${slaColor}`}>
                {slaText}
              </Badge>
            )}
          </div>
        </div>
      );
    }
  },
  {
    header: t.actions,
    accessor: (p) => (
      <Button 
        variant="ghost" 
        size="sm" 
        className="rounded-xl font-bold text-xs hover:bg-primary/5 hover:text-primary transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          onViewDetails(p);
        }}
      >
        {t.viewDetails}
      </Button>
    )
  }
];
