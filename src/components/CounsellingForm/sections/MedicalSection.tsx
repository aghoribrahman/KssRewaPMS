import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Activity, Droplets, Stethoscope } from 'lucide-react';
import { useFormContext, Controller } from 'react-hook-form';
import { PatientFormData } from '../../../lib/schemas';

import { Textarea } from '@/components/ui/textarea';

interface SectionProps {
  lang: 'en' | 'hi';
  readOnly?: boolean;
  disabledFields?: any[];
  hiddenFields?: any[];
}

const RequiredBadge = () => <span className="text-red-500 ml-1 font-bold">*</span>;

const SYMPTOMS = [
  { id: 'bone_pain', en: 'Bone / Joint Pain', hi: 'हड्डियों/जोड़ों का दर्द' },
  { id: 'fever', en: 'Recurring Fever', hi: 'बार-बार बुखार' },
  { id: 'breathing', en: 'Difficulty Breathing', hi: 'सांस लेने में कठिनाई' },
  { id: 'jaundice', en: 'Yellowish Eyes/Skin', hi: 'पीली आंखें/त्वचा' },
  { id: 'fatigue', en: 'Fatigue / Weakness', hi: 'थकान / कमजोरी' },
];

export function MedicalSection({ lang, readOnly, hiddenFields = [] }: SectionProps) {
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
            {errors.weight && <p className="text-[9px] text-red-500 font-bold ml-1">{errors.weight.message as string}</p>}
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
              {...register('other_health_issues')} 
              disabled={readOnly}
              placeholder="Any chronic illnesses, allergies, or previous surgeries..." 
              className="rounded-xl min-h-[80px] md:min-h-[100px] border-neutral-100 bg-neutral-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium resize-none p-3"
            />
          </div>
        </div>

        {/* Specialized Sickle Cell Profile */}
        {!hiddenFields.includes('sickle_cell_profile') && (
          <div className="pt-6 border-t border-neutral-100 space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 tracking-tight">{lang === 'en' ? "Sickle Cell Profile" : "सिकल सेल प्रोफाइल"}</h3>
              <p className="text-[10px] text-neutral-500">{lang === 'en' ? "Specific SCD diagnosis and treatment data" : "विशिष्ट सिकल सेल निदान और उपचार डेटा"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* SCD Status */}
            <div className="space-y-3 bg-rose-50/30 p-4 rounded-2xl border border-rose-100/50">
              <Label className="text-[10px] font-black uppercase tracking-widest text-rose-600">{lang === 'en' ? "SCD Status" : "सिकल सेल स्थिति"} <RequiredBadge /></Label>
              <Controller
                name="sickle_cell_status"
                control={control}
                render={({ field }) => (
                  <RadioGroup 
                    value={field.value} 
                    onValueChange={field.onChange} 
                    className="flex flex-col gap-2"
                    disabled={readOnly}
                  >
                    {[
                      { id: 'SS', label: 'SS (Disease)', color: 'bg-rose-500' },
                      { id: 'AS', label: 'AS (Trait)', color: 'bg-orange-500' },
                      { id: 'AA', label: 'AA (Normal)', color: 'bg-emerald-500' }
                    ].map((status) => (
                      <div key={status.id} className="flex items-center space-x-2 bg-white px-3 py-2.5 rounded-xl border border-rose-100 hover:shadow-sm transition-all">
                        <RadioGroupItem value={status.id} id={`status-${status.id}`} />
                        <Label htmlFor={`status-${status.id}`} className="flex items-center gap-2 cursor-pointer font-bold text-xs">
                          <div className={`w-2 h-2 rounded-full ${status.color}`} />
                          {status.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              />
            </div>

            {/* Diagnosis History */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">{lang === 'en' ? "Pre-existing Diagnosis?" : "पूर्व निदान?"}</Label>
                  <Controller
                    name="pre_existing_diagnosis"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup 
                        value={field.value ? 'yes' : 'no'} 
                        onValueChange={(val) => field.onChange(val === 'yes')} 
                        className="flex gap-4"
                        disabled={readOnly}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="pre-yes" />
                          <Label htmlFor="pre-yes" className="text-xs font-bold">{lang === 'en' ? 'Yes' : 'हाँ'}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="pre-no" />
                          <Label htmlFor="pre-no" className="text-xs font-bold">{lang === 'en' ? 'No' : 'नहीं'}</Label>
                        </div>
                      </RadioGroup>
                    )}
                  />
                </div>
                {watch('pre_existing_diagnosis') && (
                  <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">{lang === 'en' ? "Date of Diagnosis" : "निदान की तिथि"}</Label>
                    <Input 
                      type="date" 
                      {...register('date_of_diagnosis')} 
                      disabled={readOnly}
                      className="rounded-xl h-10 border-neutral-100 bg-neutral-50/50 text-xs font-medium" 
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">{lang === 'en' ? "Blood Transfusions" : "रक्त आधान की संख्या"}</Label>
                  <Input 
                    type="number" 
                    {...register('blood_transfusions_count', { valueAsNumber: true })} 
                    disabled={readOnly}
                    placeholder="Total count" 
                    className="rounded-xl h-10 border-neutral-100 bg-neutral-50/50 text-xs font-medium" 
                  />
                </div>
                <div className="flex items-center gap-2 space-y-0">
                  <Controller
                    name="previous_hospitalizations"
                    control={control}
                    render={({ field }) => (
                      <Checkbox 
                        id="hosp" 
                        checked={field.value} 
                        onCheckedChange={field.onChange}
                        disabled={readOnly}
                      />
                    )}
                  />
                  <Label htmlFor="hosp" className="text-xs font-bold text-neutral-600 cursor-pointer">
                    {lang === 'en' ? "Previous Hospitalizations?" : "पिछला अस्पताल में भर्ती?"}
                  </Label>
                </div>
              </div>
            </div>
          </div>

          {/* Medications */}
          {!hiddenFields.includes('medications') && (
            <div className="bg-rose-50/20 p-5 rounded-2xl border border-rose-100/30 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Stethoscope className="w-3.5 h-3.5 text-rose-500" />
              <Label className="text-[10px] font-black uppercase tracking-widest text-rose-600">{lang === 'en' ? "Specific SCD Medications" : "विशिष्ट सिकल सेल दवाएं"}</Label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-neutral-700">{lang === 'en' ? "Hydroxyurea" : "हाइड्रोक्सीयूरिया"}</Label>
                  <Controller
                    name="medication_hydroxyurea"
                    control={control}
                    render={({ field }) => (
                      <Checkbox 
                        checked={field.value} 
                        onCheckedChange={field.onChange}
                        disabled={readOnly}
                        className="data-[state=checked]:bg-rose-500"
                      />
                    )}
                  />
                </div>
                {watch('medication_hydroxyurea') && (
                  <Input 
                    {...register('dosage_hydroxyurea')} 
                    disabled={readOnly}
                    placeholder="Dosage (e.g. 500mg daily)" 
                    className="rounded-xl h-9 border-neutral-100 bg-white text-[11px] font-medium animate-in zoom-in-95 duration-200" 
                  />
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-neutral-700">{lang === 'en' ? "Folic Acid" : "फॉलिक एसिड"}</Label>
                  <Controller
                    name="medication_folic_acid"
                    control={control}
                    render={({ field }) => (
                      <Checkbox 
                        checked={field.value} 
                        onCheckedChange={field.onChange}
                        disabled={readOnly}
                        className="data-[state=checked]:bg-rose-500"
                      />
                    )}
                  />
                </div>
                {watch('medication_folic_acid') && (
                  <Input 
                    {...register('dosage_folic_acid')} 
                    disabled={readOnly}
                    placeholder="Dosage (e.g. 5mg daily)" 
                    className="rounded-xl h-9 border-neutral-100 bg-white text-[11px] font-medium animate-in zoom-in-95 duration-200" 
                  />
                )}
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <Controller
                name="medication_regularity"
                control={control}
                render={({ field }) => (
                  <Checkbox 
                    id="reg" 
                    checked={field.value} 
                    onCheckedChange={field.onChange}
                    disabled={readOnly}
                  />
                )}
              />
              <Label htmlFor="reg" className="text-[11px] font-bold text-rose-700 cursor-pointer italic">
                {lang === 'en' ? "Patient takes medication regularly" : "मरीज नियमित रूप से दवा लेता है"}
              </Label>
            </div>
            </div>
          )}
        </div>
        )}
      </CardContent>
    </Card>
  );
}
