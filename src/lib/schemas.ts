import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginFormData = z.infer<typeof LoginSchema>;

export const PatientSchema = z.object({
  id: z.string().uuid().optional(),
  master_patient_id: z.string().uuid().optional(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.coerce.number().min(0).max(120),
  gender: z.enum(['male', 'female', 'other']),
  contact: z.string().regex(/^\d{10}$/, 'Contact must be a 10-digit number'),
  address: z.string().min(2, 'Address must be at least 2 characters'),
  district: z.string().min(1, 'District is required'),
  block: z.string().min(1, 'Block is required'),
  village: z.string().min(1, 'Village is required'),
  abha_id: z.string().optional(),
  aadhar_number: z.string().regex(/^\d{12}$/, 'Aadhar must be 12 digits').optional().or(z.literal('')),
  
  // Medical Information
  sickle_cell_status: z.enum(['SS', 'AS', 'AA']).default('AS'),
  pre_existing_diagnosis: z.boolean().default(false),
  date_of_diagnosis: z.string().optional(),
  reports_attached: z.boolean().default(false),

  // Medical History
  first_symptom_onset: z.string().optional(),
  previous_hospitalizations: z.boolean().default(false),
  blood_transfusions_count: z.coerce.number().min(0).default(0),
  other_health_issues: z.string().optional(),

  // Present Symptoms
  symptoms: z.array(z.string()).default([]),
  other_symptoms: z.string().optional(),

  // Current Medication & Treatment
  medication_hydroxyurea: z.boolean().default(false),
  dosage_hydroxyurea: z.string().optional(),
  medication_folic_acid: z.boolean().default(false),
  dosage_folic_acid: z.string().optional(),
  other_medications: z.string().optional(),
  medication_regularity: z.boolean().default(false),

  // Diet & Lifestyle
  dietary_habit: z.string().optional(),
  daily_water_intake: z.string().optional(),
  physical_activity: z.string().optional(),

  // Counselling Topics
  counselling_topics: z.array(z.string()).default([]),

  // Nutrition Kit
  nutrition_kit_distributed: z.boolean().default(false),
  nutrition_kit_date: z.string().optional(),
  nutrition_kit_instructions_provided: z.boolean().default(false),

  // Referral
  referral: z.array(z.string()).default([]),

  // Feedback
  feedback_confirmation: z.boolean().default(false),
  specific_concerns: z.string().optional(),
});

export type PatientFormData = z.infer<typeof PatientSchema>;

export const ConsultantActionSchema = z.object({
  advice: z.string().min(5, 'Clinical advice must be at least 5 characters'),
  imageUrl: z.string().optional().or(z.literal('')),
});

export type ConsultantActionData = z.infer<typeof ConsultantActionSchema>;

export const DistributorActionSchema = z.object({
  notes: z.string().min(3, 'Distribution notes must be at least 3 characters'),
  imageUrl: z.string().optional().or(z.literal('')),
});

export type DistributorActionData = z.infer<typeof DistributorActionSchema>;
