// src/contexts/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '@/lib/types'; // Import User type

interface AuthContextType {
  user: { uid: string } | null;
  userData: User | null;
  loading: boolean;
  // signIn: (email: string, password: string) => Promise<void>;
  // signOut: () => Promise<void>;
  // signUp: (email: string, password: string, displayName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ uid: string } | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate user loading
    const timer = setTimeout(() => {
      // For demonstration, set a dummy user
      const dummyUser = { uid: 'dummy-client-id-123' };
      const dummyUserData: User = {
        id: 'dummy-client-id-123',
        email: 'client@example.com',
        displayName: 'Dummy Client',
        role: 'client',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setUser(dummyUser);
      setUserData(dummyUserData);
      setLoading(false);
    }, 500); // Simulate a network request

    return () => clearTimeout(timer);
  }, []);

  const value = {
    user,
    userData,
    loading,
    // signIn,
    // signOut,
    // signUp,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};