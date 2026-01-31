import { create } from 'zustand';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

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
          plan: 'free',
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

      set({
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
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
      set({ user: null, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  initAuthListener: () => {
    set({ loading: true });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        set({
          user: {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
          },
          loading: false,
        });
      } else {
        set({ user: null, loading: false });
      }
    });

    return unsubscribe;
  },

  clearError: () => set({ error: null }),
}));

export { useAuthStore };
