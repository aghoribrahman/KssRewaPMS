-- ====================================================================
-- RETURNING PATIENT RELIABILITY: DEDUP, UNIQUE CONSTRAINT & UPSERT RPC
-- ====================================================================
-- Fixes: F1, F2, F3, F4, F5, F6

-- PART 1: DEDUPLICATION PRE-PASS
-- Merge visits from duplicate patient_master records into the oldest surviving master record.
-- Safely deletes orphaned duplicate master records.
DO $$
DECLARE
    r RECORD;
    survivor_id UUID;
BEGIN
    FOR r IN (
        SELECT contact, district, array_agg(id ORDER BY created_at ASC, id ASC) as ids
        FROM public.patient_master
        WHERE contact IS NOT NULL AND contact != '' AND district IS NOT NULL AND district != ''
        GROUP BY contact, district
        HAVING count(*) > 1
    ) LOOP
        survivor_id := r.ids[1];
        
        -- Re-link visits from duplicates to the surviving oldest record
        UPDATE public.patient_visits
        SET patient_id = survivor_id
        WHERE patient_id = ANY(r.ids[2:array_length(r.ids, 1)]);
        
        -- Delete the duplicate master records
        DELETE FROM public.patient_master
        WHERE id = ANY(r.ids[2:array_length(r.ids, 1)]);
    END LOOP;
END $$;

-- PART 2: ADD STRICT UNIQUE CONSTRAINTS
ALTER TABLE public.patient_master
  DROP CONSTRAINT IF EXISTS uq_patient_master_contact_district;

ALTER TABLE public.patient_master
  ADD CONSTRAINT uq_patient_master_contact_district
  UNIQUE (contact, district);

-- Partial unique constraint on Aadhar Number if provided
DROP INDEX IF EXISTS uq_patient_master_aadhar;
CREATE UNIQUE INDEX uq_patient_master_aadhar
  ON public.patient_master (aadhar_number)
  WHERE aadhar_number IS NOT NULL AND aadhar_number != '';


-- PART 3: REWRITE REGISTER_PATIENT_VISIT RPC WITH UPSERT LOGIC
CREATE OR REPLACE FUNCTION public.register_patient_visit(
    p_master JSONB,
    p_visit JSONB,
    p_visit_id UUID,
    p_timestamp TIMESTAMPTZ
) RETURNS UUID AS $$
DECLARE
    v_patient_id UUID;
BEGIN
    -- 1. Try to find existing patient by ID or upsert using (contact, district)
    v_patient_id := (p_master->>'id')::UUID;
    
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
    )
    ON CONFLICT (contact, district) DO UPDATE SET
        name = EXCLUDED.name,
        age = EXCLUDED.age,
        gender = EXCLUDED.gender,
        address = EXCLUDED.address,
        block = EXCLUDED.block,
        village = EXCLUDED.village,
        abha_id = COALESCE(NULLIF(EXCLUDED.abha_id, ''), patient_master.abha_id),
        aadhar_number = COALESCE(NULLIF(EXCLUDED.aadhar_number, ''), patient_master.aadhar_number),
        sickle_cell_status = EXCLUDED.sickle_cell_status,
        pre_existing_diagnosis = EXCLUDED.pre_existing_diagnosis,
        updated_at = now()
    RETURNING id INTO v_patient_id;

    -- 2. Insert the visit record
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
        COALESCE((p_visit->>'status'), 'pending_consultation')::patient_status,
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


-- PART 4: CREATE SERVER-SIDE LOOKUP RPC
CREATE OR REPLACE FUNCTION public.find_patient_by_identity(
    p_contact TEXT DEFAULT NULL,
    p_aadhar TEXT DEFAULT NULL,
    p_abha TEXT DEFAULT NULL
) RETURNS SETOF public.patient_master AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM public.patient_master
    WHERE (p_contact IS NOT NULL AND p_contact != '' AND contact = p_contact)
       OR (p_aadhar IS NOT NULL AND p_aadhar != '' AND aadhar_number = p_aadhar)
       OR (p_abha IS NOT NULL AND p_abha != '' AND abha_id = p_abha)
    ORDER BY updated_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
