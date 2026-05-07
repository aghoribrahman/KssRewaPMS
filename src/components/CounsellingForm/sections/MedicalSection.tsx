import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Activity } from 'lucide-react';
import { useFormContext, Controller } from 'react-hook-form';
import { PatientFormData } from '../../../lib/schemas';

interface SectionProps {
  lang: 'en' | 'hi';
  readOnly?: boolean;
}

const RequiredBadge = () => <span className="text-red-500 ml-1 font-bold">*</span>;

export function MedicalSection({ lang, readOnly }: SectionProps) {
  const { register, control, watch, formState: { errors } } = useFormContext<PatientFormData>();
  const preExistingDiagnosis = watch('pre_existing_diagnosis');
  const selectedSymptoms = watch('symptoms') || [];

  return (
    <div className="space-y-6 pt-6 border-t border-neutral-100">
      <div className="flex items-center gap-2 text-primary font-black text-sm uppercase tracking-widest px-4">
        <Activity className="w-4 h-4" /> 2. Medical Data
      </div>
      <div className="space-y-8">
        <Card className="rounded-[2.5rem] border-none premium-shadow bg-white overflow-hidden">
          <CardHeader className="bg-neutral-50/50 p-8 border-b border-neutral-100">
            <CardTitle className="text-xl font-black text-neutral-900 tracking-tight">Clinical Diagnosis</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-10">
            <div className="space-y-4">
              <Label className="text-xs font-black uppercase tracking-widest text-neutral-400">Sickle Cell Status <RequiredBadge /></Label>
              <Controller
                name="sickle_cell_status"
                control={control}
                render={({ field }) => (
                  <RadioGroup 
                    value={field.value} 
                    onValueChange={field.onChange}
                    disabled={readOnly}
                    className="flex flex-wrap gap-6"
                  >
                    {['SS', 'AS', 'AA'].map(status => (
                      <div key={status} className="flex items-center space-x-3 p-4 px-6 bg-neutral-50 rounded-2xl hover:bg-neutral-100 transition-all cursor-pointer">
                        <RadioGroupItem value={status} id={status} className="w-5 h-5 border-2 border-primary" />
                        <Label htmlFor={status} className="font-black text-lg cursor-pointer text-neutral-800">{status}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              />
              {errors.sickle_cell_status && <p className="text-xs text-red-500">{errors.sickle_cell_status.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-neutral-100">
              <div className="space-y-4">
                <Label className="text-xs font-black uppercase tracking-widest text-neutral-400">Pre-existing Diagnosis?</Label>
                <Controller
                  name="pre_existing_diagnosis"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup 
                      value={field.value ? 'yes' : 'no'} 
                      onValueChange={(val) => field.onChange(val === 'yes')}
                      disabled={readOnly}
                      className="flex gap-8"
                    >
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="yes" id="diag-yes" className="w-5 h-5" />
                        <Label htmlFor="diag-yes" className="font-bold text-neutral-700">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="no" id="diag-no" className="w-5 h-5" />
                        <Label htmlFor="diag-no" className="font-bold text-neutral-700">No</Label>
                      </div>
                    </RadioGroup>
                  )}
                />
              </div>
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-neutral-400">Date of Diagnosis (if known)</Label>
                <Input 
                  type="date"
                  {...register('date_of_diagnosis')}
                  disabled={readOnly || !preExistingDiagnosis}
                  className="rounded-2xl h-14 border-neutral-100 bg-neutral-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-base font-medium"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] border-none premium-shadow bg-white overflow-hidden">
          <CardHeader className="bg-neutral-50/50 p-8 border-b border-neutral-100">
            <CardTitle className="text-xl font-black text-neutral-900 tracking-tight">Symptoms & History</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-10">
            <div className="space-y-6">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">Current Physical Symptoms</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  'Bone / Joint Pain',
                  'Recurring Fever',
                  'Difficulty Breathing',
                  'Yellowish Eyes/Skin',
                  'Fatigue / Weakness'
                ].map((symptom) => (
                  <div key={symptom} className={`flex items-center space-x-4 p-5 rounded-2xl transition-all duration-300 border-2 ${
                    selectedSymptoms.includes(symptom) 
                    ? 'bg-primary/5 border-primary/20 shadow-lg shadow-primary/5' 
                    : 'bg-neutral-50 border-transparent hover:border-neutral-200'
                  }`}>
                    <Controller
                      name="symptoms"
                      control={control}
                      render={({ field }) => (
                        <Checkbox 
                          id={symptom} 
                          checked={field.value?.includes(symptom)}
                          onCheckedChange={(checked) => {
                            const newValue = checked
                              ? [...(field.value || []), symptom]
                              : (field.value || []).filter((s: string) => s !== symptom);
                            field.onChange(newValue);
                          }}
                          disabled={readOnly}
                          className="w-5 h-5 rounded-md"
                        />
                      )}
                    />
                    <Label htmlFor={symptom} className="cursor-pointer text-sm font-bold text-neutral-800">{symptom}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-neutral-100">
              <div className="space-y-4">
                 <Label className="text-xs font-black uppercase tracking-widest text-neutral-400">Previous Hospitalizations?</Label>
                 <Controller
                   name="previous_hospitalizations"
                   control={control}
                   render={({ field }) => (
                     <RadioGroup 
                      value={field.value ? 'yes' : 'no'} 
                      onValueChange={(val) => field.onChange(val === 'yes')}
                      disabled={readOnly}
                      className="flex gap-8"
                    >
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="yes" id="hosp-yes" className="w-5 h-5" />
                        <Label htmlFor="hosp-yes" className="font-bold text-neutral-700">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="no" id="hosp-no" className="w-5 h-5" />
                        <Label htmlFor="hosp-no" className="font-bold text-neutral-700">No</Label>
                      </div>
                    </RadioGroup>
                   )}
                 />
                 {errors.previous_hospitalizations && <p className="text-xs text-red-500">{errors.previous_hospitalizations.message}</p>}
              </div>
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-neutral-400">Blood Transfusions (approx count)</Label>
                <Input 
                  type="number"
                  {...register('blood_transfusions_count')}
                  disabled={readOnly}
                  className={`rounded-2xl h-14 border-neutral-100 bg-neutral-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-base font-medium ${errors.blood_transfusions_count ? 'border-red-500' : ''}`}
                />
                {errors.blood_transfusions_count && <p className="text-xs text-red-500">{errors.blood_transfusions_count.message}</p>}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
