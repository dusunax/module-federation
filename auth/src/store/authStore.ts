import { create } from 'zustand';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useEnergyStore } from './energyStore';
import { UserRole } from '@shared/types/api';
import type { User } from '@shared/types/api';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<FirebaseUser>;
  signOut: () => Promise<void>;
  initAuthListener: () => () => void;
  clearError: () => void;
}

const googleProvider = new GoogleAuthProvider();
const DEFAULT_USER_ROLE: UserRole = UserRole.USER;

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,

  signInWithGoogle: async () => {
    set({ loading: true, error: null });
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const userRef = doc(db, 'users', user.uid);
      const existingUserDoc = await getDoc(userRef);
      const isNewUser = !existingUserDoc.exists();

      await setDoc(
        userRef,
        {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          plan: 'none',
          role: DEFAULT_USER_ROLE,
          lastLoginAt: serverTimestamp(),
        },
        { merge: true }
      );

      if (isNewUser) {
        await setDoc(userRef, {
          createdAt: serverTimestamp(),
        }, { merge: true });
      }

      const userDoc = await getDoc(userRef);
      const userData = userDoc.exists() ? userDoc.data() : {};
      const plan = userData.plan || 'none';
      const role = userData.role || DEFAULT_USER_ROLE;

      set({
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          plan,
          role,
        },
        loading: false,
      });

      return user;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  signOut: async () => {
    set({ loading: true, error: null });
    try {
      await firebaseSignOut(auth);
      useEnergyStore.getState().clearEnergy();
      set({ user: null, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  initAuthListener: () => {
    set({ loading: true });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const userData = userDoc.exists() ? userDoc.data() : {};
          const plan = userData.plan || 'none';
          const role = userData.role || DEFAULT_USER_ROLE;

          set({
            user: {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              plan,
              role,
            },
            loading: false,
          });

          await useEnergyStore.getState().initializeEnergy(user.uid, plan);
        } catch (error) {
          console.error('Auth initialization error:', error);
          set({
            user: {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              plan: 'none',
              role: DEFAULT_USER_ROLE,
            },
            loading: false,
          });
        }
      } else {
        useEnergyStore.getState().clearEnergy();
        set({ user: null, loading: false });
      }
    });

    return unsubscribe;
  },

  clearError: () => set({ error: null }),
}));

export { useAuthStore };
