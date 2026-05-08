import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Activity } from 'lucide-react';
import { useFormContext, Controller } from 'react-hook-form';
import { PatientFormData } from '../../../lib/schemas';
import { TRANSLATIONS } from '../../../constants/mp_data';
import { Textarea } from '@/components/ui/textarea';

interface SectionProps {
  lang: 'en' | 'hi';
  readOnly?: boolean;
  disabledFields?: string[];
}

const RequiredBadge = () => <span className="text-red-500 ml-1 font-bold">*</span>;

const SYMPTOMS = [
  { id: 'bone_pain', en: 'Bone / Joint Pain', hi: 'हड्डियों/जोड़ों का दर्द' },
  { id: 'fever', en: 'Recurring Fever', hi: 'बार-बार बुखार' },
  { id: 'breathing', en: 'Difficulty Breathing', hi: 'सांस लेने में कठिनाई' },
  { id: 'jaundice', en: 'Yellowish Eyes/Skin', hi: 'पीली आंखें/त्वचा' },
  { id: 'fatigue', en: 'Fatigue / Weakness', hi: 'थकान / कमजोरी' },
];

export function MedicalSection({ lang, readOnly, disabledFields = [] }: SectionProps) {
  const t = TRANSLATIONS[lang];
  const { register, control, watch, setValue, formState: { errors } } = useFormContext<PatientFormData>();
  const fieldValue = watch('symptoms') || [];

  return (
    <Card className="rounded-2xl border-none shadow-lg shadow-neutral-200/40 overflow-hidden bg-white">
      <div className="h-1.5 bg-rose-500 w-full" />
      <CardContent className="p-4 space-y-4 md:space-y-5">
        <div className="flex items-center gap-2.5 mb-1 md:mb-2">
          <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-bold text-neutral-900 tracking-tight">{lang === 'en' ? "Clinical Profile" : "नैदानिक प्रोफाइल"}</h3>
            <p className="text-[10px] md:text-[11px] text-neutral-500">{lang === 'en' ? "Symptoms and physical metrics" : "लक्षण और शारीरिक मेट्रिक्स"}</p>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Primary Symptoms <RequiredBadge /></Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3 bg-neutral-50/50 rounded-xl border border-neutral-100">
            {SYMPTOMS.map((symptom) => (
              <label key={symptom.id} className="flex items-center gap-2.5 p-1.5 hover:bg-white rounded-lg transition-all cursor-pointer group">
                <Checkbox 
                  checked={fieldValue.includes(symptom.id)}
                  onCheckedChange={(checked) => {
                    const current = [...fieldValue];
                    if (checked) {
                      setValue('symptoms', [...current, symptom.id]);
                    } else {
                      setValue('symptoms', current.filter(id => id !== symptom.id));
                    }
                  }}
                  disabled={readOnly}
                  className="w-4 h-4 rounded-md border-neutral-300 data-[state=checked]:bg-rose-500 data-[state=checked]:border-rose-500"
                />
                <span className="text-[11px] font-bold text-neutral-600 group-hover:text-neutral-900 transition-colors">
                  {lang === 'en' ? symptom.en : symptom.hi}
                </span>
              </label>
            ))}
          </div>
          {errors.symptoms && <p className="text-[9px] text-red-500 font-bold ml-1">{errors.symptoms.message as string}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5 pt-3 border-t border-neutral-50">
          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Weight (kg) <RequiredBadge /></Label>
            <Input 
              type="number" 
              {...register('weight', { valueAsNumber: true })} 
              disabled={readOnly}
              placeholder="e.g. 65" 
              className={`rounded-xl h-10 md:h-11 border-neutral-100 bg-neutral-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium ${errors.weight ? 'border-red-500' : ''}`}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Blood Pressure</Label>
            <Input 
              {...register('bp')} 
              disabled={readOnly}
              placeholder="e.g. 120/80" 
              className="rounded-xl h-10 md:h-11 border-neutral-100 bg-neutral-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium"
            />
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Past Medical History</Label>
            <Textarea 
              {...register('medical_history')} 
              disabled={readOnly}
              placeholder="Any chronic illnesses, allergies, or previous surgeries..." 
              className="rounded-xl min-h-[80px] md:min-h-[100px] border-neutral-100 bg-neutral-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium resize-none p-3"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
