import * as React from 'react';
import { Badge } from '../ui/badge';
import { PatientStatus } from '../../types';
import { formatStatusLabel, getStatusColorClass } from './patientUtils';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: PatientStatus | null;
  className?: string;
  variant?: 'solid' | 'subtle';
}

/**
 * A reusable status badge for patients.
 * Centralizes the visual representation of clinical states.
 */
export function StatusBadge({ status, className, variant = 'subtle' }: StatusBadgeProps) {
  if (!status) return null;
  const label = formatStatusLabel(status);
  const colorClass = getStatusColorClass(status);

  return (
    <Badge
      className={cn(
        "rounded-xl px-4 py-2 border-none font-bold text-xs uppercase tracking-wider",
        variant === 'subtle' ? colorClass : "bg-primary text-white",
        className
      )}
    >
      {label}
    </Badge>
  );
}
