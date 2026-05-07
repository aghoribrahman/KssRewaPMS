import * as React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Patient } from '../../types';
import { usePatients } from '../../hooks/usePatients';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { TRANSLATIONS } from '../../constants/mp_data';
import { PlusCircle, Search, Clock, MapPin, Activity, ArrowLeft, History } from 'lucide-react';

import { CounsellingForm } from '../CounsellingForm';
import { DashboardLayout } from '../shared/DashboardLayout';
import { DashboardHeader } from '../shared/DashboardHeader';
import { StatGrid } from '../shared/StatGrid';
import { PatientDirectory } from '../shared/PatientDirectory';
import { PatientDetailsDialog } from '../shared/PatientDetailsDialog';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { usePatientActions } from '../../hooks/usePatientActions';
import { Column } from '../shared/GenericTable';

interface RegistrarDashboardProps {
  onImmersiveChange?: (immersive: boolean) => void;
}

export default function RegistrarDashboard({ onImmersiveChange }: RegistrarDashboardProps) {
  const { profile } = useAuth();
  const { patients, isOffline, isSyncing, pendingCount } = usePatients({ limit: 50, realtime: true });
  const { registerPatient } = usePatientActions();
  
  const [isRegistering, setIsRegistering] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [autoFillSuggested, setAutoFillSuggested] = useState(false);

  const lang = profile?.preferred_language || 'hi';
  const t = TRANSLATIONS[lang];

  const stats = useDashboardStats({ patients, role: 'registrar', lang });

  useEffect(() => {
    if (onImmersiveChange) {
      onImmersiveChange(isRegistering);
    }
  }, [isRegistering, onImmersiveChange]);

  const [formData, setFormData] = useState<Partial<Patient>>({
    name: '', age: 0, contact: '',
    district: profile?.assigned_districts?.[0] || '',
    status: 'pending_consultation', gender: 'male',
    address: '', block: '', village: '',
    sickle_cell_status: 'AS', pre_existing_diagnosis: false,
    reports_attached: false, symptoms: [],
    medication_hydroxyurea: false, medication_folic_acid: false,
    counselling_topics: [], nutrition_kit_distributed: false,
    meal_required: true, referral: [],
  });

  // Auto-fill logic
  useEffect(() => {
    if (formData.contact?.length === 10 && !autoFillSuggested) {
      const existingPatient = patients.find(p => p.contact === formData.contact);
      if (existingPatient) {
        const masterId = existingPatient.master_patient_id || existingPatient.id;
        toast.info(lang === 'en' ? `Returning patient found!` : `पुराना मरीज मिला!`);
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
          master_patient_id: masterId
        }));
        setAutoFillSuggested(true);
      }
    }
    if (formData.contact && formData.contact.length < 5) {
      setAutoFillSuggested(false);
    }
  }, [formData.contact, patients, autoFillSuggested, lang]);

  const handleRegister = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!formData.name || !formData.district || !formData.age || !formData.contact || !formData.sickle_cell_status) {
      toast.error(lang === 'en' ? "Please fill all required fields" : "कृपया सभी आवश्यक फ़ील्ड भरें");
      return;
    }
    if (formData.contact && !/^\d{10}$/.test(formData.contact)) {
      toast.error(lang === 'en' ? "Invalid contact number" : "अमान्य संपर्क नंबर");
      return;
    }

    registerPatient(formData);
    toast.success(lang === 'en' ? "Registration queued!" : "पंजीकरण कतार में!");
    setIsRegistering(false);
    setFormData({
      name: '', age: 0, contact: '',
      district: profile?.assigned_districts?.[0] || '',
      status: 'pending_consultation', gender: 'male',
      address: '', block: '', village: '',
      sickle_cell_status: 'AS', pre_existing_diagnosis: false,
      reports_attached: false, symptoms: [],
      medication_hydroxyurea: false, medication_folic_acid: false,
      counselling_topics: [], nutrition_kit_distributed: false,
      meal_required: true, referral: [],
    });
    setAutoFillSuggested(false);
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return lang === 'en' ? 'Good Morning' : 'शुभ प्रभात';
    if (hour < 17) return lang === 'en' ? 'Good Afternoon' : 'शुभ दोपहर';
    return lang === 'en' ? 'Good Evening' : 'शुभ संध्या';
  };

  const columns: Column<Patient>[] = [
    {
      header: t.fullName,
      accessor: (p) => (
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-neutral-100 overflow-hidden flex items-center justify-center transition-transform">
              {p.registrar_image_url ? (
                <img src={p.registrar_image_url} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center">
                  <span className="text-xl font-black text-neutral-400">{p.name.charAt(0)}</span>
                </div>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border-2 border-white flex items-center justify-center">
              <div className={`w-2 h-2 rounded-full ${p.status === 'complete' ? 'bg-emerald-500' : 'bg-orange-500'}`} />
            </div>
          </div>
          <div>
            <p className="font-bold text-neutral-900 text-sm group-hover:text-primary transition-colors">{p.name}</p>
            <p className="text-xs text-neutral-500 font-medium flex items-center gap-2">
              {p.age} years • <span className="text-neutral-400">{p.contact}</span>
            </p>
          </div>
        </div>
      )
    },
    {
      header: t.district,
      accessor: (p) => (
        <Badge variant="outline" className="rounded-xl font-bold bg-neutral-50 border-neutral-100 text-neutral-600 px-3 py-1.5">
          <MapPin className="w-3 h-3 mr-1.5 opacity-50" />
          {p.district}
        </Badge>
      )
    },
    {
      header: t.status,
      accessor: (p) => (
        <Badge
          className={`rounded-xl px-4 py-2 border-none font-bold text-xs uppercase tracking-wider ${
            p.status === 'pending_consultation' ? 'bg-orange-100 text-orange-600' :
            p.status === 'pending_meal' ? 'bg-blue-100 text-blue-600' :
            'bg-emerald-100 text-emerald-600'
          }`}
        >
          {p.status.replace('_', ' ')}
        </Badge>
      )
    },
    {
      header: t.timeAdded,
      accessor: (p) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-neutral-900 font-bold">
            <Clock className="w-4 h-4 text-neutral-400" />
            {new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest pl-5">
            {new Date(p.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
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
          className="rounded-xl font-bold text-xs hover:bg-primary/5 hover:text-primary transition-colors px-4"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedPatient(p);
          }}
        >
          {t.viewDetails}
        </Button>
      )
    }
  ];

  return (
    <DashboardLayout isImmersive={isRegistering}>
      <DashboardHeader 
        title={`${getTimeGreeting()}, ${profile?.display_name || (lang === 'en' ? 'Registrar' : 'पंजीकार')}`}
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
              <><Search className="w-5 h-5" />{lang === 'en' ? "View Registrations" : "पंजीकरण देखें"}</>
            ) : (
              <><PlusCircle className="w-5 h-5" />{lang === 'en' ? "New Patient Registration" : "नया मरीज पंजीकरण"}</>
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
            title={lang === 'en' ? "Patient Directory" : "मरीज निर्देशिका"}
            description={lang === 'en' ? "Manage and track recently registered patients." : "हाल ही में पंजीकृत मरीजों का प्रबंधन करें।"}
          />
        </>
      ) : (
        <div className="animate-in fade-in duration-500 space-y-4">
          <Button variant="ghost" onClick={() => setIsRegistering(false)} className="group rounded-xl hover:bg-neutral-100 -ml-2">
            <ArrowLeft className="w-4 h-4 mr-2 text-neutral-400 group-hover:text-neutral-900 group-hover:-translate-x-1 transition-all" />
            <span className="text-xs font-bold text-neutral-500 group-hover:text-neutral-900 uppercase tracking-widest">
              {lang === 'en' ? 'Back to Directory' : 'निर्देशिका पर वापस जाएं'}
            </span>
          </Button>

          {autoFillSuggested && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl flex items-center gap-3">
              <History className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-bold text-sm">{lang === 'en' ? 'Returning Patient' : 'पुराना मरीज'}</p>
                <p className="text-xs">{lang === 'en' ? 'Historical data loaded.' : 'पिछला डेटा लोड किया गया।'}</p>
              </div>
            </div>
          )}

          <CounsellingForm
            data={formData}
            onChange={setFormData}
            onSubmit={handleRegister}
            onCancel={() => setIsRegistering(false)}
            submitLabel={t.confirmRegistration}
            cancelLabel={lang === 'en' ? 'Cancel' : 'रद्द करें'}
          />
        </div>
      )}

      <PatientDetailsDialog 
        patient={selectedPatient}
        onClose={() => setSelectedPatient(null)}
        lang={lang}
      />
    </DashboardLayout>
  );
}
