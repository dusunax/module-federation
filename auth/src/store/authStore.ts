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
const DEFAULT_PLAN = 'none';

type UserDocData = {
  plan?: unknown;
  role?: unknown;
};

const toErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Unknown error';

const toUser = (firebaseUser: FirebaseUser, userData: UserDocData = {}) => {
  const plan = typeof userData.plan === 'string' ? userData.plan : DEFAULT_PLAN;
  const role = userData.role === UserRole.ADMIN ? UserRole.ADMIN : DEFAULT_USER_ROLE;

  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    plan,
    role,
  };
};

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

      if (!existingUserDoc.exists()) {
        const newUser = {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          plan: DEFAULT_PLAN,
          role: DEFAULT_USER_ROLE,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
        };

        await setDoc(userRef, newUser, { merge: false });
      } else {
        await setDoc(
          userRef,
          {
            lastLoginAt: serverTimestamp(),
          },
          { merge: true }
        );
      }

      const freshUserDoc = await getDoc(userRef);
      const userData = (freshUserDoc.exists() ? freshUserDoc.data() : {}) as UserDocData;
      const normalizedUser = toUser(user, userData);

      set({ user: normalizedUser, loading: false });

      return user;
    } catch (error) {
      set({ error: toErrorMessage(error), loading: false });
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
      set({ error: toErrorMessage(error), loading: false });
      throw error;
    }
  },

  initAuthListener: () => {
    set({ loading: true });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const userData = (userDoc.exists() ? userDoc.data() : {}) as UserDocData;
          const normalizedUser = toUser(user, userData);

          set({ user: normalizedUser, loading: false });
          await useEnergyStore.getState().initializeEnergy(user.uid, normalizedUser.plan);
        } catch (error) {
          set({
            user: {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              plan: DEFAULT_PLAN,
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
