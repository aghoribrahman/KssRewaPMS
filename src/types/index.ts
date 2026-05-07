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

