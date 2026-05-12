import * as React from 'react';
import { supabase } from '../lib/supabase';
import { Patient, VisitHistoryItem } from '../types';
import { useStore } from '../store/useStore';

export function usePatientHistory(patient: Patient | null) {
  const [history, setHistory] = React.useState<VisitHistoryItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const pendingSync = useStore(state => state.pendingSync);

  React.useEffect(() => {
    async function fetchHistory() {
      const masterId = patient?.master_patient_id || patient?.id;
      
      if (!masterId) {
        setHistory([]);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // 1. Fetch from Supabase
        const { data: serverData, error: fetchError } = await supabase
          .from('patient_visits')
          .select(`
            id, created_at, status, consultant_advice, symptoms, 
            registrar_name, consultant_name, meal_distributor_name, 
            meal_required, meal_served_at, medication_hydroxyurea, 
            medication_folic_acid, nutrition_kit_distributed,
            consultant_image_url, meal_image_url
          `)
          .eq('patient_id', masterId)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        // 2. Filter local pending items for THIS patient
        const localPending = pendingSync
          .filter(item => {
            const itemMasterId = item.data?.master_patient_id || item.id;
            return itemMasterId === masterId;
          })
          .map(item => ({
            ...item.data,
            id: item.id,
            created_at: item.timestamp,
            is_offline_pending: true
          } as VisitHistoryItem));

        // 3. Merge and deduplicate (favoring local for pending updates)
        const combined = [...localPending, ...(serverData || [])]
          .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i)
          .sort((a, b) => new Date(b.created_at || Date.now()).getTime() - new Date(a.created_at || Date.now()).getTime());

        setHistory(combined);
      } catch (err: any) {
        console.error("Error fetching patient history:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [patient?.id, patient?.master_patient_id, pendingSync.length]);

  return { history, loading, error };
}
