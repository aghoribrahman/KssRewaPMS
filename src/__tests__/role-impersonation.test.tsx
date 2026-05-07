import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import Dashboard from '../components/Dashboard';
import { AuthProvider } from '../hooks/useAuth';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';


// Mock supabase client
const mockChannel = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn().mockReturnThis(),
  unsubscribe: vi.fn()
};

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: { user: { id: 'admin-1' } } }, error: null })),
      onAuthStateChange: vi.fn((cb) => {
        // Trigger initial check
        cb('INITIAL_SESSION', { user: { id: 'admin-1' } });
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      })
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(() => Promise.resolve({ 
        data: { 
          id: 'admin-1', 
          role: 'admin', 
          display_name: 'Super Admin', 
          assigned_districts: ['Rewa'], 
          preferred_language: 'en' 
        }, 
        error: null 
      })),
      update: vi.fn().mockReturnThis()
    })),
    channel: vi.fn(() => mockChannel),
    removeChannel: vi.fn()
  }
}));


// Mock useStore for profile persistence and patients
let mockStoreProfile = { id: 'admin-1', role: 'admin', display_name: 'Super Admin', assigned_districts: ['Rewa'], preferred_language: 'en' };
const mockSetProfile = vi.fn((p) => { 
  mockStoreProfile = p;
});

vi.mock('../store/useStore', () => {
  return {
    useStore: (selector: any) => selector({
      get profile() { return mockStoreProfile; },
      setProfile: (p: any) => { mockStoreProfile = p; },
      pendingSync: [],
      loading: false,
      fetchPatients: vi.fn()
    }),
    useSyncStatus: () => ({ isSyncing: false, pendingCount: 0, failedCount: 0 }),
    useUnifiedPatients: () => []
  };
});




describe('Admin Role Impersonation (Masking Strategy)', () => {
  it('allows admin to switch to registrar role without losing the switcher', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <Dashboard />
      </AuthProvider>
    );

    // Initial state: Admin Dashboard
    await screen.findByText(/Super Admin/i);
    expect(screen.getByText(/Role:/i)).toBeInTheDocument();
    
    // Switch to Registrar
    // We use the select trigger
    const roleSelect = screen.getByRole('combobox');
    await user.click(roleSelect);
    
    const registrarOption = screen.getByRole('option', { name: /Registrar/i });
    await user.click(registrarOption);

    // Verify Dashboard switched (Registrar Dashboard has "New Patient Registration")
    await screen.findByText(/New Patient Registration/i);
    
    // IMPORTANT: Verify Role Switcher is STILL visible (the 'trap' check)
    expect(screen.getByText(/Role:/i)).toBeInTheDocument();
    
    // Switch back to Admin
    await user.click(roleSelect);
    const adminOption = screen.getByRole('option', { name: /Admin/i });
    await user.click(adminOption);
    
    // Verify back to Admin Dashboard
    await screen.findByText(/System Oversight/i);
  });

  it('validates language toggle updates profile state', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <Dashboard />
      </AuthProvider>
    );
    
    // Wait for loading to finish
    const langBtn = await screen.findByRole('button', { name: /Hindi|हिंदी/i });
    await user.click(langBtn);


    // Verify the call to supabase update
    await waitFor(() => {
      expect(vi.mocked(supabase.from)).toHaveBeenCalledWith('profiles');
    });

    // CRITICAL: Verify Role Switcher is STILL visible (wasn't corrupted by language change)
    expect(screen.getByText(/Role:/i)).toBeInTheDocument();
  });
});


