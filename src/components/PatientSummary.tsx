import * as React from 'react';
import { Patient } from '../types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Activity, 
  Stethoscope, 
  Pill, 
  BookOpen, 
  Package, 
  MapPin,
  ClipboardCheck,
  AlertCircle,
  Utensils,
  UserCheck,
  LucideIcon,
  History
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '../hooks/useTranslation';
import { maskSensitiveData } from './shared/patientUtils';
import { VisitHistory } from './shared/VisitHistory';
import { formatTime } from '../lib/dateUtils';
import { useAuth } from '../hooks/useAuth';

interface SummaryCardProps {
  title: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  fields: { label: string; value: React.ReactNode }[];
}

function SummaryCard({ title, icon: Icon, color, bg, fields }: SummaryCardProps) {
  return (
    <Card className="overflow-hidden border-neutral-100 shadow-sm">
      <div className={cn("px-4 py-3 border-b flex items-center gap-2", bg)}>
        <Icon className={cn("w-4 h-4", color)} />
        <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wider">{title}</h3>
      </div>
      <CardContent className="p-3 space-y-2">
        {fields.map((field, idx) => (
          <div key={idx} className="flex justify-between items-start text-xs">
            <span className="text-neutral-500">{field.label}:</span>
            <span className="font-semibold text-neutral-900 text-right ml-4">{field.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

interface PatientSummaryProps {
  patient: Patient;
  className?: string;
}

export function PatientSummary({ patient, className }: PatientSummaryProps) {
  const { t, lang } = useTranslation();
  const { profile } = useAuth();
  
  if (!patient) return null;

  const isVisitor = profile?.role === 'visitor';
  const hasHighRiskSymptoms = patient.symptoms?.includes('Difficulty Breathing') || 
                            patient.symptoms?.includes('Yellowish Discoloration of Eyes/Skin');

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
        { label: t.contact, value: maskSensitiveData(patient.contact || undefined, 'contact', isVisitor) },
        { label: t.abhaId, value: maskSensitiveData((patient.abha_id || patient.aadhar_number) || undefined, 'id', isVisitor) },
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {sections.map((section) => (
          <SummaryCard key={section.title} {...section} />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Medication Summary */}
        <Card className="border-neutral-100 shadow-sm">
          <div className="px-3 py-2 border-b bg-amber-50 flex items-center gap-2">
            <Pill className="w-3 h-3 text-amber-500" />
            <h3 className="text-[10px] font-bold text-neutral-800 uppercase tracking-wider">Medication</h3>
          </div>
          <CardContent className="p-3 space-y-1.5 text-[11px]">
            {patient.medication_hydroxyurea && <div><Badge variant="outline" className="mr-2 py-0 h-4 text-[9px]">HU</Badge> {patient.dosage_hydroxyurea}</div>}
            {patient.medication_folic_acid && <div><Badge variant="outline" className="mr-2 py-0 h-4 text-[9px]">FA</Badge> {patient.dosage_folic_acid}</div>}
            {!patient.medication_hydroxyurea && !patient.medication_folic_acid && <p className="text-neutral-400 italic">No specific meds</p>}
          </CardContent>
        </Card>

        {/* Symptoms */}
        <Card className="border-neutral-100 shadow-sm">
          <div className="px-3 py-2 border-b bg-neutral-50 flex items-center gap-2">
            <Stethoscope className="w-3 h-3 text-neutral-500" />
            <h3 className="text-[10px] font-bold text-neutral-800 uppercase tracking-wider">Symptoms</h3>
          </div>
          <CardContent className="p-3 flex flex-wrap gap-1">
            {patient.symptoms?.map(s => (
              <Badge key={s} variant="secondary" className="text-[8px] uppercase font-bold py-0">{s}</Badge>
            ))}
            {patient.symptoms?.length === 0 && <p className="text-neutral-400 italic text-[11px]">No symptoms</p>}
          </CardContent>
        </Card>

        {/* Counselling Topics */}
        <Card className="border-neutral-100 shadow-sm">
          <div className="px-3 py-2 border-b bg-sky-50 flex items-center gap-2">
            <BookOpen className="w-3 h-3 text-sky-500" />
            <h3 className="text-[10px] font-bold text-neutral-800 uppercase tracking-wider">Counselling</h3>
          </div>
          <CardContent className="p-3 text-[11px] font-medium text-neutral-600 line-clamp-2">
             {patient.counselling_topics?.length || 0} topics discussed
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Badge 
          variant="outline" 
          className={cn(
            "gap-1 px-3 py-1.5 border-none text-[10px] sm:text-xs",
            patient.meal_served_at || patient.nutrition_kit_distributed ? "bg-emerald-100 text-emerald-700" :
            patient.meal_required ? "bg-amber-100 text-amber-700" : "bg-neutral-100 text-neutral-400"
          )}
        >
          <Package className="w-3 h-3 sm:w-4 sm:h-4" />
          Nutrition: {
            patient.meal_served_at 
              ? `Delivered (${formatTime(patient.meal_served_at)})` 
              : patient.nutrition_kit_distributed 
                ? `Kit Delivered (${patient.nutrition_kit_date})`
                : patient.meal_required ? 'Required' : 'Not Needed'
          }
        </Badge>
        <Badge variant="outline" className="gap-1 px-3 py-1.5 bg-neutral-100 text-neutral-700 border-none text-[10px] sm:text-xs">
          <ClipboardCheck className="w-3 h-3 sm:w-4 sm:h-4" />
          Feedback: {patient.feedback_confirmation ? 'Yes' : 'No'}
        </Badge>
      </div>

      <div className="mt-8 pt-6 border-t border-neutral-100">
        <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-4">Chain of Custody</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <ChainItem icon={UserCheck} color="blue" label="Registrar" name={patient.registrar_name} />
          <ChainItem icon={Stethoscope} color="amber" label="Consultant" name={patient.consultant_name} />
          <ChainItem icon={Utensils} color="emerald" label="Meal Server" name={patient.meal_distributor_name} placeholder={patient.meal_required ? 'Pending...' : 'N/A'} />
        </div>
      </div>

      <VisitHistory patient={patient} />
    </div>
  );
}

function ChainItem({ icon: Icon, color, label, name, placeholder = 'Pending...' }: any) {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600'
  };

  return (
    <div className="flex items-center gap-3">
      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", colors[color])}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-bold text-neutral-800">{name || placeholder}</p>
      </div>
    </div>
  );
}
