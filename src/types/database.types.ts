export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      app_errors: {
        Row: {
          id: string
          user_id: string | null
          error_message: string
          error_stack: string | null
          component_stack: string | null
          app_state_snapshot: Json | null
          device_info: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          error_message: string
          error_stack?: string | null
          component_stack?: string | null
          app_state_snapshot?: Json | null
          device_info?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          error_message?: string
          error_stack?: string | null
          component_stack?: string | null
          app_state_snapshot?: Json | null
          device_info?: Json | null
          created_at?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          changed_by: string | null
          created_at: string | null
          id: string
          new_data: Json | null
          old_data: Json | null
          record_id: string
          table_name: string
        }
        Insert: {
          action: string
          changed_by?: string | null
          created_at?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id: string
          table_name: string
        }
        Update: {
          action?: string
          changed_by?: string | null
          created_at?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string
          table_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clinical_audit_logs: {
        Row: {
          action_type: string
          actor_id: string | null
          actor_name: string | null
          created_at: string | null
          delta: Json | null
          id: string
          patient_id: string | null
          transaction_id: string
        }
        Insert: {
          action_type: string
          actor_id?: string | null
          actor_name?: string | null
          created_at?: string | null
          delta?: Json | null
          id?: string
          patient_id?: string | null
          transaction_id: string
        }
        Update: {
          action_type?: string
          actor_id?: string | null
          actor_name?: string | null
          created_at?: string | null
          delta?: Json | null
          id?: string
          patient_id?: string | null
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinical_audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_audit_logs_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients_legacy_backup"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_master: {
        Row: {
          aadhar_number: string | null
          abha_id: string | null
          address: string | null
          age: number | null
          block: string | null
          contact: string | null
          created_at: string | null
          date_of_diagnosis: string | null
          district: string | null
          gender: Database["public"]["Enums"]["gender_type"] | null
          id: string
          name: string
          pre_existing_diagnosis: boolean | null
          sickle_cell_status:
            | Database["public"]["Enums"]["sickle_cell_status"]
            | null
          updated_at: string | null
          village: string | null
        }
        Insert: {
          aadhar_number?: string | null
          abha_id?: string | null
          address?: string | null
          age?: number | null
          block?: string | null
          contact?: string | null
          created_at?: string | null
          date_of_diagnosis?: string | null
          district?: string | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          name: string
          pre_existing_diagnosis?: boolean | null
          sickle_cell_status?:
            | Database["public"]["Enums"]["sickle_cell_status"]
            | null
          updated_at?: string | null
          village?: string | null
        }
        Update: {
          aadhar_number?: string | null
          abha_id?: string | null
          address?: string | null
          age?: number | null
          block?: string | null
          contact?: string | null
          created_at?: string | null
          date_of_diagnosis?: string | null
          district?: string | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          name?: string
          pre_existing_diagnosis?: boolean | null
          sickle_cell_status?:
            | Database["public"]["Enums"]["sickle_cell_status"]
            | null
          updated_at?: string | null
          village?: string | null
        }
        Relationships: []
      }
      patient_visits: {
        Row: {
          blood_transfusions_count: number | null
          consultant_advice: string | null
          consultant_id: string | null
          consultant_image_url: string | null
          consultant_name: string | null
          counselling_topics: string[] | null
          counsellor_designation: string | null
          counsellor_name: string | null
          counsellor_organization: string | null
          created_at: string | null
          daily_water_intake: string | null
          dietary_habit: string | null
          dosage_folic_acid: string | null
          dosage_hydroxyurea: string | null
          feedback_confirmation: boolean | null
          first_symptom_onset: string | null
          id: string
          last_transaction_id: string | null
          meal_distributor_id: string | null
          meal_distributor_name: string | null
          meal_distributor_notes: string | null
          meal_image_url: string | null
          meal_required: boolean | null
          meal_served_at: string | null
          medication_folic_acid: boolean | null
          medication_hydroxyurea: boolean | null
          medication_regularity: boolean | null
          nutrition_kit_date: string | null
          nutrition_kit_distributed: boolean | null
          nutrition_kit_instructions_provided: boolean | null
          other_health_issues: string | null
          other_medications: string | null
          other_symptoms: string | null
          patient_id: string | null
          physical_activity: string | null
          previous_hospitalizations: boolean | null
          referral: string[] | null
          registrar_id: string | null
          registrar_image_url: string | null
          registrar_name: string | null
          registrar_notes: string | null
          reports_attached: boolean | null
          specific_concerns: string | null
          status: Database["public"]["Enums"]["patient_status"] | null
          status_changed_at: string | null
          status_changed_by: string | null
          symptoms: string[] | null
          updated_at: string | null
          weight: number | null
          bp: string | null
          consultation_completed_at: string | null
        }
        Insert: {
          blood_transfusions_count?: number | null
          consultant_advice?: string | null
          consultant_id?: string | null
          consultant_image_url?: string | null
          consultant_name?: string | null
          counselling_topics?: string[] | null
          counsellor_designation?: string | null
          counsellor_name?: string | null
          counsellor_organization?: string | null
          created_at?: string | null
          daily_water_intake?: string | null
          dietary_habit?: string | null
          dosage_folic_acid?: string | null
          dosage_hydroxyurea?: string | null
          feedback_confirmation?: boolean | null
          first_symptom_onset?: string | null
          id?: string
          last_transaction_id?: string | null
          meal_distributor_id?: string | null
          meal_distributor_name?: string | null
          meal_distributor_notes?: string | null
          meal_image_url?: string | null
          meal_required?: boolean | null
          meal_served_at?: string | null
          medication_folic_acid?: boolean | null
          medication_hydroxyurea?: boolean | null
          medication_regularity?: boolean | null
          nutrition_kit_date?: string | null
          nutrition_kit_distributed?: boolean | null
          nutrition_kit_instructions_provided?: boolean | null
          other_health_issues?: string | null
          other_medications?: string | null
          other_symptoms?: string | null
          patient_id?: string | null
          physical_activity?: string | null
          previous_hospitalizations?: boolean | null
          referral?: string[] | null
          registrar_id?: string | null
          registrar_image_url?: string | null
          registrar_name?: string | null
          registrar_notes?: string | null
          reports_attached?: boolean | null
          specific_concerns?: string | null
          status?: Database["public"]["Enums"]["patient_status"] | null
          status_changed_at?: string | null
          status_changed_by?: string | null
          symptoms?: string[] | null
          updated_at?: string | null
          weight?: number | null
          bp?: string | null
          consultation_completed_at?: string | null
        }
        Update: {
          blood_transfusions_count?: number | null
          consultant_advice?: string | null
          consultant_id?: string | null
          consultant_image_url?: string | null
          consultant_name?: string | null
          counselling_topics?: string[] | null
          counsellor_designation?: string | null
          counsellor_name?: string | null
          counsellor_organization?: string | null
          created_at?: string | null
          daily_water_intake?: string | null
          dietary_habit?: string | null
          dosage_folic_acid?: string | null
          dosage_hydroxyurea?: string | null
          feedback_confirmation?: boolean | null
          first_symptom_onset?: string | null
          id?: string
          last_transaction_id?: string | null
          meal_distributor_id?: string | null
          meal_distributor_name?: string | null
          meal_distributor_notes?: string | null
          meal_image_url?: string | null
          meal_required?: boolean | null
          meal_served_at?: string | null
          medication_folic_acid?: boolean | null
          medication_hydroxyurea?: boolean | null
          medication_regularity?: boolean | null
          nutrition_kit_date?: string | null
          nutrition_kit_distributed?: boolean | null
          nutrition_kit_instructions_provided?: boolean | null
          other_health_issues?: string | null
          other_medications?: string | null
          other_symptoms?: string | null
          patient_id?: string | null
          physical_activity?: string | null
          previous_hospitalizations?: boolean | null
          referral?: string[] | null
          registrar_id?: string | null
          registrar_image_url?: string | null
          registrar_name?: string | null
          registrar_notes?: string | null
          reports_attached?: boolean | null
          specific_concerns?: string | null
          status?: Database["public"]["Enums"]["patient_status"] | null
          status_changed_at?: string | null
          status_changed_by?: string | null
          symptoms?: string[] | null
          updated_at?: string | null
          weight?: number | null
          bp?: string | null
          consultation_completed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_visits_consultant_id_fkey"
            columns: ["consultant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_visits_meal_distributor_id_fkey"
            columns: ["meal_distributor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_visits_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_master"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_visits_registrar_id_fkey"
            columns: ["registrar_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      patients_legacy_backup: {
        Row: {
          aadhar_number: string | null
          abha_id: string | null
          address: string | null
          age: number | null
          block: string | null
          blood_transfusions_count: number | null
          consultant_advice: string | null
          consultant_id: string | null
          consultant_image_url: string | null
          consultant_name: string | null
          contact: string | null
          counselling_topics: string[] | null
          counsellor_designation: string | null
          counsellor_name: string | null
          counsellor_organization: string | null
          created_at: string | null
          daily_water_intake: string | null
          date_of_diagnosis: string | null
          dietary_habit: string | null
          district: string | null
          dosage_folic_acid: string | null
          dosage_hydroxyurea: string | null
          feedback_confirmation: boolean | null
          first_symptom_onset: string | null
          gender: Database["public"]["Enums"]["gender_type"] | null
          id: string
          last_transaction_id: string | null
          master_patient_id: string | null
          meal_distributor_id: string | null
          meal_distributor_name: string | null
          meal_distributor_notes: string | null
          meal_image_url: string | null
          meal_required: boolean | null
          meal_served_at: string | null
          medication_folic_acid: boolean | null
          medication_hydroxyurea: boolean | null
          medication_regularity: boolean | null
          name: string
          nutrition_kit_date: string | null
          nutrition_kit_distributed: boolean | null
          nutrition_kit_instructions_provided: boolean | null
          other_health_issues: string | null
          other_medications: string | null
          other_symptoms: string | null
          physical_activity: string | null
          pre_existing_diagnosis: boolean | null
          previous_hospitalizations: boolean | null
          referral: string[] | null
          registrar_id: string | null
          registrar_image_url: string | null
          registrar_name: string | null
          registrar_notes: string | null
          reports_attached: boolean | null
          sickle_cell_status:
            | Database["public"]["Enums"]["sickle_cell_status"]
            | null
          specific_concerns: string | null
          status: Database["public"]["Enums"]["patient_status"]
          symptoms: string[] | null
          updated_at: string | null
          village: string | null
        }
        Insert: {
          aadhar_number?: string | null
          abha_id?: string | null
          address?: string | null
          age?: number | null
          block?: string | null
          blood_transfusions_count?: number | null
          consultant_advice?: string | null
          consultant_id?: string | null
          consultant_image_url?: string | null
          consultant_name?: string | null
          contact?: string | null
          counselling_topics?: string[] | null
          counsellor_designation?: string | null
          counsellor_name?: string | null
          counsellor_organization?: string | null
          created_at?: string | null
          daily_water_intake?: string | null
          date_of_diagnosis?: string | null
          dietary_habit?: string | null
          district?: string | null
          dosage_folic_acid?: string | null
          dosage_hydroxyurea?: string | null
          feedback_confirmation?: boolean | null
          first_symptom_onset?: string | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          last_transaction_id?: string | null
          master_patient_id?: string | null
          meal_distributor_id?: string | null
          meal_distributor_name?: string | null
          meal_distributor_notes?: string | null
          meal_image_url?: string | null
          meal_required?: boolean | null
          meal_served_at?: string | null
          medication_folic_acid?: boolean | null
          medication_hydroxyurea?: boolean | null
          medication_regularity?: boolean | null
          name: string
          nutrition_kit_date?: string | null
          nutrition_kit_distributed?: boolean | null
          nutrition_kit_instructions_provided?: boolean | null
          other_health_issues?: string | null
          other_medications?: string | null
          other_symptoms?: string | null
          physical_activity?: string | null
          pre_existing_diagnosis?: boolean | null
          previous_hospitalizations?: boolean | null
          referral?: string[] | null
          registrar_id?: string | null
          registrar_image_url?: string | null
          registrar_name?: string | null
          registrar_notes?: string | null
          reports_attached?: boolean | null
          sickle_cell_status?:
            | Database["public"]["Enums"]["sickle_cell_status"]
            | null
          specific_concerns?: string | null
          status?: Database["public"]["Enums"]["patient_status"]
          symptoms?: string[] | null
          updated_at?: string | null
          weight?: number | null
          bp?: string | null
          village?: string | null
        }
        Update: {
          aadhar_number?: string | null
          abha_id?: string | null
          address?: string | null
          age?: number | null
          block?: string | null
          blood_transfusions_count?: number | null
          consultant_advice?: string | null
          consultant_id?: string | null
          consultant_image_url?: string | null
          consultant_name?: string | null
          contact?: string | null
          counselling_topics?: string[] | null
          counsellor_designation?: string | null
          counsellor_name?: string | null
          counsellor_organization?: string | null
          created_at?: string | null
          daily_water_intake?: string | null
          date_of_diagnosis?: string | null
          dietary_habit?: string | null
          district?: string | null
          dosage_folic_acid?: string | null
          dosage_hydroxyurea?: string | null
          feedback_confirmation?: boolean | null
          first_symptom_onset?: string | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          last_transaction_id?: string | null
          master_patient_id?: string | null
          meal_distributor_id?: string | null
          meal_distributor_name?: string | null
          meal_distributor_notes?: string | null
          meal_image_url?: string | null
          meal_required?: boolean | null
          meal_served_at?: string | null
          medication_folic_acid?: boolean | null
          medication_hydroxyurea?: boolean | null
          medication_regularity?: boolean | null
          name?: string
          nutrition_kit_date?: string | null
          nutrition_kit_distributed?: boolean | null
          nutrition_kit_instructions_provided?: boolean | null
          other_health_issues?: string | null
          other_medications?: string | null
          other_symptoms?: string | null
          physical_activity?: string | null
          pre_existing_diagnosis?: boolean | null
          previous_hospitalizations?: boolean | null
          referral?: string[] | null
          registrar_id?: string | null
          registrar_image_url?: string | null
          registrar_name?: string | null
          registrar_notes?: string | null
          reports_attached?: boolean | null
          sickle_cell_status?:
            | Database["public"]["Enums"]["sickle_cell_status"]
            | null
          specific_concerns?: string | null
          status?: Database["public"]["Enums"]["patient_status"]
          symptoms?: string[] | null
          updated_at?: string | null
          weight?: number | null
          bp?: string | null
          village?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_consultant_id_fkey"
            columns: ["consultant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_master_patient_id_fkey"
            columns: ["master_patient_id"]
            isOneToOne: false
            referencedRelation: "patients_legacy_backup"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_meal_distributor_id_fkey"
            columns: ["meal_distributor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_registrar_id_fkey"
            columns: ["registrar_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          assigned_districts: string[] | null
          created_at: string | null
          display_name: string | null
          email: string
          id: string
          preferred_language: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          assigned_districts?: string[] | null
          created_at?: string | null
          display_name?: string | null
          email: string
          id: string
          preferred_language?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          weight?: number | null
          bp?: string | null
        }
        Update: {
          assigned_districts?: string[] | null
          created_at?: string | null
          display_name?: string | null
          email?: string
          id?: string
          preferred_language?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          weight?: number | null
          bp?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      find_patient_by_identity: {
        Args: {
          p_contact?: string | null
          p_aadhar?: string | null
          p_abha?: string | null
        }
        Returns: Database["public"]["Tables"]["patient_master"]["Row"][]
      }
      get_auth_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      register_patient_visit: {
        Args: {
          p_master: Json
          p_timestamp: string
          p_visit: Json
          p_visit_id: string
        }
        Returns: string
      }
    }
    Enums: {
      gender_type: "male" | "female" | "other"
      patient_status:
        | "pending_consultation"
        | "pending_meal"
        | "complete"
        | "needs_correction"
        | "escalated"
      sickle_cell_status: "SS" | "AS" | "AA"
      user_role:
        | "admin"
        | "registrar"
        | "consultant"
        | "meal_distributor"
        | "visitor"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
> = Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
> = Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
> = Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never

export type Enums<
  PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
> = Database["public"]["Enums"][PublicEnumNameOrOptions]
