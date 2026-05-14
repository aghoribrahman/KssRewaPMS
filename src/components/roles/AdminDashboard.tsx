import { useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { usePatients } from '../../hooks/usePatients';
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';

import { DashboardLayout } from '../shared/DashboardLayout';
import { DashboardHeader } from '../shared/DashboardHeader';
import { StatGrid } from '../shared/StatGrid';
import { PatientDirectory } from '../shared/PatientDirectory';
import { PatientDetailsDialog } from '../shared/PatientDetailsDialog';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { getSharedPatientColumns } from '../shared/PatientColumns';
import { useDashboardHelper } from '../../hooks/useDashboardHelper';
import { GlobalErrorBoundary } from '../shared/GlobalErrorBoundary';

export default function AdminDashboard() {
  useAuth();
  const { patients, isOffline } = usePatients({ realtime: true });
  
  const {
    selectedPatient,
    setSelectedPatient,
    handleUpdatePatient,
    closeDialog,
    lang,
    t
  } = useDashboardHelper();

  const stats = useDashboardStats({ patients, role: 'admin', lang });

  const columns = useMemo(() => 
    getSharedPatientColumns(t, setSelectedPatient, lang),
    [t, lang, setSelectedPatient]
  );

  return (
    <DashboardLayout>
      <DashboardHeader 
        title={t.systemOversight}
        subtitle="Madhya Pradesh Patient Management Oversight • Live Data Feed"
        role="Admin"
        lang={lang}
        isOffline={isOffline}
        icon={Shield}
        actions={
          <Badge variant="outline" className="rounded-full px-4 py-1.5 border-neutral-200 bg-white shadow-sm flex gap-2 items-center font-bold">
            <div className={`w-2 h-2 rounded-full ${isOffline ? 'bg-amber-400' : 'bg-green-500'}`} />
            {isOffline ? t.syncPaused : t.liveAnalytics}
          </Badge>
        }
      />

      <GlobalErrorBoundary variant="inline" name="Admin Analytics Stats">
        <StatGrid stats={stats} />
      </GlobalErrorBoundary>

      <GlobalErrorBoundary variant="card" name="Admin Patient Database">
        <PatientDirectory 
          patients={patients}
          columns={columns}
          onPatientSelect={setSelectedPatient}
          lang={lang}
          title={t.patientData}
          description={t.patientHistory}
        />
      </GlobalErrorBoundary>

      <PatientDetailsDialog 
        patient={selectedPatient}
        onClose={closeDialog}
        lang={lang}
        readOnly={false}
        onFormSubmit={handleUpdatePatient}
        subtitle={t.fullAdminAudit}
      />
    </DashboardLayout>
  );
}

