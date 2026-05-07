/**
 * ============================================================
 * KssRewaPMS — Performance & Stress Test Suite
 * ============================================================
 * Benchmarks core logic with large datasets to ensure 
 * the application remains responsive under load.
 *
 * Coverage: Search, State Merging, and Validation Speed
 */
import { describe, it, expect } from 'vitest';
import type { Patient, PatientStatus } from '../../types';

// ─── Helper: Generate large dataset ───
function generateLargeDataset(count: number): Patient[] {
  const patients: Patient[] = [];
  for (let i = 0; i < count; i++) {
    patients.push({
      id: `p-${i}`,
      name: `Patient ${i} Name`,
      age: 20 + (i % 50),
      gender: i % 2 === 0 ? 'male' : 'female',
      contact: `98765${String(i).padStart(5, '0')}`,
      address: 'Test Address ' + i,
      district: i % 5 === 0 ? 'Rewa' : 'Satna',
      block: 'Block',
      village: 'Village',
      sickle_cell_status: 'AS',
      status: i % 3 === 0 ? 'pending_consultation' : 'complete',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Patient);
  }
  return patients;
}

// ═══════════════════════════════════════════════════
// 1. SEARCH PERFORMANCE BENCHMARK
// ═══════════════════════════════════════════════════
describe('Search Performance (Stress Test)', () => {
  const LARGE_DATASET = generateLargeDataset(10000); // 10,000 patients

  it('searches 10k patients in under 50ms', () => {
    const query = 'Patient 999';
    const start = performance.now();
    
    const results = LARGE_DATASET.filter(p => 
      p.name?.toLowerCase().includes(query.toLowerCase()) ||
      p.contact?.includes(query)
    );
    
    const end = performance.now();
    const duration = end - start;
    
    console.log(`[PERF] Search 10k items took: ${duration.toFixed(2)}ms`);
    expect(results.length).toBeGreaterThan(0);
    expect(duration).toBeLessThan(50); // Hard threshold for responsiveness
  });

  it('filters 10k patients by district in under 10ms', () => {
    const start = performance.now();
    const results = LARGE_DATASET.filter(p => p.district === 'Rewa');
    const end = performance.now();
    const duration = end - start;
    
    console.log(`[PERF] District filter 10k items took: ${duration.toFixed(2)}ms`);
    expect(results.length).toBe(2000);
    expect(duration).toBeLessThan(10);
  });
});

// ═══════════════════════════════════════════════════
// 2. STATE MERGE PERFORMANCE (Optimistic UI)
// ═══════════════════════════════════════════════════
describe('State Merge Performance', () => {
  const serverPatients = generateLargeDataset(5000);
  const pendingSync = Array.from({ length: 100 }, (_, i) => ({
    id: `sync-${i}`,
    type: 'UPDATE',
    patientId: `p-${i}`,
    data: { name: `Updated ${i}` },
    retryCount: 0,
    status: 'PENDING',
    timestamp: new Date().toISOString()
  }));

  it('merges 5k server items + 100 sync items in under 30ms', () => {
    const start = performance.now();
    
    // Simulate useUnifiedPatients logic
    const merged = [...serverPatients];
    for (const item of pendingSync as any) {
      const idx = merged.findIndex(p => p.id === item.patientId);
      if (idx !== -1) {
        merged[idx] = { ...merged[idx], ...item.data };
      }
    }
    
    const end = performance.now();
    const duration = end - start;
    
    console.log(`[PERF] Unified Merge (5k+100) took: ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(30);
  });
});

// ═══════════════════════════════════════════════════
// 3. VALIDATION PERFORMANCE
// ═══════════════════════════════════════════════════
describe('Validation Performance', () => {
  it('validates a complex patient object in under 1ms', () => {
    const complexPatient = generateLargeDataset(1)[0];
    
    const start = performance.now();
    // Simulate typical field validation
    const errors = {
      name: !complexPatient.name,
      age: !complexPatient.age || complexPatient.age < 0,
      contact: !/^\d{10}$/.test(complexPatient.contact),
      district: !complexPatient.district
    };
    const end = performance.now();
    
    const duration = end - start;
    expect(duration).toBeLessThan(1);
  });
});
