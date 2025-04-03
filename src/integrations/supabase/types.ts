export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      branches: {
        Row: {
          address: string
          created_at: string
          email: string | null
          employee_count: number
          id: string
          location: string
          manager_id: string
          manager_name: string
          name: string
          opening_date: string
          phone: string
          status: string
          updated_at: string
        }
        Insert: {
          address: string
          created_at?: string
          email?: string | null
          employee_count?: number
          id?: string
          location: string
          manager_id: string
          manager_name: string
          name: string
          opening_date: string
          phone: string
          status: string
          updated_at?: string
        }
        Update: {
          address?: string
          created_at?: string
          email?: string | null
          employee_count?: number
          id?: string
          location?: string
          manager_id?: string
          manager_name?: string
          name?: string
          opening_date?: string
          phone?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string
          branch_id: string
          created_at: string
          date_of_birth: string
          email: string | null
          first_name: string
          gender: string
          id: string
          income_source: string
          last_name: string
          monthly_income: number
          national_id: string
          occupation: string
          phone: string
          status: string
          updated_at: string
        }
        Insert: {
          address: string
          branch_id: string
          created_at?: string
          date_of_birth: string
          email?: string | null
          first_name: string
          gender: string
          id?: string
          income_source: string
          last_name: string
          monthly_income: number
          national_id: string
          occupation: string
          phone: string
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string
          branch_id?: string
          created_at?: string
          date_of_birth?: string
          email?: string | null
          first_name?: string
          gender?: string
          id?: string
          income_source?: string
          last_name?: string
          monthly_income?: number
          national_id?: string
          occupation?: string
          phone?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      email_settings: {
        Row: {
          api_key: string | null
          created_at: string
          domain: string | null
          from_email: string
          from_name: string
          id: string
          provider: string
          smtp_host: string | null
          smtp_password: string | null
          smtp_port: number | null
          smtp_username: string | null
          updated_at: string
        }
        Insert: {
          api_key?: string | null
          created_at?: string
          domain?: string | null
          from_email: string
          from_name: string
          id?: string
          provider: string
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: number | null
          smtp_username?: string | null
          updated_at?: string
        }
        Update: {
          api_key?: string | null
          created_at?: string
          domain?: string | null
          from_email?: string
          from_name?: string
          id?: string
          provider?: string
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: number | null
          smtp_username?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      expense_types: {
        Row: {
          budget: number | null
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          budget?: number | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          budget?: number | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          branch_id: string
          created_at: string
          date: string
          description: string
          id: string
          payment_method: string
          reference: string | null
          status: string
          type_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          branch_id: string
          created_at?: string
          date: string
          description: string
          id?: string
          payment_method: string
          reference?: string | null
          status?: string
          type_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          branch_id?: string
          created_at?: string
          date?: string
          description?: string
          id?: string
          payment_method?: string
          reference?: string | null
          status?: string
          type_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "expense_types"
            referencedColumns: ["id"]
          },
        ]
      }
      general_settings: {
        Row: {
          created_at: string
          date_format: string
          id: string
          language: string
          time_format: string
          timezone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_format: string
          id?: string
          language: string
          time_format: string
          timezone: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_format?: string
          id?: string
          language?: string
          time_format?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      loan_applications: {
        Row: {
          amount: number
          client_id: string
          created_at: string
          id: string
          product_id: string
          purpose: string
          status: string
          term: number
          updated_at: string
        }
        Insert: {
          amount: number
          client_id: string
          created_at?: string
          id?: string
          product_id: string
          purpose: string
          status?: string
          term: number
          updated_at?: string
        }
        Update: {
          amount?: number
          client_id?: string
          created_at?: string
          id?: string
          product_id?: string
          purpose?: string
          status?: string
          term?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "loan_applications_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loan_applications_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "loan_products"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_charges: {
        Row: {
          amount: number
          charge_when: string
          created_at: string
          id: string
          name: string
          type: string
          updated_at: string
        }
        Insert: {
          amount: number
          charge_when: string
          created_at?: string
          id?: string
          name: string
          type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          charge_when?: string
          created_at?: string
          id?: string
          name?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      loan_charges_junction: {
        Row: {
          amount: number
          charge_id: string
          loan_id: string
        }
        Insert: {
          amount: number
          charge_id: string
          loan_id: string
        }
        Update: {
          amount?: number
          charge_id?: string
          loan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loan_charges_junction_charge_id_fkey"
            columns: ["charge_id"]
            isOneToOne: false
            referencedRelation: "loan_charges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loan_charges_junction_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_products: {
        Row: {
          created_at: string
          description: string
          id: string
          interest_rate: number
          interest_type: string
          max_amount: number
          max_term: number
          min_amount: number
          min_term: number
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          interest_rate: number
          interest_type: string
          max_amount: number
          max_term: number
          min_amount: number
          min_term: number
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          interest_rate?: number
          interest_type?: string
          max_amount?: number
          max_term?: number
          min_amount?: number
          min_term?: number
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      loan_repayments: {
        Row: {
          amount: number
          created_at: string
          due_date: string
          id: string
          is_paid: boolean
          loan_id: string
          paid_date: string | null
          payment_method: string | null
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          due_date: string
          id?: string
          is_paid?: boolean
          loan_id: string
          paid_date?: string | null
          payment_method?: string | null
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string
          id?: string
          is_paid?: boolean
          loan_id?: string
          paid_date?: string | null
          payment_method?: string | null
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "loan_repayments_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["id"]
          },
        ]
      }
      loans: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          branch_id: string
          client_id: string
          created_at: string
          disbursed_at: string | null
          end_date: string | null
          id: string
          interest_rate: number
          product_id: string | null
          purpose: string
          start_date: string | null
          status: string
          term: number
          updated_at: string
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          branch_id: string
          client_id: string
          created_at?: string
          disbursed_at?: string | null
          end_date?: string | null
          id?: string
          interest_rate: number
          product_id?: string | null
          purpose: string
          start_date?: string | null
          status: string
          term: number
          updated_at?: string
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          branch_id?: string
          client_id?: string
          created_at?: string
          disbursed_at?: string | null
          end_date?: string | null
          id?: string
          interest_rate?: number
          product_id?: string | null
          purpose?: string
          start_date?: string | null
          status?: string
          term?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "loans_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loans_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loans_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "loan_products"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_settings: {
        Row: {
          address: string
          created_at: string
          currency_code: string
          email: string
          fiscal_year_end_month: number
          fiscal_year_start_month: number
          id: string
          logo: string | null
          name: string
          phone: string
          tax_id: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address: string
          created_at?: string
          currency_code: string
          email: string
          fiscal_year_end_month: number
          fiscal_year_start_month: number
          id?: string
          logo?: string | null
          name: string
          phone: string
          tax_id?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string
          created_at?: string
          currency_code?: string
          email?: string
          fiscal_year_end_month?: number
          fiscal_year_start_month?: number
          id?: string
          logo?: string | null
          name?: string
          phone?: string
          tax_id?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      payroll_items: {
        Row: {
          allowances: number
          basic_salary: number
          created_at: string
          deductions: number
          employee_id: string
          id: string
          net_salary: number
          payment_date: string | null
          payment_method: string | null
          payment_reference: string | null
          payroll_id: string
          status: string
          updated_at: string
        }
        Insert: {
          allowances?: number
          basic_salary: number
          created_at?: string
          deductions?: number
          employee_id: string
          id?: string
          net_salary: number
          payment_date?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          payroll_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          allowances?: number
          basic_salary?: number
          created_at?: string
          deductions?: number
          employee_id?: string
          id?: string
          net_salary?: number
          payment_date?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          payroll_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payroll_items_payroll_id_fkey"
            columns: ["payroll_id"]
            isOneToOne: false
            referencedRelation: "payrolls"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_template_items: {
        Row: {
          created_at: string
          id: string
          name: string
          template_id: string
          type: string
          updated_at: string
          value: number
          value_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          template_id: string
          type: string
          updated_at?: string
          value: number
          value_type: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          template_id?: string
          type?: string
          updated_at?: string
          value?: number
          value_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "payroll_template_items_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "payroll_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_templates: {
        Row: {
          created_at: string
          description: string
          id: string
          is_default: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          is_default?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          is_default?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      payrolls: {
        Row: {
          branch_id: string
          created_at: string
          end_date: string
          id: string
          name: string
          period: string
          start_date: string
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          branch_id: string
          created_at?: string
          end_date: string
          id?: string
          name: string
          period: string
          start_date: string
          status: string
          total_amount: number
          updated_at?: string
        }
        Update: {
          branch_id?: string
          created_at?: string
          end_date?: string
          id?: string
          name?: string
          period?: string
          start_date?: string
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payrolls_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar: string | null
          branch_id: string | null
          created_at: string
          email: string
          id: string
          name: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          avatar?: string | null
          branch_id?: string | null
          created_at?: string
          email: string
          id: string
          name: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          avatar?: string | null
          branch_id?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: [
          {
            foreignKeyName: "profiles_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_settings: {
        Row: {
          account_sid: string | null
          api_key: string | null
          auth_token: string | null
          created_at: string
          from_number: string | null
          id: string
          provider: string
          sender_id: string | null
          updated_at: string
        }
        Insert: {
          account_sid?: string | null
          api_key?: string | null
          auth_token?: string | null
          created_at?: string
          from_number?: string | null
          id?: string
          provider: string
          sender_id?: string | null
          updated_at?: string
        }
        Update: {
          account_sid?: string | null
          api_key?: string | null
          auth_token?: string | null
          created_at?: string
          from_number?: string | null
          id?: string
          provider?: string
          sender_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          allowed_file_types: string[]
          created_at: string
          debug_mode: boolean
          id: string
          maintenance_mode: boolean
          max_file_upload_size: number
          updated_at: string
        }
        Insert: {
          allowed_file_types: string[]
          created_at?: string
          debug_mode?: boolean
          id?: string
          maintenance_mode?: boolean
          max_file_upload_size: number
          updated_at?: string
        }
        Update: {
          allowed_file_types?: string[]
          created_at?: string
          debug_mode?: boolean
          id?: string
          maintenance_mode?: boolean
          max_file_upload_size?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
    }
    Enums: {
      user_role:
        | "ADMIN"
        | "BRANCH_MANAGER"
        | "LOAN_OFFICER"
        | "ACCOUNTANT"
        | "TELLER"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
