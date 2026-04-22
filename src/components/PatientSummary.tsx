import * as React from 'react';
import { Patient } from '../types';
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
  Utensils
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PatientSummaryProps {
  patient: Patient;
  className?: string;
}

export function PatientSummary({ patient, className }: PatientSummaryProps) {
  if (!patient) return null;

  const sections = [
    {
      title: 'General',
      icon: User,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
      fields: [
        { label: 'Age', value: `${patient.age} years` },
        { label: 'Gender', value: patient.gender },
        { label: 'Contact', value: patient.contact },
        { label: 'ABHA/Aadhaar', value: patient.abhaId || patient.aadharNumber || 'N/A' },
      ]
    },
    {
      title: 'Location',
      icon: MapPin,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
      fields: [
        { label: 'District', value: patient.district },
        { label: 'Block', value: patient.block || 'N/A' },
        { label: 'Village', value: patient.village || 'N/A' },
      ]
    },
    {
      title: 'Diagnosis',
      icon: Activity,
      color: 'text-rose-500',
      bg: 'bg-rose-50',
      fields: [
        { 
          label: 'Status', 
          value: <Badge className={cn(
            patient.sickleCellStatus === 'SS' ? 'bg-rose-500' : 
            patient.sickleCellStatus === 'AS' ? 'bg-orange-500' : 'bg-emerald-500'
          )}>{patient.sickleCellStatus}</Badge> 
        },
        { label: 'Pre-existing', value: patient.preExistingDiagnosis ? `Yes (${patient.dateOfDiagnosis})` : 'No' },
      ]
    },
    {
      title: 'Medical History',
      icon: History,
      color: 'text-purple-500',
      bg: 'bg-purple-50',
      fields: [
        { label: 'First Onset', value: patient.firstSymptomOnset || 'N/A' },
        { label: 'Transfusions', value: patient.bloodTransfusionsCount },
        { label: 'Other Issues', value: patient.otherHealthIssues || 'None' },
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
            {patient.medicationHydroxyurea && <div><Badge variant="outline" className="mr-2">Hydroxyurea</Badge> {patient.dosageHydroxyurea}</div>}
            {patient.medicationFolicAcid && <div><Badge variant="outline" className="mr-2">Folic Acid</Badge> {patient.dosageFolicAcid}</div>}
            {!patient.medicationHydroxyurea && !patient.medicationFolicAcid && <p className="text-neutral-400 italic">No specific meds</p>}
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
             {patient.counsellingTopics?.length || 0} topics discussed
          </CardContent>
        </Card>
      </div>

      {/* Kit & Feedback */}
      <div className="flex flex-wrap gap-4">
        <Badge variant={patient.nutritionKitDistributed ? "success" : "destructive"} className="gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">
          <Package className="w-3 h-3" />
          Kit: {patient.nutritionKitDistributed ? `Delivered (${patient.nutritionKitDate})` : 'Pending'}
        </Badge>
        <Badge 
          variant="outline" 
          className={cn(
            "gap-1 px-3 py-1 border-none",
            patient.mealRequired ? "bg-amber-100 text-amber-700" : "bg-neutral-100 text-neutral-400"
          )}
        >
          <Utensils className="w-3 h-3" />
          Meal Box: {patient.mealRequired ? (patient.mealServedAt ? `Delivered (${new Date(patient.mealServedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})` : 'Required') : 'Not Needed'}
        </Badge>
        <Badge variant="outline" className="gap-1 px-3 py-1 bg-neutral-100 text-neutral-700 border-none">
          <ClipboardCheck className="w-3 h-3" />
          Feedback Confirm: {patient.feedbackConfirmation ? 'Yes' : 'No'}
        </Badge>
      </div>
    </div>
  );
}
