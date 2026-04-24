import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';
import { Patient, UserProfile } from '../types';
import { supabase } from '../lib/supabase';

// Custom IndexedDB storage for Zustand to bypass 5MB localStorage limit
const idbStorage = {
  getItem: async (name: string) => (await get(name)) || null,
  setItem: async (name: string, value: any) => await set(name, value),
  removeItem: async (name: string) => await del(name),
};

interface SyncItem {
  id: string; // Internal transaction ID
  patientId?: string; // Supabase patient ID
  type: 'INSERT' | 'UPDATE';
  data: Partial<Patient>;
  timestamp: string;
  retryCount: number;
  status: 'PENDING' | 'SYNCING' | 'FAILED';
  error?: string;
}

interface AppState {
  // Auth Slice
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;

  // Patient Slice
  patients: Patient[];
  loading: boolean;
  lastFetched: string | null;
  setPatients: (patients: Patient[]) => void;
  
  // Sync Slice
  pendingSync: SyncItem[];
  addToSyncQueue: (type: 'INSERT' | 'UPDATE', data: Partial<Patient>, patientId?: string) => void;
  removeFromSync: (id: string) => void;
  updateSyncStatus: (id: string, status: SyncItem['status'], error?: string) => void;

  // Actions
  fetchPatients: (districtFilter?: string[]) => Promise<void>;
  processSyncQueue: () => Promise<void>;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth
      profile: null,
      setProfile: (profile) => set({ profile }),

      // Patients
      patients: [],
      loading: false,
      lastFetched: null,
      setPatients: (patients) => set({ patients, lastFetched: new Date().toISOString() }),

      // Sync
      pendingSync: [],
      addToSyncQueue: (type, data, patientId) => {
        const newItem: SyncItem = {
          id: crypto.randomUUID(),
          patientId,
          type,
          data,
          timestamp: new Date().toISOString(),
          retryCount: 0,
          status: 'PENDING',
        };
        set((state) => ({ 
          pendingSync: [...state.pendingSync, newItem] 
        }));
        
        // Trigger sync process immediately if online
        if (navigator.onLine) {
          get().processSyncQueue();
        }
      },

      removeFromSync: (id) => set((state) => ({
        pendingSync: state.pendingSync.filter(i => i.id !== id)
      })),

      updateSyncStatus: (id, status, error) => set((state) => ({
        pendingSync: state.pendingSync.map(i => 
          i.id === id ? { ...i, status, error, retryCount: status === 'FAILED' ? i.retryCount + 1 : i.retryCount } : i
        )
      })),

      // Logic
      fetchPatients: async (districtFilter) => {
        set({ loading: true });
        try {
          let query = supabase.from('patients').select('*').order('updated_at', { ascending: false });
          if (districtFilter && districtFilter.length > 0) {
            query = query.in('district', districtFilter);
          }
          const { data, error } = await query;
          if (error) throw error;
          set({ patients: data as Patient[], loading: false });
        } catch (err) {
          console.error('Fetch failed:', err);
          set({ loading: false });
        }
      },

      processSyncQueue: async () => {
        const { pendingSync, updateSyncStatus, removeFromSync } = get();
        const nextItem = pendingSync.find(i => i.status === 'PENDING' || (i.status === 'FAILED' && i.retryCount < 3));
        
        if (!nextItem || !navigator.onLine) return;

        updateSyncStatus(nextItem.id, 'SYNCING');

        try {
          let error;
          if (nextItem.type === 'INSERT') {
            const { error: err } = await supabase.from('patients').insert([{
              ...nextItem.data,
              created_at: nextItem.timestamp,
              updated_at: new Date().toISOString(),
              last_transaction_id: nextItem.id, // ID of the sync transaction
            }]);
            error = err;
          } else {
            const { error: err } = await supabase.from('patients')
              .update({ 
                ...nextItem.data, 
                updated_at: new Date().toISOString(),
                last_transaction_id: nextItem.id 
              })
              .eq('id', nextItem.patientId);
            error = err;
          }

          if (error) throw error;
          
          removeFromSync(nextItem.id);
          // Recurse to process next item
          get().processSyncQueue();
        } catch (err: any) {
          console.error('Sync failed for item:', nextItem.id, err);
          updateSyncStatus(nextItem.id, 'FAILED', err.message);
        }
      },
    }),
    {
      name: 'kss-pms-storage',
      storage: createJSONStorage(() => idbStorage),
      partialize: (state) => ({ 
        profile: state.profile, 
        patients: state.patients, 
        pendingSync: state.pendingSync 
      }), // Only persist critical data
    }
  )
);

/**
 * Selector that merges server-side patients with pending local updates/inserts
 * to provide a 100% optimistic UI experience.
 */
export const useUnifiedPatients = () => {
  const patients = useStore((state) => state.patients);
  const pendingSync = useStore((state) => state.pendingSync);

  // 1. Start with the server patients
  let unified = [...patients];

  // 2. Apply pending updates
  pendingSync.filter(i => i.type === 'UPDATE').forEach(update => {
    const idx = unified.findIndex(p => p.id === update.patientId);
    if (idx !== -1) {
      unified[idx] = { ...unified[idx], ...update.data };
    }
  });

  // 3. Prepended pending inserts
  const pendingInserts = pendingSync
    .filter(i => i.type === 'INSERT')
    .map(insert => ({
      ...insert.data,
      id: insert.id, // Temporary ID
      created_at: insert.timestamp,
      status: insert.data.status || 'pending_consultation',
    } as Patient));

  return [...pendingInserts, ...unified];
};

export const useSyncStatus = () => {
  const pendingSync = useStore((state) => state.pendingSync);
  const isSyncing = pendingSync.some(i => i.status === 'SYNCING');
  const pendingCount = pendingSync.filter(i => i.status === 'PENDING').length;
  const failedCount = pendingSync.filter(i => i.status === 'FAILED').length;

  return { isSyncing, pendingCount, failedCount };
};

function nextDate() {
    return new Date();
}
