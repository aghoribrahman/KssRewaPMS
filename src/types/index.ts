export type UserRole = 'admin' | 'registrar' | 'consultant' | 'meal_distributor';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  display_name?: string;
  assigned_districts?: string[]; // Districts this user can manage
  preferred_language?: 'en' | 'hi';
}

export type PatientStatus = 'pending_consultation' | 'pending_meal' | 'complete';

export type SickleCellStatus = 'SS' | 'AS' | 'AA';

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  contact: string; // Mobile Number
  address: string;
  district: string;
  block: string;
  village: string;
  abha_id?: string;
  aadhar_number?: string;
  
  // Medical Information
  sickle_cell_status: SickleCellStatus;
  pre_existing_diagnosis: boolean;
  date_of_diagnosis?: string;
  reports_attached: boolean;

  // Medical History
  first_symptom_onset?: string;
  previous_hospitalizations: boolean;
  blood_transfusions_count: number;
  other_health_issues?: string;

  // Present Symptoms
  symptoms: string[]; // Bone / Joint Pain, Recurring Fever, etc.
  other_symptoms?: string;

  // Current Medication & Treatment
  medication_hydroxyurea: boolean;
  dosage_hydroxyurea?: string;
  medication_folic_acid: boolean;
  dosage_folic_acid?: string;
  other_medications?: string;
  medication_regularity: boolean;

  // Diet & Lifestyle
  dietary_habit: 'Balanced' | 'Unbalanced';
  daily_water_intake?: string;
  physical_activity: 'Regular' | 'None';

  // Counselling Topics
  counselling_topics: string[];

  // Nutrition Kit
  nutrition_kit_distributed: boolean;
  nutrition_kit_date?: string;
  nutrition_kit_instructions_provided: boolean;

  // Referral
  referral: string[]; // Laboratory, Hospital Admission, Specialist

  // Feedback
  feedback_confirmation: boolean;
  specific_concerns?: string;

  // Counsellor Details
  counsellor_name?: string;
  counsellor_designation?: string;
  counsellor_organization?: string; // Default: Kiran Sewa Sansthan

  status: PatientStatus;
  meal_required: boolean;
  
  registrar_notes?: string;
  registrar_image_url?: string;
  registrar_id?: string;
  
  consultant_advice?: string;
  consultant_image_url?: string;
  consultant_id?: string;
  
  meal_distributor_notes?: string;
  meal_image_url?: string;
  meal_distributor_id?: string;
  meal_served_at?: string;

  created_at: string;
  updated_at: string;
}

