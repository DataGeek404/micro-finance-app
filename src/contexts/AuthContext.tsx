
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType, User, UserRole } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const defaultContext: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
  register: async () => {},
};

const AuthContext = createContext<AuthContextType>(defaultContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      
      if (event === 'SIGNED_OUT') {
        // Handle sign out by clearing user
        console.log("User signed out, clearing user state");
        setUser(null);
        setIsLoading(false);
        return;
      }
      
      if (session) {
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileError) {
            console.error("Profile fetch error in state change:", profileError);
            setUser(null);
            setIsLoading(false);
            return;
          }

          if (profileData) {
            console.log("Setting user from auth state change");
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              name: profileData.name || '',
              role: profileData.role as UserRole,
              branch: profileData.branch_id || '',
              avatar: profileData.avatar || '',
              createdAt: new Date(session.user.created_at),
            });
          }
        } catch (error) {
          console.error("Error in auth state change:", error);
          setUser(null);
        } finally {
          setIsLoading(false);
        }
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    // Then check for existing session
    const checkSession = async () => {
      try {
        console.log("Checking auth session...");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          setIsLoading(false);
          return;
        }

        if (!session) {
          console.log("No session found, setting loading to false");
          setIsLoading(false);
          return;
        }

        console.log("Session found, fetching profile data...");
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          setIsLoading(false);
          return;
        }

        if (profileData) {
          console.log("Profile data found, setting user...");
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: profileData.name || '',
            role: profileData.role as UserRole,
            branch: profileData.branch_id || '',
            avatar: profileData.avatar || '',
            createdAt: new Date(session.user.created_at),
          });
        }
        
        // Always set loading to false after checking session
        setIsLoading(false);
      } catch (error) {
        console.error("Session check failed:", error);
        setIsLoading(false);
      }
    };

    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log("Attempting login...");
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Login successful",
        description: "Welcome to MicroFinance System"
      });
      
      return data;
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      console.log("Attempting registration...");
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Registration successful",
        description: "Your account has been created. You can now log in."
      });
      
      return data;
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log("Logging out...");
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Logout error:", error);
        toast({
          title: "Error signing out",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      
      setUser(null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out"
      });
    } catch (error) {
      console.error("Unexpected logout error:", error);
      toast({
        title: "Error signing out",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
