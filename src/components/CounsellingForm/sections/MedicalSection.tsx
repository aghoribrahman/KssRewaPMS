import * as React from 'react';
import { Patient, SickleCellStatus } from '../../../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Activity } from 'lucide-react';

interface SectionProps {
  data: Partial<Patient>;
  onChange: (field: keyof Patient, value: any) => void;
  onCheckboxChange: (field: 'symptoms' | 'counselling_topics' | 'referral', value: string, checked: boolean) => void;
  lang: 'en' | 'hi';
  readOnly?: boolean;
}

const RequiredBadge = () => <span className="text-red-500 ml-1 font-bold">*</span>;

export function MedicalSection({ data, onChange, onCheckboxChange, lang, readOnly }: SectionProps) {
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
              <RadioGroup 
                value={data.sickle_cell_status || ''} 
                onValueChange={(val) => onChange('sickle_cell_status', val as SickleCellStatus)}
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-neutral-100">
              <div className="space-y-4">
                <Label className="text-xs font-black uppercase tracking-widest text-neutral-400">Pre-existing Diagnosis?</Label>
                <RadioGroup 
                  value={data.pre_existing_diagnosis ? 'yes' : 'no'} 
                  onValueChange={(val) => onChange('pre_existing_diagnosis', val === 'yes')}
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
              </div>
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-neutral-400">Date of Diagnosis (if known)</Label>
                <Input 
                  type="date"
                  value={data.date_of_diagnosis || ''} 
                  onChange={(e) => onChange('date_of_diagnosis', e.target.value)} 
                  disabled={readOnly || !data.pre_existing_diagnosis}
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
                    data.symptoms?.includes(symptom) 
                    ? 'bg-primary/5 border-primary/20 shadow-lg shadow-primary/5' 
                    : 'bg-neutral-50 border-transparent hover:border-neutral-200'
                  }`}>
                    <Checkbox 
                      id={symptom} 
                      checked={!!(data.symptoms?.includes(symptom))}
                      onCheckedChange={(checked) => onCheckboxChange('symptoms', symptom, !!checked)}
                      disabled={readOnly}
                      className="w-5 h-5 rounded-md"
                    />
                    <Label htmlFor={symptom} className="cursor-pointer text-sm font-bold text-neutral-800">{symptom}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-neutral-100">
              <div className="space-y-4">
                 <Label className="text-xs font-black uppercase tracking-widest text-neutral-400">Previous Hospitalizations?</Label>
                 <RadioGroup 
                  value={data.previous_hospitalizations ? 'yes' : 'no'} 
                  onValueChange={(val) => onChange('previous_hospitalizations', val === 'yes')}
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
              </div>
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-neutral-400">Blood Transfusions (approx count)</Label>
                <Input 
                  type="number"
                  value={data.blood_transfusions_count || 0} 
                  onChange={(e) => onChange('blood_transfusions_count', parseInt(e.target.value))} 
                  disabled={readOnly}
                  className="rounded-2xl h-14 border-neutral-100 bg-neutral-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-base font-medium"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
