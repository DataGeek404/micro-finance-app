
import { supabase } from '@/integrations/supabase/client';
import { User, UserRole } from './types';
import { Session } from '@supabase/supabase-js';

export const fetchUserProfile = async (userId: string): Promise<User | null> => {
  try {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
      return null;
    }

    if (!profileData) {
      console.error("No profile data found");
      return null;
    }

    return {
      id: userId,
      email: profileData.email || '',
      name: profileData.name || '',
      role: profileData.role as UserRole,
      branch: profileData.branch_id || '',
      avatar: profileData.avatar || '',
      createdAt: new Date(),
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

export const login = async (email: string, password: string) => {
  return supabase.auth.signInWithPassword({
    email,
    password,
  });
};

export const register = async (email: string, password: string, name: string) => {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name,
      }
    }
  });
};

export const logout = async () => {
  return supabase.auth.signOut();
};

export const checkSession = async () => {
  return supabase.auth.getSession();
};

export const getUserFromSession = (session: Session | null): User | null => {
  if (!session?.user) return null;
  
  // Note: This is just a placeholder. The actual user data should come from fetchUserProfile
  return {
    id: session.user.id,
    email: session.user.email || '',
    name: '',  // This will be populated by fetchUserProfile
    role: UserRole.ADMIN,  // This will be populated by fetchUserProfile
    createdAt: new Date(session.user.created_at),
  };
};
