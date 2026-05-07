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
          id: generateUUID(),
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
          // Query the new visits table and join with master
          let query = supabase.from('patient_visits').select('*, patient_master(*)').order('created_at', { ascending: false });
          
          // Note: District is now on patient_master, so we need to filter on the joined table
          // In Supabase, filtering joined tables requires inner join syntax if filtering out parents
          // For simplicity in offline mode, we'll fetch all and filter in memory if district filter is present
          const { data, error } = await query;
          if (error) throw error;
          
          // Flatten the data to match the legacy 'Patient' interface for the UI components
          let flattenedData = (data as any[]).map(v => ({
            ...v,
            ...v.patient_master,
            id: v.id, // Keep the visit ID as the primary ID for the UI
            master_patient_id: v.patient_master.id,
            district: v.patient_master.district,
            name: v.patient_master.name,
            contact: v.patient_master.contact,
            age: v.patient_master.age,
            gender: v.patient_master.gender,
            address: v.patient_master.address,
            block: v.patient_master.block,
            village: v.patient_master.village,
            abha_id: v.patient_master.abha_id,
            aadhar_number: v.patient_master.aadhar_number,
            sickle_cell_status: v.patient_master.sickle_cell_status,
            pre_existing_diagnosis: v.patient_master.pre_existing_diagnosis,
            date_of_diagnosis: v.patient_master.date_of_diagnosis
          }));

          // Apply district filter in memory since joining with filter is complex in simple JS
          if (districtFilter && districtFilter.length > 0) {
            flattenedData = flattenedData.filter(p => districtFilter.includes(p.district));
          }

          set({ patients: flattenedData as Patient[], loading: false });
        } catch (err) {
          console.error('Fetch failed:', err);
          set({ loading: false });
        }
      },

      processSyncQueue: async () => {
        const { pendingSync, updateSyncStatus, removeFromSync } = get();
        
        // Basic check before entering loop
        if (!navigator.onLine) return;

        // Process one item at a time to maintain order and prevent race conditions
        const nextItem = pendingSync.find(i => i.status === 'PENDING' || (i.status === 'FAILED' && i.retryCount < 3));
        
        if (!nextItem) return;

        // Immediately mark as SYNCING in the state to prevent double-processing
        updateSyncStatus(nextItem.id, 'SYNCING');

        try {
          let error;
          
          if (nextItem.type === 'INSERT') {
            // Use the atomic RPC to register patient and visit in a single transaction
            const { name, age, gender, contact, address, district, block, village,
                    abha_id, aadhar_number, sickle_cell_status, pre_existing_diagnosis, 
                    date_of_diagnosis, master_patient_id, ...visitData } = nextItem.data as any;

            const masterData = { 
              id: master_patient_id, name, age, gender, contact, address, 
              district, block, village, abha_id, aadhar_number, 
              sickle_cell_status, pre_existing_diagnosis, date_of_diagnosis 
            };

            const { error: rpcErr } = await supabase.rpc('register_patient_visit', {
              p_master: masterData,
              p_visit: visitData,
              p_visit_id: nextItem.id,
              p_timestamp: nextItem.timestamp
            });
            
            error = rpcErr;
          } else {
            // It's an UPDATE.
            const { name, age, gender, contact, address, district, block, village,
                    abha_id, aadhar_number, sickle_cell_status, pre_existing_diagnosis, 
                    date_of_diagnosis, master_patient_id, patient_master, ...visitData } = nextItem.data as any;

            const { error: updateErr } = await supabase.from('patient_visits')
              .update({ 
                ...visitData, 
                updated_at: new Date().toISOString(),
                last_transaction_id: nextItem.id 
              })
              .eq('id', nextItem.patientId);
              
            error = updateErr;
          }

          if (error) throw error;
          
          // Apply changes to local cache for smooth transition
          if (nextItem.type === 'UPDATE') {
            set((state) => ({
              patients: state.patients.map(p => 
                p.id === nextItem.patientId ? { ...p, ...nextItem.data } : p
              )
            }));
          }

          removeFromSync(nextItem.id);
          
          // Trigger next item processing
          setTimeout(() => get().processSyncQueue(), 0);
        } catch (err: any) {
          console.error('Sync failed for item:', nextItem.id, err);
          updateSyncStatus(nextItem.id, 'FAILED', err.message);
          // Don't loop infinitely on failure
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

  // 2. Apply pending updates (exclude permanently failed ghost updates)
  pendingSync
    .filter(i => i.type === 'UPDATE' && !(i.status === 'FAILED' && i.retryCount >= 3))
    .forEach(update => {
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

function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
