import { useState } from 'react';
import { Patient } from '../types';
import { usePatientActions } from './usePatientActions';
import { useTranslation } from './useTranslation';
import { toast } from 'sonner';

export function useDashboardHelper() {
  const { lang, t } = useTranslation();
  const { updatePatientRecord } = usePatientActions();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const handleUpdatePatient = async (data: any) => {
    if (!selectedPatient) return;
    try {
      await updatePatientRecord(selectedPatient.id, data);
      toast.success(lang === 'en' ? "Record updated successfully" : "रिकॉर्ड सफलतापूर्वक अपडेट किया गया");
      setSelectedPatient(prev => prev ? { ...prev, ...data } : null);
    } catch (error) {
      toast.error(lang === 'en' ? "Failed to update record" : "रिकॉर्ड अपडेट करने में विफल");
    }
  };

  const closeDialog = () => setSelectedPatient(null);

  return {
    selectedPatient,
    setSelectedPatient,
    handleUpdatePatient,
    closeDialog,
    lang,
    t
  };
}
