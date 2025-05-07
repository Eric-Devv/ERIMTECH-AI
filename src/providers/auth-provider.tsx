// src/providers/auth-provider.tsx
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  User as FirebaseUser,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously as firebaseSignInAnonymously,
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase'; // Using real Firebase config
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  isAdmin?: boolean; 
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<User | null>;
  signInWithEmail: (email: string, pass: string) => Promise<User | null>;
  signUpWithEmail: (email: string, pass: string, displayName?: string) => Promise<User | null>;
  signOut: () => Promise<void>;
  signInAnonymously: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        let isAdmin = false;
        if (userDocSnap.exists()) {
          isAdmin = userDocSnap.data()?.isAdmin || false;
        } else {
          // Create user document if it doesn't exist (e.g. for Google/Anonymous sign-in)
          try {
            await setDoc(userDocRef, {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || 'Anonymous User',
              photoURL: firebaseUser.photoURL,
              createdAt: serverTimestamp(),
              lastLogin: serverTimestamp(),
              isAdmin: false, // Default role
            });
          } catch (error) {
            console.error("Error creating user document in Firestore:", error);
          }
        }

        const appUser: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          isAdmin,
        };
        setUser(appUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const mapFirebaseUserToAppUser = async (firebaseUser: FirebaseUser): Promise<User> => {
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      let isAdmin = false;
      if (userDocSnap.exists()) {
          isAdmin = userDocSnap.data()?.isAdmin || false;
           // Update last login
          await setDoc(userDocRef, { lastLogin: serverTimestamp() }, { merge: true });
      } else {
           // New user, create doc
           await setDoc(userDocRef, {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || `User-${firebaseUser.uid.substring(0,5)}`,
              photoURL: firebaseUser.photoURL,
              createdAt: serverTimestamp(),
              lastLogin: serverTimestamp(),
              isAdmin: false,
          });
      }
      return {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          isAdmin,
      };
  };

  const signInWithGoogle = async (): Promise<User | null> => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const appUser = await mapFirebaseUserToAppUser(result.user);
      setUser(appUser);
      toast({ title: "Google Sign-In Successful", description: `Welcome, ${appUser.displayName}!`});
      return appUser;
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      toast({ title: "Google Sign-In Failed", description: error.message, variant: "destructive" });
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, pass: string): Promise<User | null> => {
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, pass);
      const appUser = await mapFirebaseUserToAppUser(result.user);
      setUser(appUser);
      toast({ title: "Login Successful", description: `Welcome back, ${appUser.displayName}!` });
      return appUser;
    } catch (error: any) {
      console.error("Email Sign-In Error:", error);
      toast({ title: "Login Failed", description: error.message, variant: "destructive" });
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, displayName?: string): Promise<User | null> => {
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      if (displayName && result.user) {
        await updateProfile(result.user, { displayName });
      }
      const appUser = await mapFirebaseUserToAppUser(result.user); // This will also create the Firestore doc
      setUser(appUser);
      toast({ title: "Signup Successful", description: `Welcome, ${appUser.displayName}!` });
      return appUser;
    } catch (error: any) {
      console.error("Email Sign-Up Error:", error);
      toast({ title: "Signup Failed", description: error.message, variant: "destructive" });
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      setUser(null);
      toast({ title: "Signed Out", description: "You have been successfully signed out." });
    } catch (error: any) {
      console.error("Sign Out Error:", error);
      toast({ title: "Sign Out Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const signInAnonymously = async (): Promise<User | null> => {
    setLoading(true);
    try {
      const result = await firebaseSignInAnonymously(auth);
      const appUser = await mapFirebaseUserToAppUser(result.user);
      setUser(appUser);
      toast({ title: "Anonymous Sign-In Successful", description: "You are browsing as a guest." });
      return appUser;
    } catch (error: any) {
      console.error("Anonymous Sign-In Error:", error);
      toast({ title: "Anonymous Sign-In Failed", description: error.message, variant: "destructive" });
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

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
