-- 1. Custom Types (Enums)
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('admin', 'registrar', 'consultant', 'meal_distributor');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.patient_status AS ENUM ('pending_consultation', 'pending_meal', 'complete');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.sickle_cell_status AS ENUM ('SS', 'AS', 'AA');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.gender_type AS ENUM ('male', 'female', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Security Helper Functions
CREATE OR REPLACE FUNCTION auth.get_user_role() 
RETURNS public.user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 3. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role public.user_role DEFAULT 'registrar',
    display_name TEXT,
    assigned_districts TEXT[],
    preferred_language TEXT DEFAULT 'hi',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Patients Table
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    age INT,
    gender public.gender_type,
    contact TEXT,
    address TEXT,
    district TEXT,
    block TEXT,
    village TEXT,
    abha_id TEXT,
    aadhar_number TEXT,
    
    -- Medical Information
    sickle_cell_status public.sickle_cell_status,
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
    dietary_habit TEXT,
    daily_water_intake TEXT,
    physical_activity TEXT,

    -- Counselling & Referral
    counselling_topics TEXT[],
    nutrition_kit_distributed BOOLEAN DEFAULT FALSE,
    nutrition_kit_date DATE,
    nutrition_kit_instructions_provided BOOLEAN DEFAULT FALSE,
    referral TEXT[],

    -- Status & Notes
    status public.patient_status DEFAULT 'pending_consultation',
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

-- 5. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- 6. Advanced RLS Policies

-- Profiles
CREATE POLICY "Profiles viewable by team" 
    ON public.profiles FOR SELECT 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Users can self-manage profiles" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

-- Patients
CREATE POLICY "Patients viewable by authenticated staff" 
    ON public.patients FOR SELECT 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Registrars can register patients" 
    ON public.patients FOR INSERT 
    WITH CHECK (auth.get_user_role() = 'registrar' OR auth.get_user_role() = 'admin');

CREATE POLICY "Staff can update patient records" 
    ON public.patients FOR UPDATE 
    USING (auth.role() = 'authenticated');

-- 7. Automated Profile Creation Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'registrar');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Storage Configuration (Images)
-- Note: Run these in the Supabase Dashboard to create the bucket if not exists
-- INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true);

CREATE POLICY "Staff can upload images" 
    ON storage.objects FOR INSERT 
    WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

CREATE POLICY "Images are publicly viewable" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'images');
