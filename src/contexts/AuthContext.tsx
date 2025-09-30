'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  userData: any;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Fetch additional user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        } else {
          // Create user document if it doesn't exist
          const newUserData = {
            uid: user.uid,
            email: user.email,
            name: user.displayName || 'User',
            avatarUrl: user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'User'}`,
            role: 'user',
            kyc_status: 'pending',
            rating: 0,
            reviews: 0,
            createdAt: new Date(),
          };
          await setDoc(doc(db, 'users', user.uid), newUserData);
          setUserData(newUserData);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email: string, password: string, name: string) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName: name });
    
    // Create user document in Firestore
    const userData = {
      uid: user.uid,
      email: user.email,
      name: name,
      avatarUrl: `https://ui-avatars.com/api/?name=${name}`,
      role: 'user',
      kyc_status: 'pending',
      rating: 0,
      reviews: 0,
      createdAt: new Date(),
    };
    await setDoc(doc(db, 'users', user.uid), userData);
    setUserData(userData);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateUserProfile = async (data: any) => {
    if (!user) return;
    
    if (data.name) {
      await updateProfile(user, { displayName: data.name });
    }
    
    await setDoc(doc(db, 'users', user.uid), data, { merge: true });
    setUserData((prev: any) => ({ ...prev, ...data }));
  };

  const value = {
    user,
    userData,
    loading,
    login,
    register,
    logout,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}