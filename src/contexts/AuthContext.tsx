
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType, User, UserRole } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';

// Mock user for demo purposes
const mockUser: User = {
  id: '1',
  email: 'admin@microfinance.com',
  name: 'Admin User',
  role: UserRole.ADMIN,
  branch: 'Headquarters',
  avatar: '/avatar.png',
  createdAt: new Date(),
};

const defaultContext: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
};

const AuthContext = createContext<AuthContextType>(defaultContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('microfinance_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('microfinance_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // In a real app, this would be an API call
      if (email === 'admin@microfinance.com' && password === 'password') {
        setUser(mockUser);
        localStorage.setItem('microfinance_user', JSON.stringify(mockUser));
        toast({
          title: "Login successful",
          description: "Welcome to MicroFinance System"
        });
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('microfinance_user');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out"
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
