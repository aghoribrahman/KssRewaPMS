import * as React from 'react';
import { useState, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Patient } from '../../types';
import { usePatients } from '../../hooks/usePatients';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, ChevronRight } from 'lucide-react';

import { DashboardLayout } from '../shared/DashboardLayout';
import { DashboardHeader } from '../shared/DashboardHeader';
import { StatGrid } from '../shared/StatGrid';
import { PatientDirectory } from '../shared/PatientDirectory';
import { PatientDetailsDialog } from '../shared/PatientDetailsDialog';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { usePatientActions } from '../../hooks/usePatientActions';
import { toast } from 'sonner';
import { Column } from '../shared/GenericTable';
import { useTranslation } from '../../hooks/useTranslation';
import { StatusBadge } from '../shared/StatusBadge';
import { formatDate } from '../../lib/dateUtils';

export default function AdminDashboard() {
  const { profile } = useAuth();
  const { lang, t } = useTranslation();
  const { patients, isOffline } = usePatients({ realtime: true });
  const { updatePatientRecord } = usePatientActions();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const stats = useDashboardStats({ patients, role: 'admin', lang });

  const handleUpdatePatient = async (data: any) => {
    if (!selectedPatient) return;
    try {
      updatePatientRecord(selectedPatient.id, data);
      toast.success(lang === 'en' ? "Record updated by Admin" : "प्रशासक द्वारा रिकॉर्ड अपडेट किया गया");
      setSelectedPatient(prev => prev ? { ...prev, ...data } : null);
    } catch (error) {
      toast.error("Failed to update");
    }
  };

  const columns: Column<Patient>[] = useMemo(() => [
    {
      header: t.fullName,
      accessor: (p) => (
        <div>
          <p className="font-semibold text-neutral-900">{p.name}</p>
          <p className="text-xs text-neutral-500">{formatDate(p.created_at)}</p>
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
      accessor: (p) => <StatusBadge status={p.status} />
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
  ], [t]);

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
        description={lang === 'en' ? "Comprehensive history of all patient interactions." : "सभी मरीज बातचीत का व्यापक इतिहास।"}
      />

      <PatientDetailsDialog 
        patient={selectedPatient}
        onClose={() => setSelectedPatient(null)}
        lang={lang}
        readOnly={false}
        onFormSubmit={handleUpdatePatient}
        subtitle={lang === 'en' ? "Full Administrative Record Audit" : "पूर्ण प्रशासनिक रिकॉर्ड ऑडिट"}
      />
    </DashboardLayout>
  );
}
