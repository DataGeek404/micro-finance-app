
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
      throw new Error(`Failed to fetch profile: ${profileError.message}`);
    }

    if (!profileData) {
      console.error("No profile data found");
      throw new Error("User profile not found. Please contact support.");
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
    throw error;
  }
};

export const login = async (email: string, password: string) => {
  try {
    const response = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (response.error) {
      // Provide more descriptive error messages
      let errorMessage = response.error.message;
      
      if (errorMessage.includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password. Please check your credentials and try again.";
      } else if (errorMessage.includes("Email not confirmed")) {
        errorMessage = "Your email has not been verified. Please check your inbox for a verification link.";
      } else if (errorMessage.includes("rate limit")) {
        errorMessage = "Too many login attempts. Please try again later.";
      }
      
      throw new Error(errorMessage);
    }
    
    return response;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const register = async (email: string, password: string, name: string) => {
  try {
    const response = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        }
      }
    });
    
    if (response.error) {
      // Provide more descriptive error messages
      let errorMessage = response.error.message;
      
      if (errorMessage.includes("already registered")) {
        errorMessage = "This email is already registered. Try logging in or use a different email.";
      } else if (errorMessage.includes("weak password")) {
        errorMessage = "Password is too weak. Please use a stronger password with at least 8 characters, including numbers and symbols.";
      } else if (errorMessage.includes("rate limit")) {
        errorMessage = "Too many signup attempts. Please try again later.";
      }
      
      throw new Error(errorMessage);
    }
    
    return response;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    return await supabase.auth.signOut();
  } catch (error) {
    console.error("Logout error:", error);
    throw new Error("Failed to log out. Please try again.");
  }
};

export const checkSession = async () => {
  try {
    return await supabase.auth.getSession();
  } catch (error) {
    console.error("Session check failed:", error);
    throw new Error("Failed to verify your session. Please try logging in again.");
  }
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

export const refreshSession = async () => {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      throw new Error(`Session refresh failed: ${error.message}`);
    }
    
    return data;
  } catch (error) {
    console.error("Session refresh error:", error);
    throw error;
  }
};
