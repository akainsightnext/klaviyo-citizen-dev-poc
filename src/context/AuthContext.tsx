import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export type UserRole = 'citizen_dev' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  team: string;
  avatar: string;
  joinedAt: string;
  status: 'active' | 'pending' | 'suspended';
}

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Sarah Chen', email: 'sarah.chen@klaviyo.com', role: 'citizen_dev', team: 'Marketing Ops', avatar: 'SC', joinedAt: '2024-01-15', status: 'active' },
  { id: 'u2', name: 'James Okafor', email: 'james.okafor@klaviyo.com', role: 'citizen_dev', team: 'Growth', avatar: 'JO', joinedAt: '2024-02-20', status: 'active' },
  { id: 'u3', name: 'Priya Sharma', email: 'priya.sharma@klaviyo.com', role: 'citizen_dev', team: 'Data Analytics', avatar: 'PS', joinedAt: '2024-03-10', status: 'active' },
  { id: 'u4', name: 'Mohamed Ali', email: 'mohamed.ali@klaviyo.com', role: 'admin', team: 'Security DevOps', avatar: 'MA', joinedAt: '2023-06-01', status: 'active' },
  { id: 'u5', name: 'Lisa Park', email: 'lisa.park@klaviyo.com', role: 'admin', team: 'Platform Engineering', avatar: 'LP', joinedAt: '2023-08-15', status: 'active' },
  { id: 'u6', name: 'Tom Rivera', email: 'tom.rivera@klaviyo.com', role: 'citizen_dev', team: 'Revenue Ops', avatar: 'TR', joinedAt: '2024-04-05', status: 'pending' },
];

interface AuthContextType {
  currentUser: User | null;
  login: (user: User) => void;
  logout: () => void;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);

  const login = (user: User) => setCurrentUser(user);
  const logout = () => setCurrentUser(null);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, users, setUsers }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
