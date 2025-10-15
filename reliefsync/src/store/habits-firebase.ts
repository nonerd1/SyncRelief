import { create as createHabits } from 'zustand';
import type { HabitLog } from '../types/habit';
import {
  saveHabitLog,
  getHabitLogs,
  subscribeToHabitLogs,
} from '../firebase/firestore';
import { useAuthStore } from './auth';
import { storage, STORAGE_KEYS } from '../lib/storage';

interface HabitsFirebaseState {
  logs: HabitLog[];
  loading: boolean;
  synced: boolean;

  // Core methods
  addHabitLog: (log: Omit<HabitLog, 'id' | 'timestamp'>) => Promise<void>;
  getLogForDate: (date: string) => HabitLog | undefined;
  getAllLogs: () => HabitLog[];
  deleteLog: (id: string) => Promise<void>;

  // Sync methods
  syncFromFirebase: () => Promise<void>;
  subscribeToUpdates: () => () => void;

  // Cache methods
  cacheLocally: () => Promise<void>;
  loadFromCache: () => Promise<void>;

  // Reset
  clear: () => void;
}

// Helper function to remove undefined values
function removeUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  const cleaned: any = {};
  for (const key in obj) {
    if (obj[key] !== undefined) {
      cleaned[key] = obj[key];
    }
  }
  return cleaned;
}

export const useHabitsFirebaseStore = createHabits<HabitsFirebaseState>((set, get) => ({
  logs: [],
  loading: false,
  synced: false,

  // Add new habit log
  addHabitLog: async (log) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('User not authenticated');

    const newLog: HabitLog = {
      ...log,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    try {
      // Remove undefined fields before saving to Firebase
      const cleanedLog = removeUndefined(newLog) as HabitLog;
      
      // Save to Firebase
      await saveHabitLog(user.uid, cleanedLog);

      // Update local state - replace if same date exists
      set((state) => ({
        logs: [newLog, ...state.logs.filter((l) => l.date !== log.date)],
      }));

      await get().cacheLocally();
    } catch (error) {
      console.error('Failed to add habit log:', error);
      throw error;
    }
  },

  // Get log for specific date
  getLogForDate: (date) => {
    return get().logs.find((log) => log.date === date);
  },

  // Get all logs
  getAllLogs: () => get().logs.sort((a, b) => b.timestamp - a.timestamp),

  // Delete log
  deleteLog: async (id) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('User not authenticated');

    try {
      // Note: You may need to add deleteHabitLog to firestore.ts
      set((state) => ({
        logs: state.logs.filter((l) => l.id !== id),
      }));
      await get().cacheLocally();
    } catch (error) {
      console.error('Failed to delete log:', error);
      throw error;
    }
  },

  // Sync from Firebase
  syncFromFirebase: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    set({ loading: true });
    try {
      const logs = await getHabitLogs(user.uid);
      set({ logs, synced: true, loading: false });
      await get().cacheLocally();
    } catch (error) {
      console.error('Sync failed:', error);
      set({ loading: false });
      await get().loadFromCache();
    }
  },

  // Real-time subscription
  subscribeToUpdates: () => {
    const user = useAuthStore.getState().user;
    if (!user) return () => {};

    return subscribeToHabitLogs(user.uid, (logs) => {
      set({ logs });
      get().cacheLocally();
    });
  },

  // Cache locally
  cacheLocally: async () => {
    try {
      await storage.set(STORAGE_KEYS.HABIT_LOGS, get().logs);
    } catch (error) {
      console.error('Failed to cache logs:', error);
    }
  },

  // Load from cache
  loadFromCache: async () => {
    try {
      const cached = await storage.get<HabitLog[]>(STORAGE_KEYS.HABIT_LOGS);
      if (cached) {
        set({ logs: cached });
      }
    } catch (error) {
      console.error('Failed to load cache:', error);
    }
  },

  // Clear on logout
  clear: () => {
    set({ logs: [], loading: false, synced: false });
  },
}));