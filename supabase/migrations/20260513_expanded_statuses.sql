-- ==========================================
-- WORKFLOW HARDENING: EXPANDED STATUSES
-- ==========================================
-- Fixes: D1, D2
-- Note: These enum additions are also handled safely in 20260513_status_machine.sql

DO $$ BEGIN
    ALTER TYPE public.patient_status ADD VALUE IF NOT EXISTS 'needs_correction';
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TYPE public.patient_status ADD VALUE IF NOT EXISTS 'escalated';
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
