import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  loginAsDedicatedAdmin: (emailOrUser: string, pass: string) => Promise<boolean>;
  registerWithEmail: (name: string, email: string, pass: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateCustomerProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Dedicated known admin emails and logins
const ADMIN_EMAILS = [
  'muzammilahmad8785@gmail.com', 
  'admin@bonfirepizzeria.com',
  'muzammil@1234.com',
  'muzammil@1234',
  'malik@1234.com',
  'malik@1234'
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('bonfire_user_session');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [isLocalAdminOverride, setIsLocalAdminOverride] = useState<boolean>(() => {
    return localStorage.getItem('bonfire_admin_session') === 'true';
  });

  // Helper to generate deterministic document ID for email
  const getEmailUid = (email: string) => {
    return 'usr_' + btoa(email.trim().toLowerCase()).replace(/[^a-zA-Z0-9]/g, '').slice(0, 24);
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        if (!isLocalAdminOverride && !localStorage.getItem('bonfire_user_session')) {
          setProfile(null);
        }
        setLoading(false);
        return;
      }

      // Sync user profile document from Firestore
      const userDocRef = doc(db, 'users', currentUser.uid);
      
      const unsubProfile = onSnapshot(userDocRef, async (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfile;
          // Auto-promote owner email to admin if not yet set
          if (currentUser.email && ADMIN_EMAILS.includes(currentUser.email.toLowerCase()) && data.role !== 'admin') {
            await setDoc(userDocRef, { role: 'admin' }, { merge: true });
            data.role = 'admin';
          }
          setProfile(data);
          localStorage.setItem('bonfire_user_session', JSON.stringify(data));
        } else {
          // Create initial user profile
          const isAdminUser = currentUser.email ? ADMIN_EMAILS.includes(currentUser.email.toLowerCase()) : false;
          const newProfile: UserProfile = {
            uid: currentUser.uid,
            name: currentUser.displayName || currentUser.email?.split('@')[0] || 'Bonfire Customer',
            email: currentUser.email || '',
            phone: currentUser.phoneNumber || '',
            role: isAdminUser ? 'admin' : 'customer',
            addresses: [],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };
          await setDoc(userDocRef, newProfile);
          setProfile(newProfile);
          localStorage.setItem('bonfire_user_session', JSON.stringify(newProfile));
        }
        setLoading(false);
      }, (err) => {
        console.warn('Firestore profile snapshot error:', err);
        const isAdminUser = currentUser.email ? ADMIN_EMAILS.includes(currentUser.email.toLowerCase()) : false;
        const fallbackProfile: UserProfile = {
          uid: currentUser.uid,
          name: currentUser.displayName || 'Customer',
          email: currentUser.email || '',
          role: isAdminUser ? 'admin' : 'customer'
        };
        setProfile(fallbackProfile);
        setLoading(false);
      });

      return () => unsubProfile();
    });

    return () => unsubscribeAuth();
  }, [isLocalAdminOverride]);

  const signInWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const currentUser = res.user;
      const isAdminUser = currentUser.email ? ADMIN_EMAILS.includes(currentUser.email.toLowerCase()) : false;
      const userDocRef = doc(db, 'users', currentUser.uid);
      const snap = await getDoc(userDocRef);
      if (!snap.exists()) {
        const newProfile: UserProfile = {
          uid: currentUser.uid,
          name: currentUser.displayName || 'Google User',
          email: currentUser.email || '',
          phone: '',
          role: isAdminUser ? 'admin' : 'customer',
          addresses: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        await setDoc(userDocRef, newProfile);
        setProfile(newProfile);
        localStorage.setItem('bonfire_user_session', JSON.stringify(newProfile));
      }
    } catch (err: any) {
      console.error('Google Sign In failed', err);
      throw err;
    }
  };

  /**
   * Dedicated admin login matching exact credentials:
   * Email/User: Muzammil@1234
   * Pass: Malik@1234
   */
  const loginAsDedicatedAdmin = async (emailOrUser: string, pass: string): Promise<boolean> => {
    const cleanUser = emailOrUser.trim().toLowerCase();
    const cleanPass = pass.trim();

    // Check credentials requested by the user
    const isTargetAdmin = 
      (cleanUser === 'muzammil@1234' || cleanUser === 'muzammil@1234.com' || cleanUser === 'admin') &&
      cleanPass === 'Malik@1234';

    if (isTargetAdmin) {
      const adminProfile: UserProfile = {
        uid: 'admin_muzammil_1234',
        name: 'Muzammil Ahmad (Admin)',
        email: 'muzammilahmad8785@gmail.com',
        phone: '0306-7451542',
        role: 'admin',
        addresses: []
      };
      localStorage.setItem('bonfire_admin_session', 'true');
      localStorage.setItem('bonfire_user_session', JSON.stringify(adminProfile));
      setIsLocalAdminOverride(true);
      setProfile(adminProfile);

      // Also persist to Firestore users collection
      try {
        await setDoc(doc(db, 'users', 'admin_muzammil_1234'), adminProfile, { merge: true });
      } catch (err) {
        console.warn('Admin firestore sync notice:', err);
      }

      return true;
    }

    return false;
  };

  const loginWithEmail = async (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    // Check if user is logging in with admin credentials
    if ((cleanEmail === 'muzammil@1234' || cleanEmail === 'muzammil@1234.com' || cleanEmail === 'admin') && cleanPass === 'Malik@1234') {
      await loginAsDedicatedAdmin(cleanEmail, cleanPass);
      return;
    }

    // Try standard Firebase Auth email/pass first
    try {
      await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
      return;
    } catch (firebaseErr: any) {
      // If Firebase email/password is disabled in console (auth/operation-not-allowed)
      // or other provider issue, fallback smoothly to direct Firestore user lookup
      if (
        firebaseErr.code === 'auth/operation-not-allowed' || 
        firebaseErr.code === 'auth/configuration-not-found' ||
        firebaseErr.code === 'auth/user-not-found' ||
        firebaseErr.message?.includes('operation-not-allowed')
      ) {
        const uid = getEmailUid(cleanEmail);
        const userDocRef = doc(db, 'users', uid);
        const snap = await getDoc(userDocRef);

        const isAdminUser = ADMIN_EMAILS.includes(cleanEmail);

        if (snap.exists()) {
          const data = snap.data() as UserProfile;
          setProfile(data);
          localStorage.setItem('bonfire_user_session', JSON.stringify(data));
          if (data.role === 'admin' || isAdminUser) {
            setIsLocalAdminOverride(true);
            localStorage.setItem('bonfire_admin_session', 'true');
          }
          return;
        } else {
          // If profile doesn't exist yet, auto-create customer profile for seamless ordering
          const newProfile: UserProfile = {
            uid,
            name: cleanEmail.split('@')[0] || 'Customer',
            email: cleanEmail,
            role: isAdminUser ? 'admin' : 'customer',
            addresses: [],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };
          await setDoc(userDocRef, newProfile);
          setProfile(newProfile);
          localStorage.setItem('bonfire_user_session', JSON.stringify(newProfile));
          if (isAdminUser) {
            setIsLocalAdminOverride(true);
            localStorage.setItem('bonfire_admin_session', 'true');
          }
          return;
        }
      }

      // Re-throw if it's a real password mismatch
      throw firebaseErr;
    }
  };

  const registerWithEmail = async (name: string, email: string, pass: string, phone?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const isAdminUser = ADMIN_EMAILS.includes(cleanEmail);

    try {
      const res = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      await updateProfile(res.user, { displayName: name });
      const userDocRef = doc(db, 'users', res.user.uid);
      const newProfile: UserProfile = {
        uid: res.user.uid,
        name,
        email: cleanEmail,
        phone: phone || '',
        role: isAdminUser ? 'admin' : 'customer',
        addresses: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      await setDoc(userDocRef, newProfile);
      setProfile(newProfile);
      localStorage.setItem('bonfire_user_session', JSON.stringify(newProfile));
    } catch (firebaseErr: any) {
      // Fallback if Email/Pass registration is blocked in Firebase project
      if (
        firebaseErr.code === 'auth/operation-not-allowed' || 
        firebaseErr.code === 'auth/configuration-not-found' ||
        firebaseErr.message?.includes('operation-not-allowed')
      ) {
        const uid = getEmailUid(cleanEmail);
        const userDocRef = doc(db, 'users', uid);
        const newProfile: UserProfile = {
          uid,
          name,
          email: cleanEmail,
          phone: phone || '',
          role: isAdminUser ? 'admin' : 'customer',
          addresses: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        await setDoc(userDocRef, newProfile);
        setProfile(newProfile);
        localStorage.setItem('bonfire_user_session', JSON.stringify(newProfile));
        if (isAdminUser) {
          setIsLocalAdminOverride(true);
          localStorage.setItem('bonfire_admin_session', 'true');
        }
        return;
      }

      throw firebaseErr;
    }
  };

  const logout = async () => {
    localStorage.removeItem('bonfire_admin_session');
    localStorage.removeItem('bonfire_user_session');
    setIsLocalAdminOverride(false);
    try {
      await fbSignOut(auth);
    } catch {}
    setProfile(null);
  };

  const updateCustomerProfile = async (data: Partial<UserProfile>) => {
    const currentUid = user?.uid || profile?.uid;
    if (!currentUid) return;
    const userDocRef = doc(db, 'users', currentUid);
    const safeData = { ...data };
    if (profile?.role !== 'admin' && !isLocalAdminOverride) {
      delete safeData.role;
    }
    await setDoc(userDocRef, {
      ...safeData,
      updatedAt: serverTimestamp()
    }, { merge: true });

    if (profile) {
      const updated = { ...profile, ...safeData };
      setProfile(updated as UserProfile);
      localStorage.setItem('bonfire_user_session', JSON.stringify(updated));
    }
  };

  const isAdmin = isLocalAdminOverride || 
    profile?.role === 'admin' || 
    (user?.email ? ADMIN_EMAILS.includes(user.email.toLowerCase()) : false) ||
    (profile?.email ? ADMIN_EMAILS.includes(profile.email.toLowerCase()) : false);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin,
        signInWithGoogle,
        loginWithEmail,
        loginAsDedicatedAdmin,
        registerWithEmail,
        logout,
        updateCustomerProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
