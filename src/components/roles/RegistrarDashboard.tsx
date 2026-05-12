import * as React from 'react';
import { useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Patient } from '../../types';
import { usePatients } from '../../hooks/usePatients';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { PlusCircle, Search, ArrowLeft } from 'lucide-react';

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
import { usePatientLookup } from '../../hooks/usePatientLookup';
import { AutoFillDiff } from '../shared/AutoFillDiff';

interface RegistrarDashboardProps {
  onImmersiveChange?: (immersive: boolean) => void;
}

export default function RegistrarDashboard({ onImmersiveChange }: RegistrarDashboardProps) {
  const { profile } = useAuth();
  const { patients, isOffline, isSyncing, pendingCount } = usePatients({ limit: 50, realtime: true });
  const pendingConsultationPatients = useMemo(() => patients.filter(p => p.status !== 'needs_correction'), [patients]);
  const needsCorrectionPatients = useMemo(() => patients.filter(p => p.status === 'needs_correction'), [patients]);
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
  const [diffDismissedForId, setDiffDismissedForId] = React.useState<string | null>(null);

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

  const { match } = usePatientLookup(
    formData.contact || '', 
    formData.aadhar_number || '', 
    formData.abha_id || ''
  );

  const handleAcceptAllDiff = React.useCallback(() => {
    if (!match) return;
    toast.success(lang === 'en' ? "Master record loaded successfully" : "मास्टर रिकॉर्ड सफलतापूर्वक लोड किया गया");
    setFormData(prev => ({
      ...prev,
      name: match.name,
      age: match.age,
      gender: match.gender as any,
      district: match.district,
      block: match.block || '',
      village: match.village || '',
      address: match.address || '',
      abha_id: match.abha_id || '',
      aadhar_number: match.aadhar_number || '',
      sickle_cell_status: match.sickle_cell_status as any,
      pre_existing_diagnosis: match.pre_existing_diagnosis || false,
      date_of_diagnosis: match.date_of_diagnosis || undefined,
      master_patient_id: match.id
    }));
  }, [match, lang]);

  const handleDismissDiff = React.useCallback(() => {
    if (match) {
      setDiffDismissedForId(match.id);
    }
  }, [match]);

  const handleContactChange = React.useCallback((c: string) => {
    setFormData(prev => prev.contact === c ? prev : { ...prev, contact: c });
  }, []);

  const handleRegister = (data: any) => {
    registerPatient(data);
    toast.success(lang === 'en' ? "Registration queued!" : "पंजीकरण कतार में!");
    setIsRegistering(false);
    setDiffDismissedForId(null);
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
        <div className="space-y-8">
          <StatGrid stats={stats} />

          {needsCorrectionPatients.length > 0 && (
            <div className="bg-orange-50/50 border border-orange-100 rounded-3xl p-4 md:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-orange-950">
                    {lang === 'en' ? "Returned for Correction" : "सुधार के लिए वापस किए गए"}
                  </h3>
                  <p className="text-xs text-orange-700">
                    {lang === 'en' 
                      ? "These records require updates before the consultant can review them." 
                      : "परामर्शदाता द्वारा समीक्षा करने से पहले इन रिकॉर्ड्स में अपडेट की आवश्यकता है।"}
                  </p>
                </div>
                <span className="bg-orange-500 text-white text-xs font-black px-3 py-1 rounded-full">
                  {needsCorrectionPatients.length}
                </span>
              </div>
              <PatientDirectory 
                patients={needsCorrectionPatients}
                columns={columns}
                onPatientSelect={setSelectedPatient}
                lang={lang}
                title=""
                description=""
              />
            </div>
          )}

          <PatientDirectory 
            patients={pendingConsultationPatients}
            columns={columns}
            onPatientSelect={setSelectedPatient}
            lang={lang}
            title={t.patientDirectory}
            description={lang === 'en' ? "Manage and track recently registered patients." : "हाल ही में पंजीकृत मरीजों का प्रबंधन करें।"}
          />
        </div>
      ) : (
        <div className="animate-in fade-in duration-200 space-y-4">
          <Button variant="ghost" onClick={() => setIsRegistering(false)} className="group rounded-xl hover:bg-neutral-100 -ml-2">
            <ArrowLeft className="w-4 h-4 mr-2 text-neutral-400 group-hover:text-neutral-900 group-hover:-translate-x-1 transition-all" />
            <span className="text-xs font-bold text-neutral-500 group-hover:text-neutral-900 uppercase tracking-widest">
              {t.backToDirectory}
            </span>
          </Button>

          {match && match.id !== diffDismissedForId && formData.master_patient_id !== match.id && (
            <AutoFillDiff 
              existingRecord={match}
              lang={lang}
              onAcceptAll={handleAcceptAllDiff}
              onDismiss={handleDismissDiff}
            />
          )}

          <CounsellingForm
            data={formData}
            onContactChange={handleContactChange}
            onSubmit={handleRegister}
            onCancel={() => setIsRegistering(false)}
            submitLabel={t.confirmRegistration}
            cancelLabel={t.cancel}
            hiddenFields={['counselling']}
          />
        </div>
      )}

      <PatientDetailsDialog 
        patient={selectedPatient}
        onClose={closeDialog}
        lang={lang}
        readOnly={selectedPatient?.status !== 'needs_correction'}
        disabledFields={['abha_id', 'aadhar_number']}
        onFormSubmit={(data) => {
          handleUpdatePatient({ ...data, status: 'pending_consultation' });
          closeDialog();
        }}
        subtitle={selectedPatient?.status === 'needs_correction' ? (lang === 'en' ? "Correction Required" : "सुधार आवश्यक") : undefined}
        actionTabTitle={selectedPatient?.status === 'needs_correction' ? (lang === 'en' ? "Consultant Feedback" : "परामर्शदाता की प्रतिक्रिया") : undefined}
        actionContent={
          selectedPatient?.status === 'needs_correction' ? (
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-2xl space-y-2">
              <p className="text-xs font-bold text-orange-800 uppercase tracking-wider">
                {lang === 'en' ? "Reason for Rejection / Return" : "अस्वीकृति / वापसी का कारण"}
              </p>
              <p className="text-sm text-orange-900 font-medium whitespace-pre-wrap">
                {selectedPatient.consultant_advice || (lang === 'en' ? "No specific notes provided." : "कोई विशिष्ट नोट्स प्रदान नहीं किए गए।")}
              </p>
            </div>
          ) : undefined
        }
      />
    </DashboardLayout>
  );
}

