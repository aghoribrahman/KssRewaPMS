-- ==========================================
-- WORKFLOW HARDENING: STATUS MACHINE + FIELD GUARDS + AUDIT
-- ==========================================
-- Fixes: A1, A3, B1, B2, B3, C1, C2, D1

-- ==========================================
-- 1. EXPAND STATUS ENUM
-- ==========================================
-- NOTE: ALTER TYPE ... ADD VALUE cannot run inside a transaction block.
-- These must be run separately or with individual DO blocks.

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

-- ==========================================
-- 2. ADD AUDIT COLUMNS TO patient_visits
-- ==========================================
ALTER TABLE public.patient_visits
    ADD COLUMN IF NOT EXISTS consultation_completed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS status_changed_by UUID REFERENCES public.profiles(id),
    ADD COLUMN IF NOT EXISTS status_changed_at TIMESTAMPTZ;

-- ==========================================
-- 3. STATUS TRANSITION ENFORCEMENT TRIGGER
-- ==========================================
-- Enforces the valid status state machine and mandatory data checks
-- at the database level. No client-side bypass possible.

CREATE OR REPLACE FUNCTION public.enforce_status_transition()
RETURNS TRIGGER AS $$
BEGIN
    -- If status hasn't changed, allow the update (it's a data-only edit)
    IF OLD.status IS NOT DISTINCT FROM NEW.status THEN
        RETURN NEW;
    END IF;

    -- ── pending_consultation → pending_meal ──
    -- Requires: consultant_advice (min 10 chars), consultant_id
    IF OLD.status = 'pending_consultation' AND NEW.status = 'pending_meal' THEN
        IF NEW.consultant_advice IS NULL OR length(trim(NEW.consultant_advice)) < 10 THEN
            RAISE EXCEPTION 'Consultant advice is required (minimum 10 characters) to advance to pending_meal';
        END IF;
        IF NEW.consultant_id IS NULL THEN
            RAISE EXCEPTION 'Consultant ID must be set to advance to pending_meal';
        END IF;
        NEW.consultation_completed_at := NOW();
        RETURN NEW;
    END IF;

    -- ── pending_consultation → complete (skip meal if not required) ──
    IF OLD.status = 'pending_consultation' AND NEW.status = 'complete' THEN
        IF NEW.meal_required IS TRUE THEN
            RAISE EXCEPTION 'Cannot skip meal stage when meal_required is true';
        END IF;
        IF NEW.consultant_advice IS NULL OR length(trim(NEW.consultant_advice)) < 10 THEN
            RAISE EXCEPTION 'Consultant advice is required (minimum 10 characters) to complete';
        END IF;
        IF NEW.consultant_id IS NULL THEN
            RAISE EXCEPTION 'Consultant ID must be set to complete';
        END IF;
        NEW.consultation_completed_at := NOW();
        RETURN NEW;
    END IF;

    -- ── pending_meal → complete ──
    -- Requires: meal_distributor_id, meal_image_url
    IF OLD.status = 'pending_meal' AND NEW.status = 'complete' THEN
        IF NEW.meal_distributor_id IS NULL THEN
            RAISE EXCEPTION 'Meal distributor ID must be set to complete delivery';
        END IF;
        IF NEW.meal_image_url IS NULL OR trim(NEW.meal_image_url) = '' THEN
            RAISE EXCEPTION 'Meal delivery photo is required to confirm delivery';
        END IF;
        RETURN NEW;
    END IF;

    -- ── pending_consultation → needs_correction (consultant rejects) ──
    IF OLD.status = 'pending_consultation' AND NEW.status = 'needs_correction' THEN
        IF NEW.consultant_advice IS NULL OR trim(NEW.consultant_advice) = '' THEN
            RAISE EXCEPTION 'Rejection reason is required when returning to registrar';
        END IF;
        RETURN NEW;
    END IF;

    -- ── needs_correction → pending_consultation (registrar re-submits) ──
    IF OLD.status = 'needs_correction' AND NEW.status = 'pending_consultation' THEN
        RETURN NEW;
    END IF;

    -- ── pending_consultation → escalated (consultant escalates) ──
    IF OLD.status = 'pending_consultation' AND NEW.status = 'escalated' THEN
        IF NEW.consultant_advice IS NULL OR trim(NEW.consultant_advice) = '' THEN
            RAISE EXCEPTION 'Escalation reason is required';
        END IF;
        RETURN NEW;
    END IF;

    -- ── escalated → pending_consultation (admin de-escalates) ──
    IF OLD.status = 'escalated' AND NEW.status = 'pending_consultation' THEN
        RETURN NEW;
    END IF;

    -- Any other transition is invalid
    RAISE EXCEPTION 'Invalid status transition: % → %', OLD.status, NEW.status;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_status_transition ON public.patient_visits;
CREATE TRIGGER validate_status_transition
    BEFORE UPDATE OF status ON public.patient_visits
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_status_transition();

-- ==========================================
-- 4. FIELD-LEVEL WRITE GUARD TRIGGER
-- ==========================================
-- Prevents roles from modifying columns that belong to other stages.
-- Consultants can't touch meal fields; meal distributors can't touch
-- consultant fields; registrars can't modify after handoff.

CREATE OR REPLACE FUNCTION public.enforce_field_guards()
RETURNS TRIGGER AS $$
DECLARE
    current_role public.user_role;
BEGIN
    current_role := public.get_user_role();

    -- Admins bypass all field guards
    IF current_role = 'admin' THEN
        RETURN NEW;
    END IF;

    -- Consultants: protect registrar and meal fields
    IF current_role = 'consultant' THEN
        NEW.registrar_id := OLD.registrar_id;
        NEW.registrar_name := OLD.registrar_name;
        NEW.registrar_notes := OLD.registrar_notes;
        NEW.registrar_image_url := OLD.registrar_image_url;
        NEW.meal_distributor_id := OLD.meal_distributor_id;
        NEW.meal_distributor_name := OLD.meal_distributor_name;
        NEW.meal_distributor_notes := OLD.meal_distributor_notes;
        NEW.meal_image_url := OLD.meal_image_url;
        NEW.meal_served_at := OLD.meal_served_at;
    END IF;

    -- Meal Distributors: protect registrar and consultant fields
    IF current_role = 'meal_distributor' THEN
        NEW.registrar_id := OLD.registrar_id;
        NEW.registrar_name := OLD.registrar_name;
        NEW.registrar_notes := OLD.registrar_notes;
        NEW.registrar_image_url := OLD.registrar_image_url;
        NEW.consultant_id := OLD.consultant_id;
        NEW.consultant_name := OLD.consultant_name;
        NEW.consultant_advice := OLD.consultant_advice;
        NEW.consultant_image_url := OLD.consultant_image_url;
        NEW.consultation_completed_at := OLD.consultation_completed_at;
    END IF;

    -- Registrars: can only update records in pending_consultation or needs_correction
    -- (RLS already restricts this, but double-guard the clinical fields)
    IF current_role = 'registrar' THEN
        NEW.consultant_id := OLD.consultant_id;
        NEW.consultant_name := OLD.consultant_name;
        NEW.consultant_advice := OLD.consultant_advice;
        NEW.consultant_image_url := OLD.consultant_image_url;
        NEW.consultation_completed_at := OLD.consultation_completed_at;
        NEW.meal_distributor_id := OLD.meal_distributor_id;
        NEW.meal_distributor_name := OLD.meal_distributor_name;
        NEW.meal_distributor_notes := OLD.meal_distributor_notes;
        NEW.meal_image_url := OLD.meal_image_url;
        NEW.meal_served_at := OLD.meal_served_at;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS enforce_field_guards ON public.patient_visits;
CREATE TRIGGER enforce_field_guards
    BEFORE UPDATE ON public.patient_visits
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_field_guards();

-- ==========================================
-- 5. STATUS CHANGE AUDIT TRIGGER
-- ==========================================
-- Logs every status change to clinical_audit_logs with actor identity.

CREATE OR REPLACE FUNCTION public.log_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        -- Write to clinical_audit_logs
        INSERT INTO public.clinical_audit_logs (
            patient_id,
            action_type,
            actor_id,
            transaction_id,
            delta
        ) VALUES (
            NEW.id,
            OLD.status || ' → ' || NEW.status,
            auth.uid(),
            COALESCE(NEW.last_transaction_id::TEXT, gen_random_uuid()::TEXT),
            jsonb_build_object(
                'old_status', OLD.status,
                'new_status', NEW.status,
                'consultant_advice', NEW.consultant_advice,
                'meal_distributor_notes', NEW.meal_distributor_notes
            )
        );

        -- Stamp the visit record
        NEW.status_changed_by := auth.uid();
        NEW.status_changed_at := NOW();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS log_status_change ON public.patient_visits;
CREATE TRIGGER log_status_change
    BEFORE UPDATE ON public.patient_visits
    FOR EACH ROW
    EXECUTE FUNCTION public.log_status_change();

-- ==========================================
-- 6. EXTEND RLS FOR NEW STATUSES
-- ==========================================
-- Allow registrars to update records in 'needs_correction' status
DROP POLICY IF EXISTS "Registrars can update needs_correction patients" ON public.patients;

-- Note: This policy is for patient_visits, not the legacy patients table
DO $$
BEGIN
    -- Only create if the policy doesn't exist on patient_visits
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'patient_visits' 
        AND policyname = 'Registrars can update needs_correction visits'
    ) THEN
        EXECUTE 'CREATE POLICY "Registrars can update needs_correction visits" 
            ON public.patient_visits FOR UPDATE USING (
                public.get_user_role() = ''registrar'' AND status = ''needs_correction''
            )';
    END IF;
END $$;
