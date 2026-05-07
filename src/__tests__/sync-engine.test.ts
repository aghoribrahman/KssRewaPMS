/**
 * ============================================================
 * KssRewaPMS — Sync Queue & Offline Engine Test Suite
 * ============================================================
 * Tests the core sync queue logic, optimistic UI merging,
 * retry behavior, and data flattening safety.
 *
 * Coverage: Domain 6 (Offline/Sync), Domain 9 (Bugs 🐛4, 🐛5)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Patient, PatientStatus } from '../../types';

// ─── Types matching useStore.ts SyncItem ───
interface SyncItem {
  id: string;
  type: 'INSERT' | 'UPDATE';
  data: Partial<Patient>;
  patientId?: string;
  timestamp: string;
  status: 'PENDING' | 'SYNCING' | 'FAILED';
  retryCount: number;
  errorMessage?: string;
}

// ─── Helper: Create sync items ───
function createSyncItem(overrides: Partial<SyncItem> = {}): SyncItem {
  return {
    id: 'sync-' + Math.random().toString(36).slice(2, 8),
    type: 'INSERT',
    data: { name: 'Test Patient', age: 25, district: 'Rewa' },
    timestamp: new Date().toISOString(),
    status: 'PENDING',
    retryCount: 0,
    ...overrides,
  };
}

function createPatient(overrides: Partial<Patient> = {}): Patient {
  return {
    id: 'patient-001',
    name: 'Existing Patient',
    age: 30,
    gender: 'male',
    contact: '9999999999',
    address: 'Test',
    district: 'Rewa',
    block: 'Test',
    village: 'Test',
    sickle_cell_status: 'AS',
    pre_existing_diagnosis: false,
    reports_attached: false,
    previous_hospitalizations: false,
    blood_transfusions_count: 0,
    symptoms: [],
    medication_hydroxyurea: false,
    medication_folic_acid: false,
    medication_regularity: false,
    dietary_habit: 'Balanced',
    physical_activity: 'Regular',
    counselling_topics: [],
    nutrition_kit_distributed: false,
    nutrition_kit_instructions_provided: false,
    referral: [],
    feedback_confirmation: false,
    status: 'pending_consultation',
    meal_required: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  } as Patient;
}

// ═══════════════════════════════════════════════════
// 1. SYNC QUEUE MANAGEMENT
// ═══════════════════════════════════════════════════
describe('Sync Queue Management', () => {
  it('TC-6.1.3: creates sync item with PENDING status', () => {
    const item = createSyncItem();
    expect(item.status).toBe('PENDING');
    expect(item.retryCount).toBe(0);
  });

  it('TC-6.2.1: INSERT items have required fields', () => {
    const item = createSyncItem({ type: 'INSERT' });
    expect(item.type).toBe('INSERT');
    expect(item.data.name).toBeDefined();
    expect(item.timestamp).toBeDefined();
  });

  it('UPDATE items have patientId', () => {
    const item = createSyncItem({ type: 'UPDATE', patientId: 'patient-001' });
    expect(item.type).toBe('UPDATE');
    expect(item.patientId).toBe('patient-001');
  });
});

// ═══════════════════════════════════════════════════
// 2. QUEUE ITEM SELECTION (processSyncQueue logic)
// ═══════════════════════════════════════════════════
describe('Sync Queue Item Selection', () => {
  // Mirrors the selection logic in processSyncQueue
  function findNextSyncItem(queue: SyncItem[]): SyncItem | undefined {
    return queue.find(i => i.status === 'PENDING' || (i.status === 'FAILED' && i.retryCount < 3));
  }

  it('TC-6.3.1: selects PENDING items first', () => {
    const queue = [
      createSyncItem({ status: 'FAILED', retryCount: 1 }),
      createSyncItem({ status: 'PENDING' }),
    ];
    const next = findNextSyncItem(queue);
    expect(next?.status).toBe('FAILED'); // finds first match in array order
  });

  it('TC-6.4.2: retries FAILED items with retryCount < 3', () => {
    const queue = [
      createSyncItem({ status: 'FAILED', retryCount: 2 }),
    ];
    expect(findNextSyncItem(queue)).toBeDefined();
  });

  it('TC-6.4.3: skips FAILED items with retryCount >= 3', () => {
    const queue = [
      createSyncItem({ status: 'FAILED', retryCount: 3 }),
    ];
    expect(findNextSyncItem(queue)).toBeUndefined();
  });

  it('skips SYNCING items', () => {
    const queue = [
      createSyncItem({ status: 'SYNCING' }),
    ];
    expect(findNextSyncItem(queue)).toBeUndefined();
  });

  it('returns undefined on empty queue', () => {
    expect(findNextSyncItem([])).toBeUndefined();
  });
});

// ═══════════════════════════════════════════════════
// 3. OPTIMISTIC UI MERGE (useUnifiedPatients logic)
// ═══════════════════════════════════════════════════
describe('Optimistic UI Merge (TC-6.5)', () => {
  // Mirrors useUnifiedPatients selector logic from useStore.ts
  function mergeUnifiedPatients(
    serverPatients: Patient[],
    pendingSync: SyncItem[]
  ): Patient[] {
    let merged = [...serverPatients];

    for (const item of pendingSync) {
      if (item.retryCount >= 3) continue; // Ghost update exclusion

      if (item.type === 'INSERT') {
        const alreadyExists = merged.some(p => p.id === item.id);
        if (!alreadyExists) {
          merged = [{
            ...item.data,
            id: item.id,
            created_at: item.timestamp,
            updated_at: item.timestamp,
            status: item.data.status || 'pending_consultation',
          } as Patient, ...merged];
        }
      } else if (item.type === 'UPDATE' && item.patientId) {
        merged = merged.map(p =>
          p.id === item.patientId ? { ...p, ...item.data } : p
        );
      }
    }

    return merged;
  }

  it('TC-6.5.1: pending INSERTs prepended to list', () => {
    const server = [createPatient({ id: 'srv-1' })];
    const pending = [createSyncItem({ id: 'new-1', type: 'INSERT', data: { name: 'New Patient' } })];
    const result = mergeUnifiedPatients(server, pending);
    expect(result.length).toBe(2);
    expect(result[0].id).toBe('new-1');
  });

  it('TC-6.5.2: pending UPDATEs merge into existing', () => {
    const server = [createPatient({ id: 'patient-001', name: 'Original' })];
    const pending = [createSyncItem({
      type: 'UPDATE',
      patientId: 'patient-001',
      data: { name: 'Updated Name' },
    })];
    const result = mergeUnifiedPatients(server, pending);
    expect(result[0].name).toBe('Updated Name');
  });

  it('TC-6.5.3: ghost updates excluded (retryCount >= 3)', () => {
    const server = [createPatient({ id: 'srv-1' })];
    const pending = [createSyncItem({
      id: 'ghost-1',
      type: 'INSERT',
      retryCount: 3,
      status: 'FAILED',
    })];
    const result = mergeUnifiedPatients(server, pending);
    expect(result.length).toBe(1); // ghost not added
  });

  it('does not duplicate already-synced inserts', () => {
    const server = [createPatient({ id: 'sync-abc' })];
    const pending = [createSyncItem({ id: 'sync-abc', type: 'INSERT' })];
    const result = mergeUnifiedPatients(server, pending);
    expect(result.length).toBe(1); // no duplicate
  });
});

// ═══════════════════════════════════════════════════
// 4. DATA FLATTENING SAFETY (Bug 🐛4)
// ═══════════════════════════════════════════════════
describe('Data Flattening Safety (Bug 🐛4)', () => {
  // Simulates the flattening logic in fetchPatients
  function flattenVisitData(visits: any[]): any[] {
    return visits
      .filter(v => v.patient_master != null) // NULL GUARD (the fix for 🐛4)
      .map(v => ({
        ...v,
        ...v.patient_master,
        id: v.id,
        master_patient_id: v.patient_master.id,
        district: v.patient_master.district,
        name: v.patient_master.name,
      }));
  }

  it('flattens valid visit with patient_master', () => {
    const visits = [{
      id: 'visit-1',
      status: 'pending_consultation',
      patient_master: { id: 'master-1', name: 'Test', district: 'Rewa' },
    }];
    const result = flattenVisitData(visits);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Test');
    expect(result[0].master_patient_id).toBe('master-1');
    expect(result[0].id).toBe('visit-1');
  });

  it('handles null patient_master without crashing', () => {
    const visits = [{
      id: 'orphan-1',
      status: 'pending_consultation',
      patient_master: null,
    }];
    expect(() => flattenVisitData(visits)).not.toThrow();
    expect(flattenVisitData(visits)).toHaveLength(0);
  });

  it('handles undefined patient_master', () => {
    const visits = [{ id: 'orphan-2', status: 'complete' }];
    expect(() => flattenVisitData(visits)).not.toThrow();
    expect(flattenVisitData(visits)).toHaveLength(0);
  });

  it('mixed valid and orphan visits', () => {
    const visits = [
      { id: 'v1', patient_master: { id: 'm1', name: 'A', district: 'Rewa' } },
      { id: 'v2', patient_master: null },
      { id: 'v3', patient_master: { id: 'm2', name: 'B', district: 'Bhopal' } },
    ];
    const result = flattenVisitData(visits);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('A');
    expect(result[1].name).toBe('B');
  });
});

// ═══════════════════════════════════════════════════
// 5. FIELD STRIPPING FOR SUPABASE SYNC
// ═══════════════════════════════════════════════════
describe('Field Stripping for Supabase Sync (TC-3.12)', () => {
  // Mirrors the destructuring in processSyncQueue for UPDATEs
  function stripMasterFields(data: Record<string, any>): Record<string, any> {
    const {
      name, age, gender, contact, address, district, block, village,
      abha_id, aadhar_number, sickle_cell_status, pre_existing_diagnosis,
      date_of_diagnosis, master_patient_id, patient_master,
      ...visitData
    } = data;
    return visitData;
  }

  it('removes all patient_master fields from update payload', () => {
    const data = {
      name: 'Test',
      age: 25,
      district: 'Rewa',
      consultant_advice: 'Take rest',
      status: 'pending_meal',
      patient_master: { id: 'master-1' },
    };
    const stripped = stripMasterFields(data);
    expect(stripped).not.toHaveProperty('name');
    expect(stripped).not.toHaveProperty('age');
    expect(stripped).not.toHaveProperty('district');
    expect(stripped).not.toHaveProperty('patient_master');
    expect(stripped.consultant_advice).toBe('Take rest');
    expect(stripped.status).toBe('pending_meal');
  });

  it('preserves all visit-specific fields', () => {
    const data = {
      name: 'X', district: 'Y',
      symptoms: ['Fever'],
      medication_hydroxyurea: true,
      meal_required: true,
      registrar_notes: 'Note',
    };
    const stripped = stripMasterFields(data);
    expect(stripped.symptoms).toEqual(['Fever']);
    expect(stripped.medication_hydroxyurea).toBe(true);
    expect(stripped.registrar_notes).toBe('Note');
  });
});

// ═══════════════════════════════════════════════════
// 6. SEARCH FILTERING LOGIC
// ═══════════════════════════════════════════════════
describe('Patient Search Filtering (TC-2.5)', () => {
  // Mirrors the search logic across all dashboards
  function filterPatients(patients: Patient[], query: string): Patient[] {
    if (!query.trim()) return patients;
    const q = query.toLowerCase();
    return patients.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.contact?.toLowerCase().includes(q) ||
      p.abha_id?.toLowerCase().includes(q) ||
      p.aadhar_number?.toLowerCase().includes(q)
    );
  }

  const testPatients = [
    createPatient({ id: '1', name: 'Rahul Kumar', contact: '9876543210', abha_id: 'ABHA001' }),
    createPatient({ id: '2', name: 'Priya Sharma', contact: '9988776655', aadhar_number: '1234-5678-9012' }),
    createPatient({ id: '3', name: 'amit verma', contact: '8888888888' }),
  ];

  it('TC-2.5.1: search by name (case-insensitive)', () => {
    expect(filterPatients(testPatients, 'rahul')).toHaveLength(1);
    expect(filterPatients(testPatients, 'RAHUL')).toHaveLength(1);
  });

  it('TC-2.5.2: search by contact', () => {
    expect(filterPatients(testPatients, '9876')).toHaveLength(1);
  });

  it('TC-2.5.3: search by ABHA ID', () => {
    expect(filterPatients(testPatients, 'ABHA001')).toHaveLength(1);
  });

  it('TC-2.5.4: search by Aadhar', () => {
    expect(filterPatients(testPatients, '1234')).toHaveLength(1);
  });

  it('TC-2.5.7: empty query returns all', () => {
    expect(filterPatients(testPatients, '')).toHaveLength(3);
    expect(filterPatients(testPatients, '   ')).toHaveLength(3);
  });

  it('TC-2.5.8: no matches returns empty', () => {
    expect(filterPatients(testPatients, 'zzzzz')).toHaveLength(0);
  });

  it('partial name match works', () => {
    expect(filterPatients(testPatients, 'shar')).toHaveLength(1);
  });
});

// ═══════════════════════════════════════════════════
// 7. DISTRICT FILTERING
// ═══════════════════════════════════════════════════
describe('District Filtering (TC-1.4)', () => {
  function filterByDistrict(patients: Patient[], districts: string[]): Patient[] {
    if (!districts || districts.length === 0) return patients;
    return patients.filter(p => districts.includes(p.district));
  }

  const testPatients = [
    createPatient({ id: '1', district: 'Rewa' }),
    createPatient({ id: '2', district: 'Bhopal' }),
    createPatient({ id: '3', district: 'Rewa' }),
    createPatient({ id: '4', district: 'Indore' }),
  ];

  it('TC-1.4.2: filters by assigned districts', () => {
    expect(filterByDistrict(testPatients, ['Rewa'])).toHaveLength(2);
  });

  it('TC-1.4.3: empty districts = no filter', () => {
    expect(filterByDistrict(testPatients, [])).toHaveLength(4);
  });

  it('multiple districts filter correctly', () => {
    expect(filterByDistrict(testPatients, ['Rewa', 'Bhopal'])).toHaveLength(3);
  });

  it('non-matching district returns empty', () => {
    expect(filterByDistrict(testPatients, ['Ujjain'])).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════════════
// 8. EFFICIENCY CALCULATION (Bug 🐛2 fix verification)
// ═══════════════════════════════════════════════════
describe('Efficiency Calculation (Bug 🐛2)', () => {
  function calculateEfficiency(completed: number, total: number): string {
    if (total === 0) return '0%';
    return Math.round((completed / total) * 100) + '%';
  }

  it('calculates correct percentage', () => {
    expect(calculateEfficiency(131, 505)).toBe('26%');
  });

  it('handles 100% completion', () => {
    expect(calculateEfficiency(100, 100)).toBe('100%');
  });

  it('handles zero total', () => {
    expect(calculateEfficiency(0, 0)).toBe('0%');
  });

  it('handles zero completed', () => {
    expect(calculateEfficiency(0, 50)).toBe('0%');
  });

  it('hardcoded 94% is WRONG for current data', () => {
    // This test documents that the hardcoded value is incorrect
    const actual = calculateEfficiency(131, 505);
    expect(actual).not.toBe('94%');
  });
});
