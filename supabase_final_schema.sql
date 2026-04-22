-- ==========================================
-- KssRewaPMS: Robust Supabase Database Schema
-- ==========================================
-- This script sets up the full database schema, including Enums, 
-- Tables, RLS Policies, Triggers, and Storage Policies.
-- Run this in the Supabase SQL Editor.

-- ==========================================
-- 1. EXTENSIONS & CUSTOM TYPES (ENUMS)
-- ==========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- ==========================================
-- 2. PROFILES TABLE (Linked to Auth)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role public.user_role DEFAULT 'registrar' NOT NULL,
    display_name TEXT,
    assigned_districts TEXT[] DEFAULT '{}',
    preferred_language TEXT DEFAULT 'hi',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 3. PATIENTS TABLE (Core Medical Records)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Personal Information
    name TEXT NOT NULL,
    age INT CHECK (age >= 0 AND age <= 120),
    gender public.gender_type DEFAULT 'male',
    contact TEXT CHECK (contact ~ '^[0-9+ ]{10,15}$'),
    address TEXT,
    district TEXT,
    block TEXT,
    village TEXT,
    abha_id TEXT UNIQUE,
    aadhar_number TEXT UNIQUE,
    
    -- Medical Information
    sickle_cell_status public.sickle_cell_status DEFAULT 'AS',
    pre_existing_diagnosis BOOLEAN DEFAULT FALSE,
    date_of_diagnosis DATE,
    reports_attached BOOLEAN DEFAULT FALSE,

    -- Medical History
    first_symptom_onset DATE,
    previous_hospitalizations BOOLEAN DEFAULT FALSE,
    blood_transfusions_count INT DEFAULT 0,
    other_health_issues TEXT,

    -- Present Symptoms
    symptoms TEXT[] DEFAULT '{}',
    other_symptoms TEXT,

    -- Medication & Treatment
    medication_hydroxyurea BOOLEAN DEFAULT FALSE,
    dosage_hydroxyurea TEXT,
    medication_folic_acid BOOLEAN DEFAULT FALSE,
    dosage_folic_acid TEXT,
    other_medications TEXT,
    medication_regularity BOOLEAN DEFAULT FALSE,

    -- Diet & Lifestyle
    dietary_habit TEXT, -- 'Balanced' or 'Unbalanced'
    daily_water_intake TEXT,
    physical_activity TEXT, -- 'Regular' or 'None'

    -- Counselling & Nutrition
    counselling_topics TEXT[] DEFAULT '{}',
    nutrition_kit_distributed BOOLEAN DEFAULT FALSE,
    nutrition_kit_date DATE,
    nutrition_kit_instructions_provided BOOLEAN DEFAULT FALSE,
    referral TEXT[] DEFAULT '{}',

    -- Feedback & Organization
    feedback_confirmation BOOLEAN DEFAULT FALSE,
    specific_concerns TEXT,
    counsellor_name TEXT,
    counsellor_designation TEXT,
    counsellor_organization TEXT DEFAULT 'Kiran Sewa Sansthan',

    -- Status & Workflow Audit
    status public.patient_status DEFAULT 'pending_consultation' NOT NULL,
    meal_required BOOLEAN DEFAULT TRUE,
    
    -- Registrar Audit
    registrar_notes TEXT,
    registrar_image_url TEXT,
    registrar_id UUID REFERENCES public.profiles(id),
    
    -- Consultant Audit
    consultant_advice TEXT,
    consultant_image_url TEXT,
    consultant_id UUID REFERENCES public.profiles(id),
    
    -- Meal Distributor Audit
    meal_distributor_notes TEXT,
    meal_image_url TEXT,
    meal_distributor_id UUID REFERENCES public.profiles(id),
    meal_served_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Security Helper: Get current user role
CREATE OR REPLACE FUNCTION public.get_user_role() 
RETURNS public.user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Profiles Policies
DROP POLICY IF EXISTS "Profiles are viewable by authenticated staff" ON public.profiles;
CREATE POLICY "Profiles are viewable by authenticated staff" 
ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles" 
ON public.profiles FOR UPDATE USING (public.get_user_role() = 'admin');

DROP POLICY IF EXISTS "Users can update own display name/language" ON public.profiles;
CREATE POLICY "Users can update own display name/language" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Patients Policies
DROP POLICY IF EXISTS "Patients viewable by authenticated staff" ON public.patients;
CREATE POLICY "Patients viewable by authenticated staff" 
ON public.patients FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Registrars and Admins can register patients" ON public.patients;
CREATE POLICY "Registrars and Admins can register patients" 
ON public.patients FOR INSERT WITH CHECK (
    public.get_user_role() IN ('registrar', 'admin')
);

-- Staff can update patient records based on role and status
DROP POLICY IF EXISTS "Registrars can update pending patients" ON public.patients;
CREATE POLICY "Registrars can update pending patients" 
ON public.patients FOR UPDATE USING (
    public.get_user_role() = 'registrar' AND status = 'pending_consultation'
);

DROP POLICY IF EXISTS "Consultants can update pending patients" ON public.patients;
CREATE POLICY "Consultants can update pending patients" 
ON public.patients FOR UPDATE USING (
    public.get_user_role() = 'consultant' AND status = 'pending_consultation'
);

DROP POLICY IF EXISTS "Meal Distributors can update pending meal patients" ON public.patients;
CREATE POLICY "Meal Distributors can update pending meal patients" 
ON public.patients FOR UPDATE USING (
    public.get_user_role() = 'meal_distributor' AND status = 'pending_meal'
);

DROP POLICY IF EXISTS "Admins have full update access" ON public.patients;
CREATE POLICY "Admins have full update access" 
ON public.patients FOR UPDATE USING (
    public.get_user_role() = 'admin'
);

-- ==========================================
-- 5. AUTOMATED TRIGGERS
-- ==========================================

-- Trigger: Update 'updated_at' timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_patients_updated_at ON public.patients;
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Automatically create a profile when a new user signs up in Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, display_name, assigned_districts)
  VALUES (
    new.id, 
    new.email, 
    COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'registrar'),
    COALESCE(new.raw_user_meta_data->>'display_name', new.email),
    COALESCE((new.raw_user_meta_data->>'assigned_districts')::text[], '{}'::text[])
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- 6. STORAGE CONFIGURATION
-- ==========================================
-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
SELECT 'images', 'images', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'images');

DROP POLICY IF EXISTS "Authenticated staff can upload images" ON storage.objects;
CREATE POLICY "Authenticated staff can upload images" 
ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'images' AND auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Images are publicly viewable" ON storage.objects;
CREATE POLICY "Images are publicly viewable" 
ON storage.objects FOR SELECT USING (bucket_id = 'images');
