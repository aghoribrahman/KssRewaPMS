import * as React from 'react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Patient } from '../types';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Activity, 
  History, 
  Stethoscope, 
  Pill, 
  Droplet, 
  BookOpen, 
  Package, 
  MapPin,
  ClipboardCheck,
  AlertCircle,
  Utensils,
  UserCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TRANSLATIONS } from '../constants/mp_data';


interface PatientSummaryProps {
  patient: Patient;
  className?: string;
}

export function PatientSummary({ patient, className }: PatientSummaryProps) {
  const { profile } = useAuth();
  if (!patient) return null;

  const isVisitor = profile?.role === 'visitor';

  const maskValue = (val: string | undefined, type: 'contact' | 'id') => {
    if (!val || !isVisitor) return val || 'N/A';
    if (type === 'contact') return val.replace(/(\d{2})\d+(\d{2})/, '$1XXXXXX$2');
    return val.replace(/(.{2}).+(.{2})/, '$1XXXXXXXX$2');
  };

  const lang = profile?.preferred_language || 'hi';
  const t = TRANSLATIONS[lang];

  const sections = [
    {
      title: t.fullName,
      icon: User,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
      fields: [
        { label: t.fullName, value: patient.name },
        { label: t.age, value: `${patient.age} ${lang === 'en' ? 'years' : 'साल'}` },
        { label: t.gender, value: patient.gender === 'male' ? (lang === 'en' ? 'Male' : 'पुरुष') : (lang === 'en' ? 'Female' : 'महिला') },
        { label: t.contact, value: maskValue(patient.contact, 'contact') },
        { label: t.abhaId, value: maskValue(patient.abha_id || patient.aadhar_number, 'id') },
      ]
    },
    {
      title: t.district,
      icon: MapPin,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
      fields: [
        { label: t.district, value: patient.district },
        { label: t.block, value: patient.block || 'N/A' },
        { label: t.village, value: patient.village || 'N/A' },
      ]
    },
    {
      title: t.status,
      icon: Activity,
      color: 'text-rose-500',
      bg: 'bg-rose-50',
      fields: [
        { 
          label: t.status, 
          value: <Badge className={cn(
            patient.sickle_cell_status === 'SS' ? 'bg-rose-500' : 
            patient.sickle_cell_status === 'AS' ? 'bg-orange-500' : 'bg-emerald-500'
          )}>{patient.sickle_cell_status}</Badge> 
        },
        { label: t.medicalHistory, value: patient.pre_existing_diagnosis ? (lang === 'en' ? `Yes (${patient.date_of_diagnosis})` : `हाँ (${patient.date_of_diagnosis})`) : (lang === 'en' ? 'No' : 'नहीं') },
      ]
    },
    {
      title: t.medicalHistory,
      icon: History,
      color: 'text-purple-500',
      bg: 'bg-purple-50',
      fields: [
        { label: t.presentSymptoms, value: patient.first_symptom_onset || 'N/A' },
        { label: 'Transfusions', value: patient.blood_transfusions_count },
        { label: 'Other Issues', value: patient.other_health_issues || 'None' },
      ]
    }
  ];


  const hasHighRiskSymptoms = patient.symptoms?.includes('Difficulty Breathing') || 
                            patient.symptoms?.includes('Yellowish Discoloration of Eyes/Skin');

  return (
    <div className={cn("space-y-6", className)}>
      {hasHighRiskSymptoms && (
        <Card className="border-rose-200 bg-rose-50/50">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <p className="text-sm font-semibold text-rose-700">
              Critical Symptoms Reported: {patient.symptoms?.filter(s => ['Difficulty Breathing', 'Yellowish Discoloration of Eyes/Skin'].includes(s)).join(', ')}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section) => (
          <Card key={section.title} className="overflow-hidden border-neutral-100 shadow-sm">
            <div className={cn("px-4 py-3 border-b flex items-center gap-2", section.bg)}>
              <section.icon className={cn("w-4 h-4", section.color)} />
              <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wider">{section.title}</h3>
            </div>
            <CardContent className="p-4 space-y-3">
              {section.fields.map((field, idx) => (
                <div key={idx} className="flex justify-between items-start text-sm">
                  <span className="text-neutral-500">{field.label}:</span>
                  <span className="font-semibold text-neutral-900 text-right ml-4">{field.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Medication Summary */}
        <Card className="border-neutral-100 shadow-sm">
          <div className="px-4 py-3 border-b bg-amber-50 flex items-center gap-2">
            <Pill className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wider">Medication</h3>
          </div>
          <CardContent className="p-4 space-y-2 text-sm">
            {patient.medication_hydroxyurea && <div><Badge variant="outline" className="mr-2">Hydroxyurea</Badge> {patient.dosage_hydroxyurea}</div>}
            {patient.medication_folic_acid && <div><Badge variant="outline" className="mr-2">Folic Acid</Badge> {patient.dosage_folic_acid}</div>}
            {!patient.medication_hydroxyurea && !patient.medication_folic_acid && <p className="text-neutral-400 italic">No specific meds</p>}
          </CardContent>
        </Card>

        {/* Symptoms */}
        <Card className="border-neutral-100 shadow-sm">
          <div className="px-4 py-3 border-b bg-neutral-50 flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-neutral-500" />
            <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wider">Symptoms</h3>
          </div>
          <CardContent className="p-4 flex flex-wrap gap-1.5">
            {patient.symptoms?.map(s => (
              <Badge key={s} variant="secondary" className="text-[10px] uppercase font-bold">{s}</Badge>
            ))}
            {patient.symptoms?.length === 0 && <p className="text-neutral-400 italic text-sm">No symptoms</p>}
          </CardContent>
        </Card>

        {/* Counselling Topics */}
        <Card className="border-neutral-100 shadow-sm">
          <div className="px-4 py-3 border-b bg-sky-50 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-sky-500" />
            <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wider">Counselling</h3>
          </div>
          <CardContent className="p-4 text-xs font-medium text-neutral-600 line-clamp-3">
             {patient.counselling_topics?.length || 0} topics discussed
          </CardContent>
        </Card>
      </div>

      {/* Nutrition Meal Box & Feedback */}
      <div className="flex flex-wrap gap-4">
        <Badge 
          variant="outline" 
          className={cn(
            "gap-1 px-3 py-1 border-none",
            patient.meal_served_at || patient.nutrition_kit_distributed ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" :
            patient.meal_required ? "bg-amber-100 text-amber-700" : "bg-neutral-100 text-neutral-400"
          )}
        >
          <Package className="w-3 h-3" />
          Nutrition Meal Box: {
            patient.meal_served_at 
              ? `Delivered (${new Date(patient.meal_served_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})` 
              : patient.nutrition_kit_distributed 
                ? `Delivered (${patient.nutrition_kit_date})`
                : patient.meal_required ? 'Required' : 'Not Needed'
          }
        </Badge>
        <Badge variant="outline" className="gap-1 px-3 py-1 bg-neutral-100 text-neutral-700 border-none">
          <ClipboardCheck className="w-3 h-3" />
          Feedback Confirm: {patient.feedback_confirmation ? 'Yes' : 'No'}
        </Badge>
      </div>

      {/* Clinical Chain of Custody */}
      <div className="mt-8 pt-6 border-t border-neutral-100">
        <h3 className="text-xs font-black text-neutral-400 uppercase tracking-[0.2em] mb-4">Clinical Chain of Custody</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Registrar</p>
              <p className="text-sm font-bold text-neutral-800">{patient.registrar_name || 'Anonymous'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Consultant</p>
              <p className="text-sm font-bold text-neutral-800">{patient.consultant_name || 'Pending...'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Meal Server</p>
              <p className="text-sm font-bold text-neutral-800">{patient.meal_distributor_name || (patient.meal_required ? 'Pending...' : 'N/A')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Visit History Timeline */}
      <VisitHistory patient={patient} />
    </div>
  );
}

function VisitHistory({ patient }: { patient: Patient }) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchHistory() {
      // Find the root identity ID
      const masterId = patient?.master_patient_id || patient?.id;
      
      if (!masterId) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('patient_visits')
          .select('id, created_at, status, consultant_advice, symptoms, registrar_name, consultant_name, meal_distributor_name, meal_required, meal_served_at, medication_hydroxyurea, medication_folic_acid, nutrition_kit_distributed')
          .eq('patient_id', masterId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setHistory(data || []);
      } catch (err) {
        console.error("Error fetching patient history:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [patient.id, patient.master_patient_id]);

  if (loading) {
    return <div className="text-sm text-neutral-400 mt-8">Loading visit history...</div>;
  }

  if (history.length <= 1) {
    return null; // No previous visits
  }

  const totalMeals = history.filter(v => v.meal_served_at || v.nutrition_kit_distributed).length;

  return (
    <div className="mt-8 pt-6 border-t border-neutral-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h3 className="text-xs font-black text-neutral-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <History className="w-4 h-4" />
          Visit History
        </h3>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-neutral-50 text-neutral-600 border-neutral-200">
            Total Visits: {history.length}
          </Badge>
          <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">
            Total Kits Provided: {totalMeals}
          </Badge>
        </div>
      </div>
      
      <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-neutral-200 before:to-transparent">
        {history.map((visit, index) => {
          const isFirstVisit = index === history.length - 1;
          const visitNumber = history.length - index;
          const hasMeds = visit.medication_hydroxyurea || visit.medication_folic_acid;
          const hasKit = visit.meal_served_at || visit.nutrition_kit_distributed;
          
          return (
            <div key={visit.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-neutral-100 text-neutral-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <span className="text-[10px] font-bold">{visitNumber}</span>
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl bg-white border border-neutral-100 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-neutral-900">{isFirstVisit ? 'First Visit' : `Visit ${visitNumber}`}</span>
                    <span className="text-[10px] text-neutral-500">{new Date(visit.created_at).toLocaleDateString()}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{visit.status.replace('_', ' ')}</Badge>
                </div>
                
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {hasMeds && <Badge variant="secondary" className="text-[9px] bg-amber-50 text-amber-700 px-1.5 py-0">💊 Meds Rx</Badge>}
                  {hasKit && <Badge variant="secondary" className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0">🍲 Kit Delivered</Badge>}
                </div>

                <p className="text-xs text-neutral-600 line-clamp-2 mb-3">
                  {visit.consultant_advice || (visit.symptoms?.length ? `Symptoms: ${visit.symptoms.join(', ')}` : 'No notes')}
                </p>

                <div className="text-[9px] text-neutral-400 font-medium flex flex-wrap gap-x-2 gap-y-1 pt-2 border-t border-neutral-50">
                  {visit.registrar_name && <span>Reg: {visit.registrar_name}</span>}
                  {visit.consultant_name && <span>• Dr: {visit.consultant_name}</span>}
                  {visit.meal_distributor_name && <span>• Meal: {visit.meal_distributor_name}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

