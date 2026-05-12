import { PatientStatus } from '../../types';

/**
 * Masks sensitive patient data for non-privileged roles (visitors).
 */
export function maskSensitiveData(val: string | undefined, type: 'contact' | 'id', isVisitor: boolean): string {
  if (!val) return 'N/A';
  if (!isVisitor) return val;
  
  if (type === 'contact') {
    // Mask middle digits of phone number
    return val.replace(/(\d{2})\d+(\d{2})/, '$1XXXXXX$2');
  }
  
  // Mask middle characters of ID/Aadhar
  return val.replace(/(.{2}).+(.{2})/, '$1XXXXXXXX$2');
}

/**
 * Normalizes status strings for display.
 */
export function formatStatusLabel(status: PatientStatus): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Determines CSS classes for status badges.
 */
export function getStatusColorClass(status: PatientStatus): string {
  switch (status) {
    case 'pending_consultation':
      return 'bg-orange-100 text-orange-600';
    case 'pending_meal':
      return 'bg-blue-100 text-blue-600';
    case 'complete':
      return 'bg-emerald-100 text-emerald-600';
    case 'needs_correction':
      return 'bg-amber-100 text-amber-700 border border-amber-200';
    case 'escalated':
      return 'bg-rose-100 text-rose-700 border border-rose-200 animate-pulse';
    default:
      return 'bg-neutral-100 text-neutral-600';
  }
}
