import { Database } from './database.types';

export type UserRole = Database['public']['Enums']['user_role'];

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  display_name?: string | null;
  assigned_districts?: string[] | null;
  preferred_language?: 'en' | 'hi' | null;
}

export type PatientStatus = Database['public']['Enums']['patient_status'];
export type SickleCellStatus = Database['public']['Enums']['sickle_cell_status'];
export type GenderType = Database['public']['Enums']['gender_type'];

export type PatientMaster = Database['public']['Tables']['patient_master']['Row'];
export type PatientVisit = Database['public']['Tables']['patient_visits']['Row'];

export interface Patient extends PatientMaster, PatientVisit {
  id: string; // PatientVisit ID
  master_patient_id: string; // PatientMaster ID
}

export interface VisitHistoryItem {
  id: string;
  created_at: string;
  status: PatientStatus;
  consultant_advice?: string | null;
  symptoms?: string[] | null;
  registrar_name?: string | null;
  consultant_name?: string | null;
  meal_distributor_name?: string | null;
  meal_required: boolean;
  meal_served_at?: string | null;
  medication_hydroxyurea: boolean;
  medication_folic_acid: boolean;
  nutrition_kit_distributed: boolean;
  consultant_image_url?: string | null;
  meal_image_url?: string | null;
  is_offline_pending?: boolean; // For visual sync status
}

