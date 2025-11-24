import { createContext } from 'react';

export interface User {
  name: string;
  role: string;
}

export interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
