
import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { AuthContext } from './AuthContext';
import { User } from './types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import * as authService from './authService';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    console.log("Initializing auth context...");
    let mounted = true;
    
    // Initial timeout to ensure loading state doesn't hang forever
    const loadingTimeout = setTimeout(() => {
      if (mounted && isLoading) {
        console.error("Auth initialization timed out, forcing loading state to false");
        setIsLoading(false);
      }
    }, 5000);

    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log("Auth state changed:", event);
      
      if (!mounted) return;

      if (event === 'SIGNED_OUT') {
        console.log("User signed out, clearing user state");
        setUser(null);
        setSession(null);
        setIsLoading(false);
        return;
      }
      
      if (newSession) {
        setSession(newSession);
        
        // Use setTimeout to prevent potential deadlocks
        setTimeout(async () => {
          try {
            console.log("Session found in auth state change, fetching profile...");
            const profileData = await authService.fetchUserProfile(newSession.user.id);
            
            if (mounted) {
              if (profileData) {
                console.log("Setting user from auth state change");
                setUser(profileData);
              } else {
                setUser(null);
              }
              setIsLoading(false);
            }
          } catch (error) {
            console.error("Error in auth state change:", error);
            if (mounted) {
              setUser(null);
              setIsLoading(false);
            }
          }
        }, 0);
      } else if (mounted) {
        setUser(null);
        setIsLoading(false);
      }
    });

    // Then check for existing session
    const checkSession = async () => {
      try {
        console.log("Checking auth session...");
        const { data: { session: existingSession }, error: sessionError } = await authService.checkSession();
        
        if (!mounted) return;

        if (sessionError) {
          console.error("Session error:", sessionError);
          setIsLoading(false);
          return;
        }

        if (!existingSession) {
          console.log("No session found, setting loading to false");
          setIsLoading(false);
          return;
        }

        setSession(existingSession);

        console.log("Session found, fetching profile data...");
        const profileData = await authService.fetchUserProfile(existingSession.user.id);

        if (!mounted) return;

        if (profileData) {
          console.log("Profile data found, setting user...");
          setUser(profileData);
        }
        
      } catch (error) {
        console.error("Session check failed:", error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    checkSession();

    return () => {
      mounted = false;
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      console.log("Attempting login...");
      setIsLoading(true);
      const { data, error } = await authService.login(email, password);

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
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (email: string, password: string, name: string) => {
    try {
      console.log("Attempting registration...");
      setIsLoading(true);
      const { data, error } = await authService.register(email, password, name);

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
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      console.log("Logging out...");
      setIsLoading(true);
      const { error } = await authService.logout();
      
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
      setSession(null);
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login: handleLogin,
        logout: handleLogout,
        register: handleRegister,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
