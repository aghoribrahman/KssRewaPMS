import * as React from 'react';
import { useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Patient } from '../../types';
import { usePatients } from '../../hooks/usePatients';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { PlusCircle, Search, ArrowLeft, History } from 'lucide-react';

import { CounsellingForm } from '../CounsellingForm';
import { DashboardLayout } from '../shared/DashboardLayout';
import { DashboardHeader } from '../shared/DashboardHeader';
import { StatGrid } from '../shared/StatGrid';
import { PatientDirectory } from '../shared/PatientDirectory';
import { PatientDetailsDialog } from '../shared/PatientDetailsDialog';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { usePatientActions } from '../../hooks/usePatientActions';
import { getTimeGreeting } from '../../lib/dateUtils';
import { getSharedPatientColumns } from '../shared/PatientColumns';
import { useDashboardHelper } from '../../hooks/useDashboardHelper';

interface RegistrarDashboardProps {
  onImmersiveChange?: (immersive: boolean) => void;
}

export default function RegistrarDashboard({ onImmersiveChange }: RegistrarDashboardProps) {
  const { profile } = useAuth();
  const { patients, isOffline, isSyncing, pendingCount } = usePatients({ limit: 50, realtime: true });
  const { registerPatient } = usePatientActions();
  
  const {
    selectedPatient,
    setSelectedPatient,
    handleUpdatePatient,
    closeDialog,
    lang,
    t
  } = useDashboardHelper();

  const [isRegistering, setIsRegistering] = React.useState(false);
  const [autoFillSuggested, setAutoFillSuggested] = React.useState(false);

  const stats = useDashboardStats({ patients, role: 'registrar', lang });

  useEffect(() => {
    onImmersiveChange?.(isRegistering);
  }, [isRegistering, onImmersiveChange]);

  const initialFormData: Partial<Patient> = {
    name: '', age: 0, contact: '',
    district: profile?.assigned_districts?.[0] || '',
    status: 'pending_consultation', gender: 'male',
    address: '', block: '', village: '',
    sickle_cell_status: 'AS', pre_existing_diagnosis: false,
    reports_attached: false, symptoms: [],
    medication_hydroxyurea: false, medication_folic_acid: false,
    counselling_topics: [], nutrition_kit_distributed: false,
    meal_required: true, referral: [],
    previous_hospitalizations: false,
  };

  const [formData, setFormData] = React.useState<Partial<Patient>>(initialFormData);

  // Auto-fill logic
  useEffect(() => {
    if (formData.contact?.length === 10 && !autoFillSuggested) {
      const existingPatient = patients.find(p => p.contact === formData.contact);
      if (existingPatient) {
        const masterId = existingPatient.master_patient_id || existingPatient.id;
        toast.info(t.returningPatientFound);
        setFormData(prev => ({
          ...prev,
          name: existingPatient.name,
          age: existingPatient.age,
          gender: existingPatient.gender,
          district: existingPatient.district,
          block: existingPatient.block || '',
          village: existingPatient.village || '',
          address: existingPatient.address || '',
          abha_id: existingPatient.abha_id || '',
          aadhar_number: existingPatient.aadhar_number || '',
          sickle_cell_status: existingPatient.sickle_cell_status,
          previous_hospitalizations: existingPatient.previous_hospitalizations || false,
          master_patient_id: masterId
        }));
        setAutoFillSuggested(true);
      }
    }
    if (formData.contact && formData.contact.length < 5) {
      setAutoFillSuggested(false);
    }
  }, [formData.contact, patients, autoFillSuggested, t]);

  const handleContactChange = React.useCallback((c: string) => {
    setFormData(prev => prev.contact === c ? prev : { ...prev, contact: c });
  }, []);

  const handleRegister = (data: any) => {
    registerPatient(data);
    toast.success(lang === 'en' ? "Registration queued!" : "पंजीकरण कतार में!");
    setIsRegistering(false);
    setAutoFillSuggested(false);
    setFormData(initialFormData);
  };

  const columns = useMemo(() => 
    getSharedPatientColumns(t, setSelectedPatient, lang), 
  [t, lang, setSelectedPatient]);

  return (
    <DashboardLayout isImmersive={isRegistering}>
      <DashboardHeader 
        title={`${getTimeGreeting(lang)}, ${profile?.display_name || (lang === 'en' ? 'Registrar' : 'पंजीकार')}`}
        role={profile?.role || ''}
        lang={lang}
        isOffline={isOffline}
        isSyncing={isSyncing}
        pendingCount={pendingCount}
        actions={
          <Button
            onClick={() => setIsRegistering(!isRegistering)}
            className={`rounded-2xl gap-3 h-12 px-6 text-sm font-bold transition-all duration-300 shadow-2xl ${isRegistering
              ? 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
              : 'bg-primary text-white hover:scale-105 shadow-primary/30'
              }`}
          >
            {isRegistering ? (
              <><Search className="w-5 h-5" />{t.viewRegistrations}</>
            ) : (
              <><PlusCircle className="w-5 h-5" />{t.newRegistration}</>
            )}
          </Button>
        }
      />

      {!isRegistering ? (
        <>
          <StatGrid stats={stats} />
          <PatientDirectory 
            patients={patients}
            columns={columns}
            onPatientSelect={setSelectedPatient}
            lang={lang}
            title={t.patientDirectory}
            description={lang === 'en' ? "Manage and track recently registered patients." : "हाल ही में पंजीकृत मरीजों का प्रबंधन करें।"}
          />
        </>
      ) : (
        <div className="animate-in fade-in duration-200 space-y-4">
          <Button variant="ghost" onClick={() => setIsRegistering(false)} className="group rounded-xl hover:bg-neutral-100 -ml-2">
            <ArrowLeft className="w-4 h-4 mr-2 text-neutral-400 group-hover:text-neutral-900 group-hover:-translate-x-1 transition-all" />
            <span className="text-xs font-bold text-neutral-500 group-hover:text-neutral-900 uppercase tracking-widest">
              {t.backToDirectory}
            </span>
          </Button>

          {autoFillSuggested && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl flex items-center gap-3">
              <History className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-bold text-sm">{t.returningPatient}</p>
                <p className="text-xs">{t.historicalDataLoaded}</p>
              </div>
            </div>
          )}

          <CounsellingForm
            data={formData}
            onContactChange={handleContactChange}
            onSubmit={handleRegister}
            onCancel={() => setIsRegistering(false)}
            submitLabel={t.confirmRegistration}
            cancelLabel={t.cancel}
          />
        </div>
      )}

      <PatientDetailsDialog 
        patient={selectedPatient}
        onClose={closeDialog}
        lang={lang}
        readOnly={false}
        onFormSubmit={handleUpdatePatient}
      />
    </DashboardLayout>
  );
}

