import { create } from 'zustand';
import { doc, getDoc, setDoc, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { getDailyUsage } from '../services/energyService';
import { getRecentOrders } from '../services/orderService';

const MAX_ENERGY_FREE = 5;
const MAX_ENERGY_PREMIUM = 10;

const getTodayDateString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const useEnergyStore = create((set, get) => ({
  current: 0,
  maxEnergy: MAX_ENERGY_FREE,
  lastResetDate: null,
  loading: true,
  error: null,
  userId: null,

  initializeEnergy: async (userId, plan = 'none') => {
    if (!userId) {
      set({ loading: false, error: 'User ID is required' });
      return;
    }

    set({ loading: true, error: null, userId });

    try {
      const maxEnergy = plan === 'premium' ? MAX_ENERGY_PREMIUM : MAX_ENERGY_FREE;
      const todayDate = getTodayDateString();
      const energyRef = doc(db, 'users', userId, 'energy', 'status');
      const energyDoc = await getDoc(energyRef);

      if (energyDoc.exists()) {
        const data = energyDoc.data();
        const lastResetDate = data.lastResetDate;

        if (lastResetDate !== todayDate) {
          await setDoc(energyRef, {
            current: maxEnergy,
            maxEnergy,
            lastResetDate: todayDate,
            updatedAt: serverTimestamp(),
          });

          set({
            current: maxEnergy,
            maxEnergy,
            lastResetDate: todayDate,
            loading: false,
          });
        } else {
          set({
            current: data.current,
            maxEnergy: data.maxEnergy,
            lastResetDate: data.lastResetDate,
            loading: false,
          });
        }
      } else {
        await setDoc(energyRef, {
          current: maxEnergy,
          maxEnergy,
          lastResetDate: todayDate,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        set({
          current: maxEnergy,
          maxEnergy,
          lastResetDate: todayDate,
          loading: false,
        });
      }
    } catch (error) {
      console.error('Energy initialization error:', error);
      set({ error: error.message, loading: false });
    }
  },

  hasEnoughEnergy: (cost) => {
    const { current } = get();
    return current >= cost;
  },

  deductEnergy: async (cost, count = 0) => {
    const { current, userId } = get();

    if (!userId) {
      throw new Error('User not initialized');
    }

    if (current < cost) {
      throw new Error('Not enough energy');
    }

    const newEnergy = current - cost;

    try {
      const energyRef = doc(db, 'users', userId, 'energy', 'status');
      await setDoc(
        energyRef,
        {
          current: newEnergy,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // record today's usage (generalized 'usage' collection) with energy and count
      try {
        const todayDate = getTodayDateString();
        const usageRef = doc(db, 'users', userId, 'usage', todayDate);
        await setDoc(
          usageRef,
          {
            used: increment(cost),
            count: increment(count),
            date: todayDate,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (usageErr) {
        // non-fatal: log usage write failures but don't block the main flow
        console.error('Failed to record usage:', usageErr);
      }

      set({ current: newEnergy });
      return newEnergy;
    } catch (error) {
      console.error('Energy deduction error:', error);
      throw error;
    }
  },

  restoreEnergy: async (amount, count = 0) => {
    const { current, maxEnergy, userId } = get();

    if (!userId) {
      throw new Error('User not initialized');
    }

    const newEnergy = Math.min(current + amount, maxEnergy);

    try {
      const energyRef = doc(db, 'users', userId, 'energy', 'status');
      await setDoc(
        energyRef,
        {
          current: newEnergy,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // also decrement today's usage so restores are reflected in daily aggregation
      try {
        const todayDate = getTodayDateString();
        const usageRef = doc(db, 'users', userId, 'usage', todayDate);
        // decrement by amount and decrement count by provided value
        await setDoc(
          usageRef,
          {
            used: increment(-amount),
            count: increment(-count),
            date: todayDate,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
        // Note: Firestore increment can make fields negative; UI should clamp to 0 when displaying.
      } catch (usageErr) {
        console.error('Failed to update usage on restore:', usageErr);
      }

      set({ current: newEnergy });
      return newEnergy;
    } catch (error) {
      console.error('Energy restore error:', error);
      throw error;
    }
  },

  clearEnergy: () => {
    set({
      current: 0,
      maxEnergy: MAX_ENERGY_FREE,
      lastResetDate: null,
      loading: false,
      error: null,
      userId: null,
    });
  },

  resetEnergy: async () => {
    const { userId, maxEnergy } = get();

    if (!userId) {
      throw new Error('User not initialized');
    }

    const todayDate = getTodayDateString();

    try {
      const energyRef = doc(db, 'users', userId, 'energy', 'status');
      await setDoc(
        energyRef,
        {
          current: maxEnergy,
          lastResetDate: todayDate,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      set({
        current: maxEnergy,
        lastResetDate: todayDate,
      });
    } catch (error) {
      console.error('Energy reset error:', error);
      throw error;
    }
  },

  // fetch recent daily usage for dashboard
  fetchDailyUsage: async (days = 30) => {
    const { userId } = get();
    if (!userId) return [];
    try {
      return await getDailyUsage(userId, days);
    } catch (err) {
      console.error('Failed to fetch daily usage:', err);
      return [];
    }
  },

  // fetch recent orders for dashboard log
  fetchRecentOrders: async (count = 20) => {
    const { userId } = get();
    if (!userId) return [];
    try {
      return await getRecentOrders(userId, count);
    } catch (err) {
      console.error('Failed to fetch recent orders:', err);
      return [];
    }
  },
}));

export { useEnergyStore };
