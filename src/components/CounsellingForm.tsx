import * as React from 'react';
import { Patient } from '../types';
import { Button } from '@/components/ui/button';
import { MapPin, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
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
  onContactChange?: (contact: string) => void;
  submitLabel?: string;
  cancelLabel?: string;
  readOnly?: boolean;
  disabledFields?: string[];
}

export function CounsellingForm({ 
  data, 
  onSubmit = () => {}, 
  onCancel, 
  onContactChange,
  submitLabel = 'Confirm Registration',
  cancelLabel = 'Cancel',
  readOnly = false,
  disabledFields = []
}: CounsellingFormProps) {
  const { profile } = useAuth();
  const lang = (profile?.preferred_language as 'en' | 'hi') || 'hi';

  const methods = useForm<PatientFormData>({
    resolver: zodResolver(PatientSchema),
    defaultValues: data as PatientFormData,
  });

  const { handleSubmit, reset, watch, formState: { isSubmitting, errors } } = methods;
  const contact = watch('contact');
  const lastContactRef = React.useRef(contact);

  // Notify parent of contact changes for duplicate detection
  React.useEffect(() => {
    if (onContactChange && contact !== lastContactRef.current) {
      onContactChange(contact || '');
      lastContactRef.current = contact;
    }
  }, [contact, onContactChange]);

  // Handle external data updates (e.g. from auto-fill)
  React.useEffect(() => {
    if (data) {
      const currentValues = methods.getValues();
      // Only reset if significant data changed from outside (like auto-fill results)
      // We check name and master_patient_id as they are key indicators of a found record
      const hasSignificantChange = 
        data.name !== currentValues.name || 
        data.master_patient_id !== currentValues.master_patient_id;

      if (hasSignificantChange) {
        reset(data as PatientFormData);
      }
    }
    // We only want to trigger this when the data object changes from the parent
    // but we use individual fields in dependencies for stability if needed.
    // However, [data] is correct here as it represents the "new state" from parent.
  }, [data, reset]);

  // Report validation errors to the user
  const onInvalid = React.useCallback((errors: any) => {
    console.error('Form Validation Errors:', errors);
    const errorFields = Object.keys(errors);
    if (errorFields.length > 0) {
      toast.error(
        lang === 'en' 
          ? `Please check the following fields: ${errorFields.join(', ')}` 
          : `कृपया इन क्षेत्रों की जांच करें: ${errorFields.join(', ')}`,
        { icon: <AlertCircle className="w-5 h-5 text-red-500" /> }
      );
    }
  }, [lang]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-12 w-full pb-12">
        <IdentitySection 
          lang={lang} 
          readOnly={readOnly} 
          disabledFields={disabledFields}
        />

        <MedicalSection 
          lang={lang} 
          readOnly={readOnly} 
          disabledFields={disabledFields}
        />

        <SupportSection 
          lang={lang} 
          readOnly={readOnly} 
          disabledFields={disabledFields}
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
