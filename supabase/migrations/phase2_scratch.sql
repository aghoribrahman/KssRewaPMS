-- Step 1: Create master table
CREATE TABLE public.patient_master (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    age INTEGER,
    gender gender_type DEFAULT 'male'::gender_type,
    contact TEXT,
    address TEXT,
    district TEXT,
    block TEXT,
    village TEXT,
    abha_id TEXT,
    aadhar_number TEXT,
    sickle_cell_status sickle_cell_status DEFAULT 'AS'::sickle_cell_status,
    pre_existing_diagnosis BOOLEAN DEFAULT false,
    date_of_diagnosis DATE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.patient_master ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated full access" ON public.patient_master FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Step 2: Create visits table
CREATE TABLE public.patient_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patient_master(id) ON DELETE CASCADE,
    
    -- Medical History
    first_symptom_onset DATE,
    previous_hospitalizations BOOLEAN DEFAULT false,
    blood_transfusions_count INTEGER DEFAULT 0,
    other_health_issues TEXT,

    -- Present Symptoms
    symptoms TEXT[] DEFAULT '{}',
    other_symptoms TEXT,

    -- Medication
    medication_hydroxyurea BOOLEAN DEFAULT false,
    dosage_hydroxyurea TEXT,
    medication_folic_acid BOOLEAN DEFAULT false,
    dosage_folic_acid TEXT,
    other_medications TEXT,
    medication_regularity BOOLEAN DEFAULT false,

    -- Diet & Lifestyle
    dietary_habit TEXT,
    daily_water_intake TEXT,
    physical_activity TEXT,

    -- Counselling & Nutrition
    counselling_topics TEXT[] DEFAULT '{}',
    nutrition_kit_distributed BOOLEAN DEFAULT false,
    nutrition_kit_date DATE,
    nutrition_kit_instructions_provided BOOLEAN DEFAULT false,

    -- Referral & Feedback
    referral TEXT[] DEFAULT '{}',
    feedback_confirmation BOOLEAN DEFAULT false,
    specific_concerns TEXT,

    -- Counsellor Details
    counsellor_name TEXT,
    counsellor_designation TEXT,
    counsellor_organization TEXT DEFAULT 'Kiran Sewa Sansthan',

    -- Status & Workflow
    status patient_status DEFAULT 'pending_consultation'::patient_status,
    meal_required BOOLEAN DEFAULT true,
    reports_attached BOOLEAN DEFAULT false,

    registrar_notes TEXT,
    registrar_image_url TEXT,
    registrar_id UUID REFERENCES public.profiles(id),
    registrar_name TEXT,

    consultant_advice TEXT,
    consultant_image_url TEXT,
    consultant_id UUID REFERENCES public.profiles(id),
    consultant_name TEXT,

    meal_distributor_notes TEXT,
    meal_image_url TEXT,
    meal_distributor_id UUID REFERENCES public.profiles(id),
    meal_distributor_name TEXT,
    meal_served_at TIMESTAMPTZ,

    last_transaction_id UUID,

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.patient_visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated full access" ON public.patient_visits FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Step 3: Data Migration
-- Insert unique masters
INSERT INTO public.patient_master (
    id, name, age, gender, contact, address, district, block, village, 
    abha_id, aadhar_number, sickle_cell_status, pre_existing_diagnosis, 
    date_of_diagnosis, created_at, updated_at
)
SELECT DISTINCT ON (COALESCE(master_patient_id, id))
    COALESCE(master_patient_id, id) as id, 
    name, age, gender, contact, address, district, block, village, 
    abha_id, aadhar_number, sickle_cell_status, pre_existing_diagnosis, 
    date_of_diagnosis, created_at, updated_at
FROM public.patients
ORDER BY COALESCE(master_patient_id, id), created_at ASC;

-- Insert visits
INSERT INTO public.patient_visits (
    id, patient_id, first_symptom_onset, previous_hospitalizations, 
    blood_transfusions_count, other_health_issues, symptoms, other_symptoms, 
    medication_hydroxyurea, dosage_hydroxyurea, medication_folic_acid, dosage_folic_acid, 
    other_medications, medication_regularity, dietary_habit, daily_water_intake, physical_activity, 
    counselling_topics, nutrition_kit_distributed, nutrition_kit_date, nutrition_kit_instructions_provided, 
    referral, feedback_confirmation, specific_concerns, counsellor_name, counsellor_designation, 
    counsellor_organization, status, meal_required, reports_attached, registrar_notes, registrar_image_url, 
    registrar_id, registrar_name, consultant_advice, consultant_image_url, consultant_id, consultant_name, 
    meal_distributor_notes, meal_image_url, meal_distributor_id, meal_distributor_name, meal_served_at, 
    last_transaction_id, created_at, updated_at
)
SELECT 
    id, COALESCE(master_patient_id, id) as patient_id, first_symptom_onset, previous_hospitalizations, 
    blood_transfusions_count, other_health_issues, symptoms, other_symptoms, 
    medication_hydroxyurea, dosage_hydroxyurea, medication_folic_acid, dosage_folic_acid, 
    other_medications, medication_regularity, dietary_habit, daily_water_intake, physical_activity, 
    counselling_topics, nutrition_kit_distributed, nutrition_kit_date, nutrition_kit_instructions_provided, 
    referral, feedback_confirmation, specific_concerns, counsellor_name, counsellor_designation, 
    counsellor_organization, status, meal_required, reports_attached, registrar_notes, registrar_image_url, 
    registrar_id, registrar_name, consultant_advice, consultant_image_url, consultant_id, consultant_name, 
    meal_distributor_notes, meal_image_url, meal_distributor_id, meal_distributor_name, meal_served_at, 
    last_transaction_id, created_at, updated_at
FROM public.patients;

-- Step 4: Rename old table (backup)
ALTER TABLE public.patients RENAME TO patients_legacy_backup;
