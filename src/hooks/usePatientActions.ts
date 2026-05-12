import { useStore } from '../store/useStore';
import { useAuth } from './useAuth';
import { Patient } from '../types';

export function usePatientActions() {
  const addToSyncQueue = useStore(state => state.addToSyncQueue);
  const { user, profile } = useAuth();

  const systemMetadata = {
    app_version: '2.4.0-enterprise',
    device_id: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
  };

  const registerPatient = (data: Partial<Patient>) => {
    addToSyncQueue('INSERT', {
      ...data,
      registrar_id: user?.id || null,
      registrar_name: profile?.display_name || null,
      ...systemMetadata
    });
  };

  const consultPatient = (patient: Patient, advice: string, imageUrl?: string) => {
    const nextStatus = patient.meal_required ? 'pending_meal' : 'complete';
    
    // Create a clean data object without joining fields
    const { patient_master, ...cleanPatient } = patient as any;

    addToSyncQueue('UPDATE', {
      ...cleanPatient,
      consultant_advice: advice,
      consultant_image_url: imageUrl || null,
      status: nextStatus,
      consultant_id: user?.id || null,
      consultant_name: profile?.display_name || null,
      ...systemMetadata
    }, patient.id);
  };

  const serveMeal = (patient: Patient, notes: string, imageUrl?: string) => {
    addToSyncQueue('UPDATE', {
      status: 'complete',
      meal_image_url: imageUrl || null,
      meal_distributor_notes: notes || '',
      meal_distributor_id: user?.id || null,
      meal_distributor_name: profile?.display_name || null,
      meal_served_at: new Date().toISOString(),
      ...systemMetadata
    }, patient.id);
  };

  const updatePatientRecord = (patientId: string, data: Partial<Patient>) => {
    // Create a clean data object without joining fields
    const { patient_master, ...cleanData } = data as any;

    addToSyncQueue('UPDATE', {
      ...cleanData,
      ...systemMetadata
    }, patientId);
  };

  const rejectPatient = (patient: Patient, reason: string) => {
    const { patient_master, ...cleanPatient } = patient as any;
    addToSyncQueue('UPDATE', {
      ...cleanPatient,
      status: 'needs_correction',
      consultant_advice: reason,
      consultant_id: user?.id || null,
      consultant_name: profile?.display_name || null,
      ...systemMetadata
    }, patient.id);
  };

  const escalatePatient = (patient: Patient, reason: string) => {
    const { patient_master, ...cleanPatient } = patient as any;
    addToSyncQueue('UPDATE', {
      ...cleanPatient,
      status: 'escalated',
      consultant_advice: reason,
      consultant_id: user?.id || null,
      consultant_name: profile?.display_name || null,
      ...systemMetadata
    }, patient.id);
  };

  return { registerPatient, consultPatient, serveMeal, updatePatientRecord, rejectPatient, escalatePatient };
}
