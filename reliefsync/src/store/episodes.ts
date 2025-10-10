import { create } from 'zustand';
import { Episode, HeadacheEpisode } from '../types';
import { storage, STORAGE_KEYS } from '../lib/storage';

interface EpisodesState {
  episodes: Episode[];
  headacheEpisodes: HeadacheEpisode[];

  // Legacy episode methods
  addEpisode: (episode: Omit<Episode, 'id' | 'timestamp'>) => void;
  updateEpisode: (id: string, updates: Partial<Episode>) => void;
  deleteEpisode: (id: string) => void;
  getEpisodesForDateRange: (startDate: string, endDate: string) => Episode[];
  getRecentEpisodes: (limit?: number) => Episode[];

  // New headache episode methods
  addHeadacheEpisode: (episode: Omit<HeadacheEpisode, 'id' | 'timestamp'>) => Promise<void>;
  updateHeadacheEpisode: (id: string, updates: Partial<HeadacheEpisode>) => Promise<void>;
  deleteHeadacheEpisode: (id: string) => Promise<void>;
  getHeadacheEpisodesForDate: (date: string) => HeadacheEpisode[];
  getAllHeadacheEpisodes: () => HeadacheEpisode[];

  initialize: () => Promise<void>;
  persist: () => Promise<void>;
}

export const useEpisodesStore = create<EpisodesState>((set, get) => ({
  episodes: [],
  headacheEpisodes: [],

  // Legacy methods
  addEpisode: (episode) => {
    const newEpisode: Episode = {
      ...episode,
      id: `episode_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    set((state) => ({ episodes: [...state.episodes, newEpisode] }));
    get().persist();
  },

  updateEpisode: (id, updates) => {
    set((state) => ({
      episodes: state.episodes.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    }));
    get().persist();
  },

  deleteEpisode: (id) => {
    set((state) => ({
      episodes: state.episodes.filter((e) => e.id !== id),
    }));
    get().persist();
  },

  getEpisodesForDateRange: (startDate, endDate) => {
    return get()
      .episodes.filter((e) => e.date >= startDate && e.date <= endDate)
      .sort((a, b) => b.timestamp - a.timestamp);
  },

  getRecentEpisodes: (limit = 10) => {
    return [...get().episodes].sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  },

  // New headache episode methods
  addHeadacheEpisode: async (episode) => {
    const newEpisode: HeadacheEpisode = {
      ...episode,
      id: `headache_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    set((state) => ({
      headacheEpisodes: [...state.headacheEpisodes, newEpisode],
    }));

    await get().persist();
  },

  updateHeadacheEpisode: async (id, updates) => {
    set((state) => ({
      headacheEpisodes: state.headacheEpisodes.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    }));
    await get().persist();
  },

  deleteHeadacheEpisode: async (id) => {
    set((state) => ({
      headacheEpisodes: state.headacheEpisodes.filter((e) => e.id !== id),
    }));
    await get().persist();
  },

  getHeadacheEpisodesForDate: (date) => {
    return get().headacheEpisodes.filter((e) => e.startTime.startsWith(date));
  },

  getAllHeadacheEpisodes: () => {
    return [...get().headacheEpisodes].sort((a, b) => b.timestamp - a.timestamp);
  },

  initialize: async () => {
    try {
      const [episodes, headacheEpisodes] = await Promise.all([
        storage.get<Episode[]>(STORAGE_KEYS.EPISODES),
        storage.get<HeadacheEpisode[]>('headache_episodes'),
      ]);

      set({
        episodes: episodes || [],
        headacheEpisodes: headacheEpisodes || [],
      });
    } catch (error) {
      console.error('Failed to initialize episodes:', error);
    }
  },

  persist: async () => {
    const { episodes, headacheEpisodes } = get();
    try {
      await Promise.all([
        storage.set(STORAGE_KEYS.EPISODES, episodes),
        storage.set('headache_episodes', headacheEpisodes),
      ]);
    } catch (error) {
      console.error('Failed to persist episodes:', error);
    }
  },
}));
