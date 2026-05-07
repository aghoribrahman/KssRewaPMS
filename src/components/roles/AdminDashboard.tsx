import * as React from 'react';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Patient } from '../../types';
import { usePatients } from '../../hooks/usePatients';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TRANSLATIONS } from '../../constants/mp_data';
import { Shield, ChevronRight, MapPin } from 'lucide-react';

import { DashboardLayout } from '../shared/DashboardLayout';
import { DashboardHeader } from '../shared/DashboardHeader';
import { StatGrid } from '../shared/StatGrid';
import { PatientDirectory } from '../shared/PatientDirectory';
import { PatientDetailsDialog } from '../shared/PatientDetailsDialog';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { Column } from '../shared/GenericTable';

export default function AdminDashboard() {
  const { profile } = useAuth();
  const { patients, loading, isOffline } = usePatients({ realtime: true });
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const lang = profile?.preferred_language || 'hi';
  const t = TRANSLATIONS[lang];

  const stats = useDashboardStats({ patients, role: 'admin', lang });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-green-100 text-green-700';
      case 'pending_meal': return 'bg-blue-100 text-blue-700';
      case 'pending_consultation': return 'bg-orange-100 text-orange-700';
      default: return 'bg-neutral-100 text-neutral-700';
    }
  };

  const columns: Column<Patient>[] = [
    {
      header: t.fullName,
      accessor: (p) => (
        <div>
          <p className="font-semibold text-neutral-900">{p.name}</p>
          <p className="text-xs text-neutral-500">{new Date(p.created_at).toLocaleDateString()}</p>
        </div>
      )
    },
    {
      header: t.district,
      accessor: (p) => (
        <Badge variant="outline" className="rounded-full font-medium border-neutral-200">
          {p.district}
        </Badge>
      )
    },
    {
      header: 'Status',
      accessor: (p) => (
        <Badge variant="secondary" className={`${getStatusColor(p.status)} rounded-full shadow-none border-none`}>
          {p.status.replace('_', ' ')}
        </Badge>
      )
    },
    {
      header: 'Progress',
      accessor: (p) => (
        <div className="flex gap-1">
          <div className={`w-3 h-3 rounded-full ${p.registrar_id ? 'bg-primary' : 'bg-neutral-200'}`} title="Registrar" />
          <div className={`w-3 h-3 rounded-full ${p.consultant_id ? 'bg-primary' : 'bg-neutral-200'}`} title="Consultant" />
          <div className={`w-3 h-3 rounded-full ${(p.meal_distributor_id || (p.status === 'complete' && p.meal_required === false)) ? 'bg-primary' : 'bg-neutral-200'}`} title="Meal" />
        </div>
      )
    },
    {
      header: 'Media',
      accessor: (p) => (
        <div className="flex -space-x-2">
          {p.registrar_image_url && <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-neutral-100 z-30 shadow-sm"><img src={p.registrar_image_url} className="w-full h-full object-cover" /></div>}
          {p.consultant_image_url && <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-neutral-100 z-20 shadow-sm"><img src={p.consultant_image_url} className="w-full h-full object-cover" /></div>}
          {p.meal_image_url && <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-neutral-100 z-10 shadow-sm"><img src={p.meal_image_url} className="w-full h-full object-cover" /></div>}
        </div>
      )
    },
    {
      header: t.actions,
      accessor: (p) => (
        <Button 
          variant="ghost" 
          size="sm" 
          className="rounded-full group-hover:bg-neutral-100 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedPatient(p);
          }}
        >
          {t.viewDetails} <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      )
    }
  ];

  return (
    <DashboardLayout>
      <DashboardHeader 
        title={lang === 'en' ? 'System Oversight' : 'प्रणाली निरीक्षण'}
        subtitle="Madhya Pradesh Patient Management Oversight • Live Data Feed"
        role="Admin"
        lang={lang}
        isOffline={isOffline}
        icon={Shield}
        actions={
          <Badge variant="outline" className="rounded-full px-4 py-1.5 border-neutral-200 bg-white shadow-sm flex gap-2 items-center font-bold">
            <div className={`w-2 h-2 rounded-full ${isOffline ? 'bg-amber-400' : 'bg-green-500 animate-pulse'}`} />
            {isOffline ? 'Sync Paused' : 'Live Analytics'}
          </Badge>
        }
      />

      <StatGrid stats={stats} />

      <PatientDirectory 
        patients={patients}
        columns={columns}
        onPatientSelect={setSelectedPatient}
        lang={lang}
        title={t.patientData}
        description="Comprehensive history of all patient interactions across districts."
      />

      <PatientDetailsDialog 
        patient={selectedPatient}
        onClose={() => setSelectedPatient(null)}
        lang={lang}
        subtitle={lang === 'en' ? "Full Administrative Record Audit" : "पूर्ण प्रशासनिक रिकॉर्ड ऑडिट"}
      />
    </DashboardLayout>
  );
}
