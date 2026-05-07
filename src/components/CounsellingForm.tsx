import * as React from 'react';
import { Patient } from '../types';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PatientSchema, PatientFormData } from '../lib/schemas';

import { IdentitySection } from './CounsellingForm/sections/IdentitySection';
import { MedicalSection } from './CounsellingForm/sections/MedicalSection';
import { SupportSection } from './CounsellingForm/sections/SupportSection';

interface CounsellingFormProps {
  data: Partial<Patient>;
  onSubmit?: (data: PatientFormData) => void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  readOnly?: boolean;
}

export function CounsellingForm({ 
  data, 
  onSubmit = () => {}, 
  onCancel, 
  submitLabel = 'Confirm Registration',
  cancelLabel = 'Cancel',
  readOnly = false 
}: CounsellingFormProps) {
  const { profile } = useAuth();
  const lang = (profile?.preferred_language as 'en' | 'hi') || 'hi';

  const methods = useForm<PatientFormData>({
    resolver: zodResolver(PatientSchema),
    defaultValues: data as PatientFormData,
  });

  const { handleSubmit, reset, formState: { isSubmitting } } = methods;

  React.useEffect(() => {
    if (data) {
      reset(data as PatientFormData);
    }
  }, [data, reset]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-12 w-full pb-12">
        <IdentitySection 
          lang={lang} 
          readOnly={readOnly} 
        />

        <MedicalSection 
          lang={lang} 
          readOnly={readOnly} 
        />

        <SupportSection 
          lang={lang} 
          readOnly={readOnly} 
        />

        {!readOnly && (
          <div className="flex justify-end gap-3 pt-12 border-t border-neutral-100">
            {onCancel && (
              <Button 
                type="button"
                variant="outline" 
                onClick={onCancel} 
                className="rounded-xl h-12 px-8 text-sm font-bold border-neutral-200 hover:bg-neutral-50"
              >
                {cancelLabel}
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="rounded-xl h-12 px-10 text-sm font-bold shadow-xl shadow-primary/20 bg-primary hover:scale-[1.02] transition-transform"
            >
              <MapPin className="w-4 h-4 mr-2" />
              {submitLabel}
            </Button>
          </div>
        )}
      </form>
    </FormProvider>
  );
}
