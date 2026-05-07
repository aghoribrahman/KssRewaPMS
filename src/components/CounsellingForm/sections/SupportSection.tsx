import * as React from 'react';
import { Patient } from '../../../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { ClipboardCheck } from 'lucide-react';
import { TRANSLATIONS } from '../../../constants/mp_data';

interface SectionProps {
  data: Partial<Patient>;
  onChange: (field: keyof Patient, value: any) => void;
  onCheckboxChange: (field: 'symptoms' | 'counselling_topics' | 'referral', value: string, checked: boolean) => void;
  lang: 'en' | 'hi';
  readOnly?: boolean;
}

export function SupportSection({ data, onChange, onCheckboxChange, lang, readOnly }: SectionProps) {
  const t = TRANSLATIONS[lang];

  return (
    <div className="space-y-6 pt-6 border-t border-neutral-100">
      <div className="flex items-center gap-2 text-primary font-black text-sm uppercase tracking-widest px-4">
        <ClipboardCheck className="w-4 h-4" /> 3. Support & Feedback
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="rounded-[2.5rem] border-none premium-shadow bg-white overflow-hidden">
          <CardHeader className="bg-neutral-50/50 p-8 border-b border-neutral-100">
            <CardTitle className="text-xl font-black text-neutral-900 tracking-tight">Counselling & Kits</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
             <div className="space-y-6">
              <Label className="text-xs font-black uppercase tracking-widest text-neutral-400">Topics Discussed</Label>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                {[
                  'Basic information on SCD',
                  'Symptom identification',
                  'Importance of Diet',
                  'Regular check-ups',
                  'Medication regularity',
                  'Nutrition Kit instructions'
                ].map((topic) => (
                  <div key={topic} className={`flex items-center space-x-4 p-4 rounded-2xl transition-all ${
                    data.counselling_topics?.includes(topic) ? 'bg-primary/5' : 'hover:bg-neutral-50'
                  }`}>
                    <Checkbox 
                      id={topic} 
                      checked={!!(data.counselling_topics?.includes(topic))}
                      onCheckedChange={(checked) => onCheckboxChange('counselling_topics', topic, !!checked)}
                      disabled={readOnly}
                      className="w-5 h-5 rounded-md"
                    />
                    <Label htmlFor={topic} className="text-sm font-bold text-neutral-700 cursor-pointer">{topic}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8 border-t border-neutral-100 flex items-center justify-between">
               <div className="space-y-1">
                  <Label className="text-base font-black text-neutral-900">Meal Box Required?</Label>
                  <p className="text-xs text-neutral-500 font-medium">Add patient to the distribution queue</p>
               </div>
               <Checkbox 
                  id="meal-req" 
                  checked={!!data.meal_required}
                  onCheckedChange={(checked) => onChange('meal_required', !!checked)}
                  disabled={readOnly}
                  className="w-8 h-8 rounded-xl border-2"
                />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] border-none premium-shadow bg-white overflow-hidden">
          <CardHeader className="bg-neutral-50/50 p-8 border-b border-neutral-100">
            <CardTitle className="text-xl font-black text-neutral-900 tracking-tight">Feedback & Concerns</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="space-y-4">
              <Label className="text-xs font-black uppercase tracking-widest text-neutral-400">Specific Concerns or Questions</Label>
              <Textarea 
                value={data.specific_concerns || ''} 
                onChange={(e) => onChange('specific_concerns', e.target.value)} 
                disabled={readOnly}
                placeholder="Enter any questions patient had..."
                className="rounded-2xl min-h-[160px] border-neutral-100 bg-neutral-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-base font-medium p-6 resize-none"
              />
            </div>
            <div className="flex items-center space-x-4 p-6 bg-primary/5 border border-primary/10 rounded-[2rem]">
              <Checkbox 
                id="feed-confirm" 
                checked={!!data.feedback_confirmation}
                onCheckedChange={(checked) => onChange('feedback_confirmation', !!checked)}
                disabled={readOnly}
                className="w-6 h-6 rounded-lg"
              />
              <Label htmlFor="feed-confirm" className="text-sm font-bold text-primary leading-snug cursor-pointer">
                Patient/Guardian confirms they understood all medical and dietary instructions provided.
              </Label>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
