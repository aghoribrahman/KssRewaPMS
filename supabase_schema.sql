-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    role TEXT DEFAULT 'registrar' CHECK (role IN ('admin', 'registrar', 'consultant', 'meal_distributor')),
    display_name TEXT,
    assigned_districts TEXT[],
    preferred_language TEXT DEFAULT 'hi',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Patients Table
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    age INT,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    contact TEXT,
    address TEXT,
    district TEXT,
    block TEXT,
    village TEXT,
    abha_id TEXT,
    aadhar_number TEXT,
    
    -- Medical Information
    sickle_cell_status TEXT CHECK (sickle_cell_status IN ('SS', 'AS', 'AA')),
    pre_existing_diagnosis BOOLEAN DEFAULT FALSE,
    date_of_diagnosis DATE,
    reports_attached BOOLEAN DEFAULT FALSE,

    -- Medical History
    first_symptom_onset DATE,
    previous_hospitalizations BOOLEAN DEFAULT FALSE,
    blood_transfusions_count INT DEFAULT 0,
    other_health_issues TEXT,

    -- Present Symptoms
    symptoms TEXT[],
    other_symptoms TEXT,

    -- Medication
    medication_hydroxyurea BOOLEAN DEFAULT FALSE,
    dosage_hydroxyurea TEXT,
    medication_folic_acid BOOLEAN DEFAULT FALSE,
    dosage_folic_acid TEXT,
    other_medications TEXT,
    medication_regularity BOOLEAN DEFAULT FALSE,

    -- Diet
    dietary_habit TEXT CHECK (dietary_habit IN ('Balanced', 'Unbalanced')),
    daily_water_intake TEXT,
    physical_activity TEXT CHECK (physical_activity IN ('Regular', 'None')),

    -- Counselling & Referral
    counselling_topics TEXT[],
    nutrition_kit_distributed BOOLEAN DEFAULT FALSE,
    nutrition_kit_date DATE,
    nutrition_kit_instructions_provided BOOLEAN DEFAULT FALSE,
    referral TEXT[],

    -- Status & Notes
    status TEXT DEFAULT 'pending_consultation' CHECK (status IN ('pending_consultation', 'pending_meal', 'complete')),
    meal_required BOOLEAN DEFAULT FALSE,
    registrar_notes TEXT,
    registrar_image_url TEXT,
    registrar_id UUID REFERENCES public.profiles(id),
    
    consultant_advice TEXT,
    consultant_image_url TEXT,
    consultant_id UUID REFERENCES public.profiles(id),
    
    meal_distributor_notes TEXT,
    meal_image_url TEXT,
    meal_distributor_id UUID REFERENCES public.profiles(id),
    meal_served_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by authenticated users" ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Patients are viewable by authenticated users" ON public.patients FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Registrars can insert patients" ON public.patients FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'registrar'));
CREATE POLICY "Authenticated users can update patients" ON public.patients FOR UPDATE USING (auth.role() = 'authenticated');

-- 4. Trigger for new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'registrar');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
