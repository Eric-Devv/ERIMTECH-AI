// src/providers/auth-provider.tsx
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
// import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
// import { auth } from '@/lib/firebase'; // Assuming firebase config is in lib/firebase

// Define the shape of your user object if you want to extend FirebaseUser
interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  // Add any other custom fields you might store for a user
  isAdmin?: boolean; 
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  // Add auth functions like signIn, signOut, signUp etc.
  // For now, these are placeholders
  signInWithGoogle?: () => Promise<void>;
  signInWithEmail?: (email: string, pass: string) => Promise<void>;
  signUpWithEmail?: (email: string, pass: string) => Promise<void>;
  signOut?: () => Promise<void>;
  signInAnonymously?: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This is where you'd set up the Firebase Auth listener
    // const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
    //   if (firebaseUser) {
    //     // You might want to fetch additional user data from Firestore here (e.g., isAdmin role)
    //     const appUser: User = {
    //       uid: firebaseUser.uid,
    //       email: firebaseUser.email,
    //       displayName: firebaseUser.displayName,
    //       // isAdmin: fetchedIsAdminStatus, // example
    //     };
    //     setUser(appUser);
    //   } else {
    //     setUser(null);
    //   }
    //   setLoading(false);
    // });
    // return () => unsubscribe(); // Cleanup subscription on unmount

    // Mocking auth state for now
    setTimeout(() => {
      // To test authenticated state:
      // setUser({ uid: "mock-user-id", email: "test@example.com", displayName: "Test User", isAdmin: false });
      // To test unauthenticated state:
      setUser(null); 
      setLoading(false);
    }, 500); // Simulate loading delay
  }, []);

  // Placeholder auth functions
  const signInWithGoogle = async () => { console.log("signInWithGoogle called (mock)"); /* Implement Firebase logic */ };
  const signInWithEmail = async (email: string, pass: string) => { console.log("signInWithEmail called (mock)", email); /* Implement Firebase logic */ };
  const signUpWithEmail = async (email: string, pass: string) => { console.log("signUpWithEmail called (mock)", email); /* Implement Firebase logic */ };
  const signOut = async () => { 
    console.log("signOut called (mock)"); 
    setUser(null); // Mock sign out
    /* Implement Firebase logic */ 
  };
  const signInAnonymously = async () => { console.log("signInAnonymously called (mock)"); /* Implement Firebase logic */ };


  const value = {
    user,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    signInAnonymously,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
