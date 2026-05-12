-- ==========================================
-- RPC SAFETY NET: COALESCE WORKFLOW STATUS
-- ==========================================

-- This migration updates the register_patient_visit function to ensure
-- that if the frontend fails to provide a status, it defaults to 
-- 'pending_consultation' instead of NULL, preventing data visibility issues.

CREATE OR REPLACE FUNCTION public.register_patient_visit(
    p_master JSONB,
    p_visit JSONB,
    p_visit_id UUID,
    p_timestamp TIMESTAMPTZ
) RETURNS UUID AS $$
DECLARE
    v_patient_id UUID;
BEGIN
    -- 1. Try to find existing patient by ID or create new one
    v_patient_id := (p_master->>'id')::UUID;
    
    IF v_patient_id IS NULL OR NOT EXISTS (SELECT 1 FROM public.patient_master WHERE id = v_patient_id) THEN
        INSERT INTO public.patient_master (
            id, name, age, gender, contact, address, district, block, village,
            abha_id, aadhar_number, sickle_cell_status, pre_existing_diagnosis,
            date_of_diagnosis, created_at, updated_at
        ) VALUES (
            COALESCE(v_patient_id, gen_random_uuid()),
            p_master->>'name',
            (p_master->>'age')::INTEGER,
            (p_master->>'gender')::gender_type,
            p_master->>'contact',
            p_master->>'address',
            p_master->>'district',
            p_master->>'block',
            p_master->>'village',
            p_master->>'abha_id',
            p_master->>'aadhar_number',
            (p_master->>'sickle_cell_status')::sickle_cell_status,
            (p_master->>'pre_existing_diagnosis')::BOOLEAN,
            (p_master->>'date_of_diagnosis')::DATE,
            p_timestamp,
            now()
        ) RETURNING id INTO v_patient_id;
    END IF;

    -- 2. Insert the visit
    INSERT INTO public.patient_visits (
        id,
        patient_id,
        first_symptom_onset,
        previous_hospitalizations,
        blood_transfusions_count,
        other_health_issues,
        symptoms,
        other_symptoms,
        medication_hydroxyurea,
        dosage_hydroxyurea,
        medication_folic_acid,
        dosage_folic_acid,
        other_medications,
        medication_regularity,
        dietary_habit,
        daily_water_intake,
        physical_activity,
        counselling_topics,
        nutrition_kit_distributed,
        nutrition_kit_date,
        nutrition_kit_instructions_provided,
        referral,
        feedback_confirmation,
        specific_concerns,
        counsellor_name,
        counsellor_designation,
        counsellor_organization,
        status,
        meal_required,
        reports_attached,
        registrar_notes,
        registrar_image_url,
        registrar_id,
        registrar_name,
        last_transaction_id,
        created_at,
        updated_at
    ) VALUES (
        p_visit_id,
        v_patient_id,
        (p_visit->>'first_symptom_onset')::DATE,
        (p_visit->>'previous_hospitalizations')::BOOLEAN,
        (p_visit->>'blood_transfusions_count')::INTEGER,
        p_visit->>'other_health_issues',
        ARRAY(SELECT jsonb_array_elements_text(COALESCE(p_visit->'symptoms', '[]'::jsonb))),
        p_visit->>'other_symptoms',
        (p_visit->>'medication_hydroxyurea')::BOOLEAN,
        p_visit->>'dosage_hydroxyurea',
        (p_visit->>'medication_folic_acid')::BOOLEAN,
        p_visit->>'dosage_folic_acid',
        p_visit->>'other_medications',
        (p_visit->>'medication_regularity')::BOOLEAN,
        p_visit->>'dietary_habit',
        p_visit->>'daily_water_intake',
        p_visit->>'physical_activity',
        ARRAY(SELECT jsonb_array_elements_text(COALESCE(p_visit->'counselling_topics', '[]'::jsonb))),
        (p_visit->>'nutrition_kit_distributed')::BOOLEAN,
        (p_visit->>'nutrition_kit_date')::DATE,
        (p_visit->>'nutrition_kit_instructions_provided')::BOOLEAN,
        ARRAY(SELECT jsonb_array_elements_text(COALESCE(p_visit->'referral', '[]'::jsonb))),
        (p_visit->>'feedback_confirmation')::BOOLEAN,
        p_visit->>'specific_concerns',
        p_visit->>'counsellor_name',
        p_visit->>'counsellor_designation',
        COALESCE(p_visit->>'counsellor_organization', 'Kiran Sewa Sansthan'),
        COALESCE((p_visit->>'status'), 'pending_consultation')::patient_status, -- SENIOR FIX: COALESCE NULLs
        (p_visit->>'meal_required')::BOOLEAN,
        (p_visit->>'reports_attached')::BOOLEAN,
        p_visit->>'registrar_notes',
        p_visit->>'registrar_image_url',
        (p_visit->>'registrar_id')::UUID,
        p_visit->>'registrar_name',
        p_visit_id,
        p_timestamp,
        now()
    );

    RETURN v_patient_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
