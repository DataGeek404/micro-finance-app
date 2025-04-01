
import { User as SupabaseUser } from '@supabase/supabase-js';

export enum UserRole {
  ADMIN = 'ADMIN',
  BRANCH_MANAGER = 'BRANCH_MANAGER',
  LOAN_OFFICER = 'LOAN_OFFICER',
  ACCOUNTANT = 'ACCOUNTANT',
  TELLER = 'TELLER',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  branch?: string;
  avatar?: string;
  createdAt: Date;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<any>;
}
