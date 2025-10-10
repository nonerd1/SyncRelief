import { create } from 'zustand';
import { Session } from '../types';
import { storage, STORAGE_KEYS } from '../lib/storage';

export type HeadacheMode = 'Tension' | 'Migraine' | 'Sinus' | 'Cluster' | 'Custom';
export type MassagePattern = 'Wave' | 'Pulse' | 'Knead';

interface SessionState extends Session {
  // Session control
  sessionActive: boolean;
  mode: HeadacheMode;
  pressure: number;
  massage: number;
  massagePattern: MassagePattern;
  heat: boolean;
  cold: boolean;
  temperatureC: number;
  elapsedSec: number;
  sessionStartTime: number | null;
  sessionDurationMin: number | null;

  // Actions
  setMode: (mode: HeadacheMode) => void;
  setPressure: (pressure: number) => void;
  setMassage: (massage: number) => void;
  setMassagePattern: (pattern: MassagePattern) => void;
  setHeat: (heat: boolean) => void;
  setCold: (cold: boolean) => void;
  setTemperature: (temp: number) => void;

  startSession: (durationMin?: number) => void;
  pauseSession: () => void;
  stopSession: () => void;
  updateElapsed: () => void;
  resetElapsed: () => void;

  setDarkMode: (darkMode: boolean) => void;
  setOnboardingComplete: (complete: boolean) => void;
  initialize: () => Promise<void>;
  persist: () => Promise<void>;
  persistSettings: () => Promise<void>;
}

let intervalId: NodeJS.Timeout | null = null;

export const useSessionStore = create<SessionState>((set, get) => ({
  // Session defaults
  sessionActive: false,
  mode: 'Tension',
  pressure: 5,
  massage: 5,
  massagePattern: 'Wave',
  heat: false,
  cold: false,
  temperatureC: 30,
  elapsedSec: 0,
  sessionStartTime: null,
  sessionDurationMin: null,

  // Session state
  darkMode: true,
  onboardingComplete: false,

  setMode: (mode) => {
    set({ mode });
    get().persistSettings();
  },

  setPressure: (pressure) => {
    set({ pressure });
    get().persistSettings();
  },

  setMassage: (massage) => {
    set({ massage });
    get().persistSettings();
  },

  setMassagePattern: (pattern) => {
    set({ massagePattern: pattern });
    get().persistSettings();
  },

  setHeat: (heat) => {
    set({ heat, cold: heat ? false : get().cold });
    get().persistSettings();
  },

  setCold: (cold) => {
    set({ cold, heat: cold ? false : get().heat });
    get().persistSettings();
  },

  setTemperature: (temp) => {
    set({ temperatureC: temp });
    get().persistSettings();
  },

  startSession: (durationMin) => {
    if (intervalId) {
      clearInterval(intervalId);
    }

    set({
      sessionActive: true,
      sessionStartTime: Date.now(),
      sessionDurationMin: durationMin || null,
      elapsedSec: 0,
    });

    intervalId = setInterval(() => {
      get().updateElapsed();
    }, 1000);
  },

  pauseSession: () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    set({ sessionActive: false });
  },

  stopSession: () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    set({
      sessionActive: false,
      sessionStartTime: null,
      sessionDurationMin: null,
    });
  },

  updateElapsed: () => {
    const { sessionStartTime } = get();
    if (sessionStartTime) {
      const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
      set({ elapsedSec: elapsed });
    }
  },

  resetElapsed: () => {
    set({ elapsedSec: 0 });
  },

  setDarkMode: (darkMode: boolean) => {
    set({ darkMode });
    get().persist();
  },

  setOnboardingComplete: (complete: boolean) => {
    set({ onboardingComplete: complete });
    get().persist();
  },

  initialize: async () => {
    try {
      const [session, settings] = await Promise.all([
        storage.get<Session>(STORAGE_KEYS.SESSION),
        storage.get<any>('session_settings'),
      ]);

      if (session) {
        set({ ...session });
      }

      if (settings) {
        set({
          mode: settings.mode || 'Tension',
          pressure: settings.pressure || 5,
          massage: settings.massage || 5,
          massagePattern: settings.massagePattern || 'Wave',
          heat: settings.heat || false,
          cold: settings.cold || false,
          temperatureC: settings.temperatureC || 30,
        });
      }
    } catch (error) {
      console.error('Failed to initialize session:', error);
    }
  },

  persist: async () => {
    const { darkMode, onboardingComplete, userId, lastSyncedAt } = get();
    try {
      await storage.set(STORAGE_KEYS.SESSION, {
        darkMode,
        onboardingComplete,
        userId,
        lastSyncedAt,
      });
    } catch (error) {
      console.error('Failed to persist session:', error);
    }
  },

  persistSettings: async () => {
    const { mode, pressure, massage, massagePattern, heat, cold, temperatureC } = get();
    try {
      await storage.set('session_settings', {
        mode,
        pressure,
        massage,
        massagePattern,
        heat,
        cold,
        temperatureC,
      });
    } catch (error) {
      console.error('Failed to persist settings:', error);
    }
  },
}));
