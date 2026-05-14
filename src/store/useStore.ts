import { create } from 'zustand';
import { useMemo } from 'react';
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

interface ErrorLogItem {
  id: string;
  userId?: string | null;
  message: string;
  stack?: string | null;
  componentStack?: string | null;
  deviceInfo: any;
  appState?: any;
  breadcrumbs?: any[];
  timestamp: string;
  retryCount: number;
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
  pendingErrors: ErrorLogItem[];
  addToSyncQueue: (type: 'INSERT' | 'UPDATE', data: Partial<Patient>, patientId?: string) => void;
  addToErrorQueue: (error: Omit<ErrorLogItem, 'id' | 'timestamp' | 'retryCount'>) => void;
  removeFromSync: (id: string) => void;
  removeFromErrors: (id: string) => void;
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

      pendingErrors: [],
      addToErrorQueue: (log) => {
        const newItem: ErrorLogItem = {
          ...log,
          id: generateUUID(),
          timestamp: new Date().toISOString(),
          retryCount: 0,
        };
        set((state) => ({
          pendingErrors: [...state.pendingErrors, newItem]
        }));
        
        if (navigator.onLine) {
          get().processSyncQueue();
        }
      },

      removeFromSync: (id) => set((state) => ({
        pendingSync: state.pendingSync.filter(i => i.id !== id)
      })),

      removeFromErrors: (id) => set((state) => ({
        pendingErrors: state.pendingErrors.filter(i => i.id !== id)
      })),

      updateSyncStatus: (id, status, error) => set((state) => ({
        pendingSync: state.pendingSync.map(i => 
          i.id === id ? { ...i, status, error, retryCount: status === 'FAILED' ? i.retryCount + 1 : i.retryCount } : i
        )
      })),

      // Logic
      fetchPatients: async () => {
        set({ loading: true });
        try {
          // Query the new visits table and join with master
          // We fetch everything to support offline filtering later
          const { data, error } = await supabase
            .from('patient_visits')
            .select('*, patient_master(*)')
            .order('created_at', { ascending: false })
            .limit(200); // Senior Fix: Prevent unbounded memory growth
            
          if (error) throw error;
          
          // Compute visit counts per master record from the fetched dataset
          const visitCounts: Record<string, number> = {};
          (data as any[]).forEach(v => {
            const master = Array.isArray(v.patient_master) ? v.patient_master[0] : v.patient_master;
            if (master && master.id) {
              visitCounts[master.id] = (visitCounts[master.id] || 0) + 1;
            }
          });

          // Flatten the data to match the legacy 'Patient' interface for the UI components
          const flattenedData = (data as any[]).map(v => {
            // Defensive check for patient_master (could be object or array depending on PostgREST version/schema)
            const master = Array.isArray(v.patient_master) ? v.patient_master[0] : v.patient_master;
            
            if (!master) {
              console.warn(`Visit ${v.id} has no associated patient_master record.`);
              return v;
            }

            return {
              ...v,
              ...master,
              id: v.id, // Keep the visit ID as the primary ID for the UI
              master_patient_id: master.id,
              visit_count: visitCounts[master.id] || 1,
              district: master.district,
              name: master.name,
              contact: master.contact,
              age: master.age,
              gender: master.gender,
              address: master.address,
              block: master.block,
              village: master.village,
              abha_id: master.abha_id,
              aadhar_number: master.aadhar_number,
              sickle_cell_status: master.sickle_cell_status,
              pre_existing_diagnosis: master.pre_existing_diagnosis,
              date_of_diagnosis: master.date_of_diagnosis
            };
          });

          set({ patients: flattenedData as Patient[], lastFetched: new Date().toISOString(), loading: false });
        } catch (err) {
          console.error('Fetch failed:', err);
          set({ loading: false });
        }
      },

      processSyncQueue: async () => {
        const { pendingSync, pendingErrors, updateSyncStatus, removeFromSync, removeFromErrors } = get();
        
        if (!navigator.onLine) return;

        // 1. Process pending error logs first (high priority observability)
        const nextError = pendingErrors.find(e => e.retryCount < 3);
        if (nextError) {
          try {
            const { error } = await supabase.from('app_errors').insert({
              user_id: nextError.userId || null,
              error_message: nextError.message,
              error_stack: nextError.stack || null,
              component_stack: nextError.componentStack || null,
              device_info: (nextError.deviceInfo || null) as any,
              app_state_snapshot: (nextError.appState || null) as any,
            });
            if (!error) {
              removeFromErrors(nextError.id);
            } else {
              throw error;
            }
          } catch (err) {
            console.error('Failed to sync error log:', err);
            set((state) => ({
              pendingErrors: state.pendingErrors.map(e => 
                e.id === nextError.id ? { ...e, retryCount: e.retryCount + 1 } : e
              )
            }));
          }
          // Continue to next item after a small delay
          setTimeout(() => get().processSyncQueue(), 500);
          return;
        }

        // 2. Process pending patient data
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
            // Senior Engineer Fix: Explicitly filter only valid patient_visits columns to prevent 400 Bad Request
            // from "polluted" flattened objects in the sync queue.
            const allowedColumns = [
              'status', 'symptoms', 'other_symptoms', 'consultant_advice', 'consultant_image_url',
              'consultant_id', 'consultant_name', 'meal_distributor_id', 'meal_distributor_name',
              'meal_distributor_notes', 'meal_image_url', 'meal_served_at', 'meal_required',
              'reports_attached', 'registrar_notes', 'registrar_image_url', 'registrar_id',
              'registrar_name', 'counselling_topics', 'specific_concerns', 'counsellor_name',
              'counsellor_designation', 'counsellor_organization', 'last_transaction_id',
              'first_symptom_onset', 'previous_hospitalizations', 'blood_transfusions_count',
              'other_health_issues', 'medication_hydroxyurea', 'dosage_hydroxyurea',
              'medication_folic_acid', 'dosage_folic_acid', 'other_medications',
              'medication_regularity', 'dietary_habit', 'daily_water_intake', 'physical_activity',
              'referral', 'feedback_confirmation', 'weight', 'bp'
            ];

            const masterColumns = [
              'name', 'age', 'gender', 'contact', 'address', 'district', 'block', 'village',
              'abha_id', 'aadhar_number', 'sickle_cell_status', 'pre_existing_diagnosis',
              'date_of_diagnosis'
            ];

            const filteredVisitData: any = {};
            allowedColumns.forEach(col => {
              if (nextItem.data[col as keyof Patient] !== undefined) {
                filteredVisitData[col] = nextItem.data[col as keyof Patient];
              }
            });

            const filteredMasterData: any = {};
            masterColumns.forEach(col => {
              if (nextItem.data[col as keyof Patient] !== undefined) {
                filteredMasterData[col] = nextItem.data[col as keyof Patient];
              }
            });

            if (!nextItem.patientId) {
              throw new Error('Missing patient ID for update');
            }

            // 1. Update Visit Record
            const { error: updateErr, status: respStatus } = await supabase.from('patient_visits')
              .update({ 
                ...filteredVisitData, 
                updated_at: new Date().toISOString(),
                last_transaction_id: nextItem.id 
              })
              .eq('id', nextItem.patientId as string);
              
            // If the record no longer exists (e.g. after a purge), remove it from sync silently
            if (respStatus === 204 || respStatus === 200) {
                // Success
            } else if (updateErr && updateErr.code === 'PGRST116') {
                console.warn('Record not found during sync, removing from queue:', nextItem.patientId);
                removeFromSync(nextItem.id);
                return;
            }
            
            if (updateErr) throw updateErr;

            // 2. Update Master Record if master data present and we have master_patient_id
            const masterId = nextItem.data.master_patient_id;
            if (Object.keys(filteredMasterData).length > 0 && masterId) {
              const { error: masterErr } = await supabase.from('patient_master')
                .update({
                  ...filteredMasterData,
                  updated_at: new Date().toISOString()
                })
                .eq('id', masterId);
              
              if (masterErr) {
                console.error('Failed to update master record during sync:', masterErr);
                // We don't fail the whole sync if master fails, but we log it
                // Actually, maybe we should throw to retry?
                throw masterErr;
              }
            }
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
          let errorMessage = err.message || 'Unknown sync error';
          if (errorMessage.includes('PGRST116') || errorMessage.includes('not found')) {
            errorMessage = 'Record not found on server / deleted.';
          } else if (errorMessage.includes('invalid input syntax')) {
            errorMessage = 'Invalid data format provided.';
          } else if (errorMessage.includes('uq_patient_master')) {
            errorMessage = 'Duplicate patient record detected.';
          }
          updateSyncStatus(nextItem.id, 'FAILED', errorMessage);
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
        pendingSync: state.pendingSync,
        pendingErrors: state.pendingErrors 
      }), // Only persist critical data
    }
  )
);

/**
 * Selector that merges server-side patients with pending local updates/inserts
 * to provide a 100% optimistic UI experience.
 * Memoized to prevent redundant calculations on re-renders.
 */
export const useUnifiedPatients = (districtFilter?: string[]) => {
  const patients = useStore((state) => state.patients);
  const pendingSync = useStore((state) => state.pendingSync);

  return useMemo(() => {
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

    let result = [...pendingInserts, ...unified];

    // 4. Apply district filtering globally to both synced and pending data
    if (districtFilter && districtFilter.length > 0) {
      result = result.filter(p => p.district && districtFilter.includes(p.district));
    }

    return result;
  }, [patients, pendingSync, districtFilter]);
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
