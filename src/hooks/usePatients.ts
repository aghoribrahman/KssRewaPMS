import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Patient, PatientStatus } from '../types';
import { useAuth } from './useAuth';

interface UsePatientsOptions {
  status?: PatientStatus;
  limit?: number;
  realtime?: boolean;
}

export function usePatients(options: UsePatientsOptions = {}) {
  const { profile } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPatients = useCallback(async () => {
    if (!profile) return;

    try {
      setLoading(true);
      let query = supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (options.status) {
        query = query.eq('status', options.status);
      }

      if (profile.role !== 'admin' && profile.assigned_districts && profile.assigned_districts.length > 0) {
        query = query.in('district', profile.assigned_districts);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPatients(data as Patient[]);
      setError(null);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [profile, options.status, options.limit, profile?.assigned_districts]);

  useEffect(() => {
    fetchPatients();

    if (options.realtime) {
      const channel = supabase
        .channel('patients-sync')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'patients' },
          () => {
            fetchPatients();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [fetchPatients, options.realtime]);

  return {
    patients,
    loading,
    error,
    refresh: fetchPatients,
  };
}
