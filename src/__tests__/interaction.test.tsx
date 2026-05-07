/**
 * ============================================================
 * KssRewaPMS — Interaction & Workflow Test Suite
 * ============================================================
 * Verifies complex multi-step user interactions and 
 * end-to-end data flows within dashboard components.
 *
 * Coverage: Domain 7 (UI/UX) & Advanced Testing Suites
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import RegistrarDashboard from '../components/roles/RegistrarDashboard';

// Mock dependencies
const mockProfile = { 
  role: 'registrar', 
  display_name: 'Test Registrar', 
  assigned_districts: ['Rewa'], 
  preferred_language: 'en' 
};

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'reg-1' },
    profile: mockProfile,
    signOut: vi.fn(),
    updateRole: vi.fn(),
    updateDistricts: vi.fn(),
    updateLanguage: vi.fn()
  })
}));

const mockAddToSyncQueue = vi.fn();
vi.mock('../store/useStore', () => ({
  useStore: (selector: any) => selector({
    addToSyncQueue: mockAddToSyncQueue,
    profile: mockProfile,
    pendingSync: []
  }),
  useSyncStatus: () => ({ isSyncing: false, pendingCount: 0, failedCount: 0 })
}));


vi.mock('../hooks/usePatients', () => ({
  usePatients: () => ({
    patients: [],
    loading: false,
    isOffline: false,
    isSyncing: false,
    pendingCount: 0,
    refresh: vi.fn()
  })
}));

// Lucide icons are handled globally in setup.ts

// Mock components that are too heavy for interaction tests
vi.mock('../components/ImageUpload', () => ({
  ImageUpload: () => <div data-testid="mock-image-upload" />
}));

describe('Registrar Interaction Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('completes a full patient registration flow', async () => {
    const user = userEvent.setup();
    render(<RegistrarDashboard />);

    // 1. Open registration form
    const registerBtn = screen.getByText(/New Patient Registration/i);
    await user.click(registerBtn);

    // 2. Fill in the form
    const nameInput = screen.getByPlaceholderText(/Rahul Kumar/i);
    const ageInput = screen.getByPlaceholderText(/Years/i);
    const contactInput = screen.getByPlaceholderText(/10-digit number/i);
    const addressInput = screen.getByPlaceholderText(/House no, Street/i);

    await user.type(nameInput, 'John Doe');
    await user.clear(ageInput);
    await user.type(ageInput, '45');
    await user.type(contactInput, '9876543210');
    await user.type(addressInput, 'House 123, Rewa');

    // 3. Submit
    const submitBtn = screen.getByText(/Confirm Registration/i);
    await user.click(submitBtn);

    // 4. Verify queue call
    expect(mockAddToSyncQueue).toHaveBeenCalledWith(
      'INSERT',
      expect.objectContaining({
        name: 'John Doe',
        age: 45,
        contact: '9876543210',
        address: 'House 123, Rewa',
        status: 'pending_consultation'
      })
    );
  });

  it('validates contact number length before submission', async () => {
    const user = userEvent.setup();
    render(<RegistrarDashboard />);

    await user.click(screen.getByText(/New Patient Registration/i));
    
    const contactInput = screen.getByPlaceholderText(/10-digit number/i);
    await user.type(contactInput, '123'); // Invalid short number

    const submitBtn = screen.getByText(/Confirm Registration/i);
    await user.click(submitBtn);

    // Should NOT have been called due to validation failure
    expect(mockAddToSyncQueue).not.toHaveBeenCalled();
  });



});
