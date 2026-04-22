export type UserRole = 'admin' | 'registrar' | 'consultant' | 'meal_distributor';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  displayName?: string;
  assignedDistricts?: string[]; // Districts this user can manage
  preferredLanguage?: 'en' | 'hi';
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
  abhaId?: string;
  aadharNumber?: string;
  
  // Medical Information
  sickleCellStatus: SickleCellStatus;
  preExistingDiagnosis: boolean;
  dateOfDiagnosis?: string;
  reportsAttached: boolean;

  // Medical History
  firstSymptomOnset?: string;
  previousHospitalizations: boolean;
  bloodTransfusionsCount: number;
  otherHealthIssues?: string;

  // Present Symptoms
  symptoms: string[]; // Bone / Joint Pain, Recurring Fever, etc.
  otherSymptoms?: string;

  // Current Medication & Treatment
  medicationHydroxyurea: boolean;
  dosageHydroxyurea?: string;
  medicationFolicAcid: boolean;
  dosageFolicAcid?: string;
  otherMedications?: string;
  medicationRegularity: boolean;

  // Diet & Lifestyle
  dietaryHabit: 'Balanced' | 'Unbalanced';
  dailyWaterIntake?: string;
  physicalActivity: 'Regular' | 'None';

  // Counselling Topics
  counsellingTopics: string[];

  // Nutrition Kit
  nutritionKitDistributed: boolean;
  nutritionKitDate?: string;
  nutritionKitInstructionsProvided: boolean;

  // Referral
  referral: string[]; // Laboratory, Hospital Admission, Specialist

  // Feedback
  feedbackConfirmation: boolean;
  specificConcerns?: string;

  // Counsellor Details
  counsellorName?: string;
  counsellorDesignation?: string;
  counsellorOrganization?: string; // Default: Kiran Sewa Sansthan

  status: PatientStatus;
  mealRequired: boolean;
  
  registrarNotes?: string;
  registrarImageUrl?: string;
  registrarId?: string;
  
  consultantAdvice?: string;
  consultantImageUrl?: string;
  consultantId?: string;
  
  mealDistributorNotes?: string;
  mealImageUrl?: string;
  mealDistributorId?: string;
  mealServedAt?: string;

  createdAt: any;
  updatedAt: any;
}
