import { create } from 'zustand';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useEnergyStore } from './energyStore';

const googleProvider = new GoogleAuthProvider();

const useAuthStore = create((set) => ({
  user: null,
  loading: true,
  error: null,

  signInWithGoogle: async () => {
    set({ loading: true, error: null });
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      await setDoc(
        doc(db, 'users', user.uid),
        {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          plan: 'none',
          lastLoginAt: serverTimestamp(),
        },
        { merge: true }
      );

      const isNewUser = result._tokenResponse?.isNewUser;
      if (isNewUser) {
        await setDoc(doc(db, 'users', user.uid), {
          createdAt: serverTimestamp(),
        }, { merge: true });
      }

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};
      const plan = userData.plan || 'none';
      const role = userData.role;

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
      set({ error: error.message, loading: false });
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
      set({ error: error.message, loading: false });
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
          const role = userData.role;

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
