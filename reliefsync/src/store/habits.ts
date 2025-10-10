import { create } from 'zustand';
import { Habit, HabitLog } from '../types';
import { storage, STORAGE_KEYS } from '../lib/storage';

interface HabitsState {
  habits: Habit[];
  logs: HabitLog[];

  // Legacy habit methods
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;

  // New habit log methods
  addHabitLog: (log: Omit<HabitLog, 'id' | 'timestamp'>) => Promise<void>;
  getLogForDate: (date: string) => HabitLog | undefined;
  getAllLogs: () => HabitLog[];
  deleteLog: (id: string) => Promise<void>;

  // Legacy methods
  logHabit: (habitId: string, value: boolean | number, date?: string) => void;
  getLogsForDate: (date: string) => any[];
  getLogsForHabit: (habitId: string, startDate?: string, endDate?: string) => any[];

  initialize: () => Promise<void>;
  persist: () => Promise<void>;
}

export const useHabitsStore = create<HabitsState>((set, get) => ({
  habits: [],
  logs: [],

  // Legacy habit methods
  addHabit: (habit) => {
    const newHabit: Habit = {
      ...habit,
      id: `habit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ habits: [...state.habits, newHabit] }));
    get().persist();
  },

  updateHabit: (id, updates) => {
    set((state) => ({
      habits: state.habits.map((h) => (h.id === id ? { ...h, ...updates } : h)),
    }));
    get().persist();
  },

  deleteHabit: (id) => {
    set((state) => ({
      habits: state.habits.filter((h) => h.id !== id),
    }));
    get().persist();
  },

  // New habit log methods
  addHabitLog: async (log) => {
    const newLog: HabitLog = {
      ...log,
      id: `habitlog_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    // Remove existing log for same date if exists
    set((state) => ({
      logs: [...state.logs.filter((l) => l.date !== log.date), newLog],
    }));

    await get().persist();
  },

  getLogForDate: (date) => {
    return get().logs.find((log) => log.date === date);
  },

  getAllLogs: () => {
    return [...get().logs].sort((a, b) => b.timestamp - a.timestamp);
  },

  deleteLog: async (id) => {
    set((state) => ({
      logs: state.logs.filter((l) => l.id !== id),
    }));
    await get().persist();
  },

  // Legacy methods
  logHabit: (habitId, value, date) => {
    const logDate = date || new Date().toISOString().split('T')[0];
    // Legacy implementation - kept for compatibility
    get().persist();
  },

  getLogsForDate: (date) => {
    return [];
  },

  getLogsForHabit: (habitId, startDate, endDate) => {
    return [];
  },

  initialize: async () => {
    try {
      const [habits, logs] = await Promise.all([
        storage.get<Habit[]>(STORAGE_KEYS.HABITS),
        storage.get<HabitLog[]>(STORAGE_KEYS.HABIT_LOGS),
      ]);

      set({
        habits: habits || [],
        logs: logs || [],
      });
    } catch (error) {
      console.error('Failed to initialize habits:', error);
    }
  },

  persist: async () => {
    const { habits, logs } = get();
    try {
      await Promise.all([
        storage.set(STORAGE_KEYS.HABITS, habits),
        storage.set(STORAGE_KEYS.HABIT_LOGS, logs),
      ]);
    } catch (error) {
      console.error('Failed to persist habits:', error);
    }
  },
}));
