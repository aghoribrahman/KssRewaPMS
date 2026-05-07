import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Patient } from '../types';

/**
 * Custom hook to fetch visit history for a specific patient.
 */
export function usePatientHistory(patient: Patient | null) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      const masterId = patient?.master_patient_id || patient?.id;
      
      if (!masterId) {
        setHistory([]);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from('patient_visits')
          .select('id, created_at, status, consultant_advice, symptoms, registrar_name, consultant_name, meal_distributor_name, meal_required, meal_served_at, medication_hydroxyurea, medication_folic_acid, nutrition_kit_distributed')
          .eq('patient_id', masterId)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setHistory(data || []);
      } catch (err: any) {
        console.error("Error fetching patient history:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [patient?.id, patient?.master_patient_id]);

  return { history, loading, error };
}
