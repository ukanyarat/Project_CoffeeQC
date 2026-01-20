import { createContext } from 'react';

export interface User {
  username: string;
  role: string;
}

export interface AuthContextType {
  user: User | null;
  login: (token: string) => void;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
