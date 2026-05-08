import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Heart, ClipboardCheck } from 'lucide-react';
import { useFormContext, Controller } from 'react-hook-form';
import { PatientFormData } from '../../../lib/schemas';
import { ImageUpload } from '../../ImageUpload';

interface SectionProps {
  lang: 'en' | 'hi';
  readOnly?: boolean;
  disabledFields?: string[];
}

const RequiredBadge = () => <span className="text-red-500 ml-1 font-bold">*</span>;

export function SupportSection({ lang, readOnly, disabledFields = [] }: SectionProps) {
  const { register, control, watch, setValue, formState: { errors } } = useFormContext<PatientFormData>();
  const selectedTopics = watch('counselling_topics') || [];

  return (
    <Card className="rounded-2xl border-none shadow-lg shadow-neutral-200/40 overflow-hidden bg-white">
      <div className="h-1.5 bg-amber-500 w-full" />
      <CardContent className="p-4 space-y-4 md:space-y-5">
        <div className="flex items-center gap-2.5 mb-1 md:mb-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Heart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-bold text-neutral-900 tracking-tight">{lang === 'en' ? "Support & Enrollment" : "सहायता और नामांकन"}</h3>
            <p className="text-[10px] md:text-[11px] text-neutral-500">{lang === 'en' ? "Dietary requirements and photos" : "आहार संबंधी आवश्यकताएं और तस्वीरें"}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Meal Required? <RequiredBadge /></Label>
            <Controller
              name="meal_required"
              control={control}
              render={({ field }) => (
                <RadioGroup 
                  className="flex gap-2" 
                  value={field.value ? 'yes' : 'no'} 
                  onValueChange={(val) => field.onChange(val === 'yes')}
                  disabled={readOnly}
                >
                  <div className="flex items-center space-x-2 bg-neutral-50 px-3 py-2 rounded-lg border border-neutral-100 hover:bg-white transition-all cursor-pointer">
                    <RadioGroupItem value="yes" id="meal-yes" className="w-3.5 h-3.5 text-amber-500 border-neutral-300" />
                    <Label htmlFor="meal-yes" className="font-bold cursor-pointer text-[11px]">{lang === 'en' ? 'Yes' : 'हाँ'}</Label>
                  </div>
                  <div className="flex items-center space-x-2 bg-neutral-50 px-3 py-2 rounded-lg border border-neutral-100 hover:bg-white transition-all cursor-pointer">
                    <RadioGroupItem value="no" id="meal-no" className="w-3.5 h-3.5 text-amber-500 border-neutral-300" />
                    <Label htmlFor="meal-no" className="font-bold cursor-pointer text-[11px]">{lang === 'en' ? 'No' : 'नहीं'}</Label>
                  </div>
                </RadioGroup>
              )}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Dietary Preferences</Label>
            <Input 
              {...register('dietary_preference')} 
              disabled={readOnly}
              placeholder="e.g. Vegetarian" 
              className="rounded-xl h-10 md:h-11 border-neutral-100 bg-neutral-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium"
            />
          </div>

          <div className="md:col-span-2 space-y-3 pt-3 border-t border-neutral-50">
            <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Identification Photo <RequiredBadge /></Label>
            <div className="bg-neutral-50/50 rounded-2xl p-3 border-2 border-dashed border-neutral-100 group hover:border-amber-500/30 transition-all">
              <ImageUpload 
                folder="patient_registrations" 
                onUploadComplete={(url) => setValue('registrar_image_url', url)} 
                label={lang === 'en' ? "Capture Photo" : "फोटो लें"}
              />
            </div>
            {errors.registrar_image_url && <p className="text-[9px] text-red-500 font-bold ml-1">{errors.registrar_image_url.message as string}</p>}
          </div>

          <div className="md:col-span-2 space-y-3 pt-3 border-t border-neutral-50">
             <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Topics Discussed / Counselling</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  'Basic information on SCD',
                  'Symptom identification',
                  'Importance of Diet',
                  'Regular check-ups',
                  'Medication regularity',
                  'Nutrition Kit instructions'
                ].map((topic) => (
                  <label key={topic} className={`flex items-center space-x-2 p-2 rounded-lg border transition-all ${
                    selectedTopics.includes(topic) ? 'bg-amber-50 border-amber-200' : 'bg-neutral-50 border-neutral-100 hover:bg-white'
                  }`}>
                    <Checkbox 
                      checked={selectedTopics.includes(topic)}
                      onCheckedChange={(checked) => {
                        const current = [...selectedTopics];
                        if (checked) {
                          setValue('counselling_topics', [...current, topic]);
                        } else {
                          setValue('counselling_topics', current.filter(t => t !== topic));
                        }
                      }}
                      disabled={readOnly}
                      className="w-3.5 h-3.5"
                    />
                    <span className="text-[10px] font-bold text-neutral-700">{topic}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-2 pt-4 border-t border-neutral-50">
            <Label className="text-xs font-black uppercase tracking-widest text-neutral-400">Specific Concerns or Feedback</Label>
            <Textarea 
              {...register('specific_concerns')} 
              disabled={readOnly}
              placeholder="Any additional feedback or patient concerns..." 
              className="rounded-2xl min-h-[100px] border-neutral-100 bg-neutral-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-base font-medium resize-none p-4"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
