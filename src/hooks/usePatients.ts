import { useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { PatientStatus } from '../types';
import { useAuth } from './useAuth';
import { useStore, useUnifiedPatients, useSyncStatus } from '../store/useStore';

interface UsePatientsOptions {
  status?: PatientStatus;
  limit?: number;
  realtime?: boolean;
}

export function usePatients(options: UsePatientsOptions = {}) {
  const { profile } = useAuth();
  const loading = useStore(state => state.loading);
  const fetchPatients = useStore(state => state.fetchPatients);
  const unifiedPatients = useUnifiedPatients(profile?.assigned_districts || []);
  const { isSyncing, pendingCount } = useSyncStatus();
  const lastFetched = useStore(state => state.lastFetched);

  const refresh = useCallback(() => {
    fetchPatients();
  }, [fetchPatients]);

  useEffect(() => {
    if (profile) {
      // Only fetch if we don't have data or data is old (e.g. more than 5 mins)
      const shouldFetch = !lastFetched || (new Date().getTime() - new Date(lastFetched).getTime() > 5 * 60 * 1000);
      if (shouldFetch) {
        refresh();
      }
    }

    if (options.realtime) {
      const channel = supabase
        .channel('patients-sync')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'patient_visits' },
          () => {
            refresh();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [refresh, options.realtime, !!profile, lastFetched]);

  // Apply local filtering for status and limit
  let filtered = unifiedPatients;
  if (options.status) {
    filtered = filtered.filter(p => p.status === options.status);
  }
  if (options.limit) {
    filtered = filtered.slice(0, options.limit);
  }

  return {
    patients: filtered,
    loading,
    refresh,
    isSyncing,
    pendingCount,
    isOffline: !navigator.onLine,
  };
}
