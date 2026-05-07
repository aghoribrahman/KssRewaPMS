import * as React from 'react';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Patient } from '../../types';
import { usePatients } from '../../hooks/usePatients';
import { Badge } from '@/components/ui/badge';
import { TRANSLATIONS } from '../../constants/mp_data';
import { Eye, MapPin } from 'lucide-react';

import { DashboardLayout } from '../shared/DashboardLayout';
import { DashboardHeader } from '../shared/DashboardHeader';
import { StatGrid } from '../shared/StatGrid';
import { PatientDirectory } from '../shared/PatientDirectory';
import { PatientDetailsDialog } from '../shared/PatientDetailsDialog';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { Column } from '../shared/GenericTable';

export default function VisitorDashboard() {
  const { profile } = useAuth();
  const { patients, isOffline } = usePatients({ realtime: true });
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const lang = profile?.preferred_language || 'hi';
  const t = TRANSLATIONS[lang];

  const stats = useDashboardStats({ patients, role: 'visitor', lang });

  const columns: Column<Patient>[] = [
    {
      header: 'Patient Name',
      accessor: (p) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-bold text-neutral-500 uppercase">
            {p.name.charAt(0)}
          </div>
          <span className="font-bold text-neutral-900">{p.name}</span>
        </div>
      )
    },
    {
      header: 'ABHA ID / Contact',
      accessor: (p) => (
        <div className="text-neutral-600 font-medium font-mono text-xs">
          <div>{p.abha_id ? p.abha_id.replace(/(.{2}).+(.{2})/, '$1XXXXXXXX$2') : 'NO ABHA ID'}</div>
          <div className="text-[10px] text-neutral-400 mt-0.5">{p.contact.replace(/(\d{2})\d+(\d{2})/, '$1XXXXXX$2')}</div>
        </div>
      )
    },
    {
      header: 'District',
      accessor: (p) => <span className="text-neutral-600 font-medium uppercase tracking-wider text-[10px]">{p.district}</span>
    },
    {
      header: 'Status',
      accessor: (p) => (
        <Badge variant="outline" className={`rounded-full px-3 py-1 font-bold text-[10px] uppercase tracking-widest ${
          p.status === 'complete' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
          p.status === 'pending_meal' ? 'bg-rose-50 text-rose-600 border-rose-100' :
          'bg-amber-50 text-amber-600 border-amber-100'
        }`}>
          {p.status.replace('_', ' ')}
        </Badge>
      )
    },
    {
      header: 'Action',
      accessor: (p) => (
        <Badge 
          variant="secondary" 
          className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-xl text-xs font-bold cursor-pointer hover:bg-neutral-200"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedPatient(p);
          }}
        >
          VIEW
        </Badge>
      )
    }
  ];

  const visitorStats = [
    { label: "Total Patients", value: patients.length, icon: Eye, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Pending Consult", value: patients.filter(p => p.status === 'pending_consultation').length, icon: Eye, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Pending Meal", value: patients.filter(p => p.status === 'pending_meal').length, icon: Eye, color: "text-rose-600", bg: "bg-rose-50" },
    { label: "Completed", value: patients.filter(p => p.status === 'complete').length, icon: Eye, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <DashboardLayout>
      <DashboardHeader 
        title="System Observer Dashboard"
        subtitle="Read-only access to real-time patient metrics and directory."
        role="Visitor"
        lang={lang}
        isOffline={isOffline}
        icon={Eye}
        actions={
          profile?.assigned_districts && profile.assigned_districts.length > 0 && (
            <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl border border-blue-100">
              <MapPin className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-tight">Scope: {profile.assigned_districts.join(', ')}</span>
            </div>
          )
        }
      />

      <StatGrid stats={visitorStats} />

      <PatientDirectory 
        patients={patients}
        columns={columns}
        onPatientSelect={setSelectedPatient}
        lang={lang}
        title="Patient Directory (Read-Only)"
        description="View real-time progress across Madhya Pradesh districts."
      />

      <PatientDetailsDialog 
        patient={selectedPatient}
        onClose={() => setSelectedPatient(null)}
        lang={lang}
      />
    </DashboardLayout>
  );
}
