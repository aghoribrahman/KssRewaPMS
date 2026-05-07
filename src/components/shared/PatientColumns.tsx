import * as React from 'react';
import { Column } from './GenericTable';
import { Patient } from '../../types';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { MapPin, Clock } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { formatTime, formatDate } from '../../lib/dateUtils';

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
        <div>
          <p className="font-bold text-neutral-900 text-sm">{p.name}</p>
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
    accessor: (p) => <StatusBadge status={p.status} />
  },
  {
    header: t.timeAdded,
    accessor: (p) => (
      <div className="space-y-0.5">
        <div className="flex items-center gap-1.5 text-xs text-neutral-900 font-bold">
          <Clock className="w-3 h-3 text-neutral-400" />
          {formatTime(p.created_at)}
        </div>
        <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest pl-4">
          {formatDate(p.created_at)}
        </div>
      </div>
    )
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
