import * as React from 'react';
import { Patient } from '../types';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { TRANSLATIONS } from '../constants/mp_data';

import { IdentitySection } from './CounsellingForm/sections/IdentitySection';
import { MedicalSection } from './CounsellingForm/sections/MedicalSection';
import { SupportSection } from './CounsellingForm/sections/SupportSection';

interface CounsellingFormProps {
  data: Partial<Patient>;
  onChange: (data: Partial<Patient>) => void;
  onSubmit?: () => void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  readOnly?: boolean;
}

export function CounsellingForm({ 
  data, 
  onChange, 
  onSubmit, 
  onCancel, 
  submitLabel = 'Confirm Registration',
  cancelLabel = 'Cancel',
  readOnly = false 
}: CounsellingFormProps) {
  const { profile } = useAuth();
  const lang = profile?.preferred_language || 'hi';

  const handleChange = (field: keyof Patient, value: any) => {
    if (readOnly) return;
    onChange({ ...data, [field]: value });
  };

  const handleCheckboxChange = (field: 'symptoms' | 'counselling_topics' | 'referral', value: string, checked: boolean) => {
    if (readOnly) return;
    const current = (data[field] as string[]) || [];
    if (checked) {
      onChange({ ...data, [field]: [...current, value] });
    } else {
      onChange({ ...data, [field]: current.filter((item) => item !== value) });
    }
  };

  return (
    <div className="space-y-12 w-full pb-12">
      <IdentitySection 
        data={data} 
        onChange={handleChange} 
        lang={lang} 
        readOnly={readOnly} 
      />

      <MedicalSection 
        data={data} 
        onChange={handleChange} 
        onCheckboxChange={handleCheckboxChange} 
        lang={lang} 
        readOnly={readOnly} 
      />

      <SupportSection 
        data={data} 
        onChange={handleChange} 
        onCheckboxChange={handleCheckboxChange} 
        lang={lang} 
        readOnly={readOnly} 
      />

      {!readOnly && (onSubmit || onCancel) && (
        <div className="flex justify-end gap-3 pt-12 border-t border-neutral-100">
          {onCancel && (
            <Button 
              variant="outline" 
              onClick={onCancel} 
              className="rounded-xl h-12 px-8 text-sm font-bold border-neutral-200 hover:bg-neutral-50"
            >
              {cancelLabel}
            </Button>
          )}
          {onSubmit && (
            <Button 
              onClick={onSubmit} 
              className="rounded-xl h-12 px-10 text-sm font-bold shadow-xl shadow-primary/20 bg-primary hover:scale-[1.02] transition-transform"
            >
              <MapPin className="w-4 h-4 mr-2" />
              {submitLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
