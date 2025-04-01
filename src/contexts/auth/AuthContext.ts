
import { createContext } from 'react';
import { AuthContextType } from './types';

const defaultContext: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
  register: async () => {},
};

export const AuthContext = createContext<AuthContextType>(defaultContext);
