import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Session } from '@supabase/supabase-js';
import { AuthContext } from './AuthContext';
import { User } from './types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import * as authService from './authService';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const userActivityTimeout = useRef<number | null>(null);
  const lastActivityTime = useRef<number>(Date.now());

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  const resetUserActivityTimer = useCallback(() => {
    lastActivityTime.current = Date.now();
    
    if (userActivityTimeout.current) {
      window.clearTimeout(userActivityTimeout.current);
    }
    
    userActivityTimeout.current = window.setTimeout(() => {
      const currentTime = Date.now();
      const inactiveTime = currentTime - lastActivityTime.current;
      
      if (inactiveTime >= 60000) {
        console.log("User inactive for 60 seconds, showing session timeout warning");
        setAuthError("Session timed out due to inactivity. Please refresh your session.");
      }
    }, 60000);
  }, []);

  useEffect(() => {
    if (user) {
      const activityEvents = ['mousedown', 'keypress', 'scroll', 'touchstart'];
      
      const handleUserActivity = () => {
        resetUserActivityTimer();
      };
      
      activityEvents.forEach(event => {
        window.addEventListener(event, handleUserActivity);
      });
      
      resetUserActivityTimer();
      
      return () => {
        activityEvents.forEach(event => {
          window.removeEventListener(event, handleUserActivity);
        });
        
        if (userActivityTimeout.current) {
          window.clearTimeout(userActivityTimeout.current);
        }
      };
    }
  }, [user, resetUserActivityTimer]);

  const handleSessionRefresh = useCallback(async () => {
    try {
      setIsLoading(true);
      clearAuthError();
      
      const { session: refreshedSession } = await authService.refreshSession();
      
      if (refreshedSession) {
        setSession(refreshedSession);
        const profileData = await authService.fetchUserProfile(refreshedSession.user.id);
        setUser(profileData);
        
        toast({
          title: "Session refreshed",
          description: "Your authentication has been restored."
        });
        
        resetUserActivityTimer();
      } else {
        setUser(null);
        setSession(null);
        
        toast({
          title: "Session expired",
          description: "Please log in again to continue.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Session refresh error:", error);
      setAuthError(error instanceof Error ? error.message : "Failed to refresh session");
      
      toast({
        title: "Authentication error",
        description: "Failed to refresh your session. Please log in again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, clearAuthError, resetUserActivityTimer]);

  useEffect(() => {
    console.log("Initializing auth context...");
    let mounted = true;
    
    const loadingTimeout = setTimeout(() => {
      if (mounted && isLoading) {
        console.error("Auth initialization timed out, forcing loading state to false");
        setIsLoading(false);
        setAuthError("Authentication timed out. Please try refreshing the page.");
      }
    }, 30000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log("Auth state changed:", event);
      
      if (!mounted) return;

      if (event === 'SIGNED_OUT') {
        console.log("User signed out, clearing user state");
        setUser(null);
        setSession(null);
        setIsLoading(false);
        clearAuthError();
        return;
      }
      
      if (newSession) {
        setSession(newSession);
        clearAuthError();
        
        setTimeout(async () => {
          try {
            console.log("Session found in auth state change, fetching profile...");
            const profileData = await authService.fetchUserProfile(newSession.user.id);
            
            if (mounted) {
              if (profileData) {
                console.log("Setting user from auth state change");
                setUser(profileData);
                clearAuthError();
                
                resetUserActivityTimer();
              } else {
                setUser(null);
                setAuthError("User profile not found. Please contact support.");
              }
              setIsLoading(false);
            }
          } catch (error) {
            console.error("Error in auth state change:", error);
            if (mounted) {
              setUser(null);
              setIsLoading(false);
              setAuthError(error instanceof Error ? error.message : "Authentication error occurred");
            }
          }
        }, 0);
      } else if (mounted) {
        setUser(null);
        setIsLoading(false);
      }
    });

    const checkSession = async () => {
      try {
        console.log("Checking auth session...");
        const { data: { session: existingSession }, error: sessionError } = await authService.checkSession();
        
        if (!mounted) return;

        if (sessionError) {
          console.error("Session error:", sessionError);
          setAuthError(`Session error: ${sessionError.message}`);
          setIsLoading(false);
          return;
        }

        if (!existingSession) {
          console.log("No session found, setting loading to false");
          setIsLoading(false);
          return;
        }

        setSession(existingSession);
        clearAuthError();

        console.log("Session found, fetching profile data...");
        try {
          const profileData = await authService.fetchUserProfile(existingSession.user.id);

          if (!mounted) return;

          if (profileData) {
            console.log("Profile data found, setting user...");
            setUser(profileData);
            clearAuthError();
            
            resetUserActivityTimer();
          } else {
            setAuthError("User profile not found. Please try logging in again.");
          }
        } catch (profileError) {
          console.error("Profile fetch error:", profileError);
          setAuthError(profileError instanceof Error ? profileError.message : "Failed to load user profile");
        }
        
      } catch (error) {
        console.error("Session check failed:", error);
        setAuthError(error instanceof Error ? error.message : "Failed to verify your session");
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
      
      if (userActivityTimeout.current) {
        window.clearTimeout(userActivityTimeout.current);
      }
    };
  }, [clearAuthError, resetUserActivityTimer]);

  const handleLogin = async (email: string, password: string) => {
    try {
      console.log("Attempting login...");
      setIsLoading(true);
      clearAuthError();
      
      const { data, error } = await authService.login(email, password);

      if (error) {
        setAuthError(error.message);
        throw error;
      }

      toast({
        title: "Login successful",
        description: "Welcome to Muchiri LoanLight SACCO"
      });
      
      return data;
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error instanceof Error ? error.message : "An error occurred during login";
      setAuthError(errorMessage);
      
      toast({
        title: "Login failed",
        description: errorMessage,
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
      clearAuthError();
      
      const { data, error } = await authService.register(email, password, name);

      if (error) {
        setAuthError(error.message);
        throw error;
      }

      toast({
        title: "Registration successful",
        description: "Your account has been created. You can now log in."
      });
      
      return data;
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage = error instanceof Error ? error.message : "An error occurred during registration";
      setAuthError(errorMessage);
      
      toast({
        title: "Registration failed",
        description: errorMessage,
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
      clearAuthError();
      
      const { error } = await authService.logout();
      
      if (error) {
        console.error("Logout error:", error);
        setAuthError(error.message);
        
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
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred during logout";
      setAuthError(errorMessage);
      
      toast({
        title: "Error signing out",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authError && !isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md w-full mb-4">
          <AlertDescription className="py-2">
            <p className="mb-4">{authError}</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                onClick={handleSessionRefresh} 
                variant="outline" 
                className="w-full sm:w-auto"
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Refresh Session
              </Button>
              <Button 
                onClick={() => window.location.href = '/login'} 
                className="w-full sm:w-auto"
              >
                Sign In Again
              </Button>
            </div>
          </AlertDescription>
        </Alert>
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
      </div>
    );
  }

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
