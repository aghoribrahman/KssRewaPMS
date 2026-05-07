/**
 * ============================================================
 * KssRewaPMS — UI Smoke Test Suite
 * ============================================================
 * Verifies that key UI components render without crashing
 * and display expected initial states.
 *
 * Coverage: Domain 7 (UI/UX)
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { CounsellingForm } from '../components/CounsellingForm';
import { PatientSummary } from '../components/PatientSummary';

// Lucide icons are handled globally in setup.ts

// Mock useAuth to avoid AuthProvider requirement
const mockUseAuth = vi.fn();
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth()
}));

// Default mock implementation
mockUseAuth.mockReturnValue({
  user: { id: 'test-user' },
  profile: { role: 'admin', preferred_language: 'en' }
});

// Mock ImageUpload
vi.mock('./ImageUpload', () => ({
  ImageUpload: () => <div data-testid="mock-image-upload">Image Upload Mock</div>
}));

describe('UI Smoke Tests', () => {
  it('renders CounsellingForm without crashing', () => {
    const mockData = { name: 'Rahul Test' };
    render(
      <CounsellingForm 
        data={mockData} 
        onChange={() => {}} 
      />
    );
    
    expect(screen.getByPlaceholderText(/Rahul Kumar/i)).toBeDefined();
    expect(screen.getByText(/Full Name & Contact Number/i)).toBeDefined();
  });

  it('renders PatientSummary for regular role', () => {
    const mockPatient = {
      id: '1',
      name: 'Priya',
      age: 25,
      gender: 'female',
      district: 'Rewa',
      status: 'pending_consultation'
    } as any;

    render(
      <PatientSummary 
        patient={mockPatient} 
      />
    );

    expect(screen.getByText(/Full Name/i)).toBeDefined();
  });

  it('renders PatientSummary with masking for visitor', () => {
    // Override mock for visitor
    mockUseAuth.mockReturnValue({
      user: { id: 'test-visitor' },
      profile: { role: 'visitor' }
    });

    const mockPatient = {
      id: '1',
      name: 'Secret Patient',
      contact: '9876543210',
      status: 'complete'
    } as any;

    render(
      <PatientSummary 
        patient={mockPatient} 
      />
    );

    // Contact should be masked: 98XXXXXX10
    expect(screen.getByText(/98XXXXXX10/i)).toBeDefined();
    expect(screen.queryByText(/9876543210/i)).toBeNull();
  });
});
