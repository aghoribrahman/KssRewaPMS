
import { useState, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Patient } from '../../types';
import { usePatients } from '../../hooks/usePatients';
import { Eye, MapPin } from 'lucide-react';

import { DashboardLayout } from '../shared/DashboardLayout';
import { DashboardHeader } from '../shared/DashboardHeader';
import { StatGrid } from '../shared/StatGrid';
import { PatientDirectory } from '../shared/PatientDirectory';
import { PatientDetailsDialog } from '../shared/PatientDetailsDialog';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { useTranslation } from '../../hooks/useTranslation';
import { getSharedPatientColumns } from '../shared/PatientColumns';

export default function VisitorDashboard() {
  const { profile } = useAuth();
  const { lang, t } = useTranslation();
  const { patients, isOffline } = usePatients({ realtime: true });
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const stats = useDashboardStats({ patients, role: 'visitor', lang });

  const columns = useMemo(() => 
    getSharedPatientColumns(t, setSelectedPatient, lang), 
  [t, lang]);

  return (
    <DashboardLayout>
      <DashboardHeader 
        title={lang === 'en' ? "System Observer Dashboard" : "सिस्टम ऑब्जर्वर डैशबोर्ड"}
        subtitle={lang === 'en' ? "Read-only access to real-time patient metrics." : "रीअल-टाइम मरीज मेट्रिक्स तक केवल पढ़ने की पहुंच।"}
        role="Visitor"
        lang={lang}
        isOffline={isOffline}
        icon={Eye}
        actions={
          profile?.assigned_districts && profile.assigned_districts.length > 0 && (
            <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl border border-blue-100">
              <MapPin className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-tight">{t.myDistricts}: {profile.assigned_districts.join(', ')}</span>
            </div>
          )
        }
      />

      <StatGrid stats={stats} />

      <PatientDirectory 
        patients={patients}
        columns={columns}
        onPatientSelect={setSelectedPatient}
        lang={lang}
        title={t.patientDirectory}
        description={t.realtimeProgress}
      />

      <PatientDetailsDialog 
        patient={selectedPatient}
        onClose={() => setSelectedPatient(null)}
        lang={lang}
      />
    </DashboardLayout>
  );
}
