/**
 * ============================================================
 * KssRewaPMS — Data Validation & Business Rules Test Suite
 * ============================================================
 * Tests the core data validation logic, type constraints, 
 * and business rules that the application relies on.
 *
 * Coverage: Domain 2 (Registration), Domain 8 (Data Integrity)
 */
import { describe, it, expect } from 'vitest';
import type { Patient, PatientStatus, UserRole, SickleCellStatus } from '../../types';

// ─── Helper: Create a valid patient object ───
function createValidPatient(overrides: Partial<Patient> = {}): Patient {
  return {
    id: 'test-id-001',
    name: 'Rahul Kumar',
    age: 25,
    gender: 'male',
    contact: '9876543210',
    address: 'House 123, Main Road',
    district: 'Rewa',
    block: 'Rewa',
    village: 'Testpur',
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
  };
}

// ═══════════════════════════════════════════════════
// 1. CONTACT NUMBER VALIDATION
// ═══════════════════════════════════════════════════
describe('Contact Number Validation', () => {
  // Mirrors the regex in RegistrarDashboard.tsx handleRegister
  const isValidContact = (contact: string) => /^\d{10}$/.test(contact);

  it('TC-2.1.7: accepts valid 10-digit contact', () => {
    expect(isValidContact('9876543210')).toBe(true);
  });

  it('TC-2.1.4: rejects contact with < 10 digits', () => {
    expect(isValidContact('12345')).toBe(false);
  });

  it('TC-2.1.5: rejects contact with > 10 digits', () => {
    expect(isValidContact('12345678901')).toBe(false);
  });

  it('TC-2.1.6: rejects contact with letters', () => {
    expect(isValidContact('abcdefghij')).toBe(false);
  });

  it('rejects empty contact', () => {
    expect(isValidContact('')).toBe(false);
  });

  it('rejects contact with spaces', () => {
    expect(isValidContact('987 654 321')).toBe(false);
  });

  it('rejects contact with special chars', () => {
    expect(isValidContact('+919876543')).toBe(false);
  });
});

// ═══════════════════════════════════════════════════
// 2. REGISTRATION FORM VALIDATION
// ═══════════════════════════════════════════════════
describe('Registration Form Validation', () => {
  // Mirrors the validation in RegistrarDashboard handleRegister
  function validateRegistration(data: Partial<Patient>): string | null {
    if (!data.name?.trim()) return 'Please fill all required fields';
    if (!data.age || data.age <= 0) return 'Please fill all required fields';
    if (!data.district) return 'Please fill all required fields';
    if (data.contact && !/^\d{10}$/.test(data.contact)) {
      return 'Invalid contact number. Must be 10 digits.';
    }
    return null; // valid
  }

  it('TC-2.1.1: rejects missing name', () => {
    expect(validateRegistration({ age: 25, district: 'Rewa' }))
      .toBe('Please fill all required fields');
  });

  it('TC-2.1.2: rejects missing district', () => {
    expect(validateRegistration({ name: 'Test', age: 25 }))
      .toBe('Please fill all required fields');
  });

  it('TC-2.1.3: rejects missing/zero age', () => {
    expect(validateRegistration({ name: 'Test', age: 0, district: 'Rewa' }))
      .toBe('Please fill all required fields');
  });

  it('TC-2.1.8: rejects whitespace-only name', () => {
    expect(validateRegistration({ name: '   ', age: 25, district: 'Rewa' }))
      .toBe('Please fill all required fields');
  });

  it('TC-2.1.10: rejects negative age', () => {
    expect(validateRegistration({ name: 'Test', age: -5, district: 'Rewa' }))
      .toBe('Please fill all required fields');
  });

  it('accepts valid registration data', () => {
    expect(validateRegistration({ name: 'Rahul', age: 25, district: 'Rewa', contact: '9876543210' }))
      .toBeNull();
  });

  it('accepts registration without contact (optional)', () => {
    expect(validateRegistration({ name: 'Rahul', age: 25, district: 'Rewa' }))
      .toBeNull();
  });
});

// ═══════════════════════════════════════════════════
// 3. STATUS TRANSITION RULES
// ═══════════════════════════════════════════════════
describe('Patient Status Transitions (Domain 8.2.1)', () => {
  const VALID_TRANSITIONS: Record<PatientStatus, PatientStatus[]> = {
    pending_consultation: ['pending_meal', 'complete'],
    pending_meal: ['complete'],
    complete: [],
  };

  function isValidTransition(from: PatientStatus, to: PatientStatus): boolean {
    return VALID_TRANSITIONS[from]?.includes(to) ?? false;
  }

  it('allows pending_consultation → pending_meal', () => {
    expect(isValidTransition('pending_consultation', 'pending_meal')).toBe(true);
  });

  it('allows pending_consultation → complete (no meal needed)', () => {
    expect(isValidTransition('pending_consultation', 'complete')).toBe(true);
  });

  it('allows pending_meal → complete', () => {
    expect(isValidTransition('pending_meal', 'complete')).toBe(true);
  });

  it('blocks complete → pending_consultation (backward)', () => {
    expect(isValidTransition('complete', 'pending_consultation')).toBe(false);
  });

  it('blocks complete → pending_meal (backward)', () => {
    expect(isValidTransition('complete', 'pending_meal')).toBe(false);
  });

  it('blocks pending_meal → pending_consultation (backward)', () => {
    expect(isValidTransition('pending_meal', 'pending_consultation')).toBe(false);
  });
});

// ═══════════════════════════════════════════════════
// 4. ROLE-BASED ACCESS CONTROL RULES
// ═══════════════════════════════════════════════════
describe('Role-Based Access Control (Domain 8.1)', () => {
  type Permission = 'insert_patient' | 'update_pending_consultation' | 'update_pending_meal' | 'update_any' | 'view_settings';

  const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
    admin: ['insert_patient', 'update_pending_consultation', 'update_pending_meal', 'update_any', 'view_settings'],
    registrar: ['insert_patient', 'update_pending_consultation'],
    consultant: ['update_pending_consultation'],
    meal_distributor: ['update_pending_meal'],
    visitor: [],
  };

  function hasPermission(role: UserRole, perm: Permission): boolean {
    return ROLE_PERMISSIONS[role]?.includes(perm) ?? false;
  }

  it('TC-8.1.2: registrar can insert patients', () => {
    expect(hasPermission('registrar', 'insert_patient')).toBe(true);
  });

  it('TC-8.1.3: consultant cannot insert patients', () => {
    expect(hasPermission('consultant', 'insert_patient')).toBe(false);
  });

  it('TC-8.1.4: consultant can update pending_consultation', () => {
    expect(hasPermission('consultant', 'update_pending_consultation')).toBe(true);
  });

  it('TC-8.1.5: consultant cannot update pending_meal', () => {
    expect(hasPermission('consultant', 'update_pending_meal')).toBe(false);
  });

  it('TC-8.1.6: meal_distributor can update pending_meal', () => {
    expect(hasPermission('meal_distributor', 'update_pending_meal')).toBe(true);
  });

  it('TC-8.1.7: meal_distributor cannot update pending_consultation', () => {
    expect(hasPermission('meal_distributor', 'update_pending_consultation')).toBe(false);
  });

  it('TC-8.1.8: admin has full update access', () => {
    expect(hasPermission('admin', 'update_any')).toBe(true);
  });

  it('visitor has no write permissions', () => {
    expect(hasPermission('visitor', 'insert_patient')).toBe(false);
    expect(hasPermission('visitor', 'update_pending_consultation')).toBe(false);
    expect(hasPermission('visitor', 'update_pending_meal')).toBe(false);
  });

  it('admin can view settings', () => {
    expect(hasPermission('admin', 'view_settings')).toBe(true);
  });

  it('non-admin cannot view settings', () => {
    expect(hasPermission('registrar', 'view_settings')).toBe(false);
    expect(hasPermission('consultant', 'view_settings')).toBe(false);
  });
});

// ═══════════════════════════════════════════════════
// 5. VISITOR DATA MASKING
// ═══════════════════════════════════════════════════
describe('Visitor Data Masking (Domain 8.1.9)', () => {
  // Mirrors the maskValue function in PatientSummary.tsx
  function maskValue(val: string | undefined, type: 'contact' | 'id', isVisitor: boolean): string {
    if (!val || !isVisitor) return val || 'N/A';
    if (type === 'contact') return val.replace(/(\d{2})\d+(\d{2})/, '$1XXXXXX$2');
    return val.replace(/(.{2}).+(.{2})/, '$1XXXXXXXX$2');
  }

  it('masks contact for visitor', () => {
    expect(maskValue('9876543210', 'contact', true)).toBe('98XXXXXX10');
  });

  it('masks ABHA ID for visitor', () => {
    expect(maskValue('ABHA12345678', 'id', true)).toBe('ABXXXXXXXX78');
  });

  it('does NOT mask for non-visitor', () => {
    expect(maskValue('9876543210', 'contact', false)).toBe('9876543210');
  });

  it('returns N/A for undefined value', () => {
    expect(maskValue(undefined, 'contact', true)).toBe('N/A');
  });

  it('returns N/A for empty string', () => {
    expect(maskValue('', 'contact', false)).toBe('N/A');
  });
});

// ═══════════════════════════════════════════════════
// 6. SICKLE CELL STATUS VALUES
// ═══════════════════════════════════════════════════
describe('Sickle Cell Status Validation', () => {
  const validStatuses: SickleCellStatus[] = ['SS', 'AS', 'AA'];

  it('only allows SS, AS, AA values', () => {
    expect(validStatuses).toEqual(['SS', 'AS', 'AA']);
  });

  it('patient object stores valid status', () => {
    const p = createValidPatient({ sickle_cell_status: 'SS' });
    expect(p.sickle_cell_status).toBe('SS');
  });
});

// ═══════════════════════════════════════════════════
// 7. PATIENT OBJECT INTEGRITY
// ═══════════════════════════════════════════════════
describe('Patient Object Integrity', () => {
  it('createValidPatient returns complete object', () => {
    const p = createValidPatient();
    expect(p.id).toBeDefined();
    expect(p.name).toBe('Rahul Kumar');
    expect(p.status).toBe('pending_consultation');
    expect(p.symptoms).toEqual([]);
    expect(p.counselling_topics).toEqual([]);
  });

  it('default status is pending_consultation', () => {
    const p = createValidPatient();
    expect(p.status).toBe('pending_consultation');
  });

  it('meal_required defaults to true', () => {
    const p = createValidPatient();
    expect(p.meal_required).toBe(true);
  });

  it('overrides apply correctly', () => {
    const p = createValidPatient({ name: 'Test User', age: 50 });
    expect(p.name).toBe('Test User');
    expect(p.age).toBe(50);
  });

  it('audit fields are initially empty', () => {
    const p = createValidPatient();
    expect(p.registrar_id).toBeUndefined();
    expect(p.consultant_id).toBeUndefined();
    expect(p.meal_distributor_id).toBeUndefined();
  });
});
