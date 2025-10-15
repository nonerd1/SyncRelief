import { create } from 'zustand';
import type { HeadacheEpisode } from '../types/episode';
import {
  saveHeadacheEpisode,
  getHeadacheEpisodes,
  subscribeToHeadacheEpisodes,
  deleteHeadacheEpisode,
} from '../firebase/firestore';
import { useAuthStore } from './auth';
import { storage, STORAGE_KEYS } from '../lib/storage';

interface EpisodesFirebaseState {
  episodes: HeadacheEpisode[];
  loading: boolean;
  synced: boolean;

  // Core methods
  addEpisode: (episode: Omit<HeadacheEpisode, 'id' | 'timestamp'>) => Promise<void>;
  deleteEpisode: (id: string) => Promise<void>;
  getAllEpisodes: () => HeadacheEpisode[];
  getEpisodesForDate: (date: string) => HeadacheEpisode[];

  // Sync methods
  syncFromFirebase: () => Promise<void>;
  subscribeToUpdates: () => () => void;

  // Cache methods (offline support)
  cacheLocally: () => Promise<void>;
  loadFromCache: () => Promise<void>;

  // Reset
  clear: () => void;
}

export const useEpisodesFirebaseStore = create<EpisodesFirebaseState>((set, get) => ({
  episodes: [],
  loading: false,
  synced: false,

  // Add new episode - saves to Firebase + local
  addEpisode: async (episode) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('User not authenticated');

    const newEpisode: HeadacheEpisode = {
      ...episode,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    try {
      // Save to Firebase first
      await saveHeadacheEpisode(user.uid, newEpisode);

      // Update local state
      set((state) => ({
        episodes: [newEpisode, ...state.episodes],
      }));

      // Cache locally for offline support
      await get().cacheLocally();
    } catch (error) {
      console.error('Failed to add episode:', error);
      throw error;
    }
  },

  // Delete episode
  deleteEpisode: async (id) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('User not authenticated');

    try {
      await deleteHeadacheEpisode(user.uid, id);
      set((state) => ({
        episodes: state.episodes.filter((e) => e.id !== id),
      }));
      await get().cacheLocally();
    } catch (error) {
      console.error('Failed to delete episode:', error);
      throw error;
    }
  },

  // Get all episodes
  getAllEpisodes: () => get().episodes,

  // Get episodes for specific date
  getEpisodesForDate: (date) => {
    return get().episodes.filter((e) => e.startTime.startsWith(date));
  },

  // Sync all episodes from Firebase
  syncFromFirebase: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    set({ loading: true });
    try {
      const episodes = await getHeadacheEpisodes(user.uid);
      set({ episodes, synced: true, loading: false });

      // Cache for offline
      await get().cacheLocally();
    } catch (error) {
      console.error('Sync failed:', error);
      set({ loading: false });
      // Try to load from cache on error
      await get().loadFromCache();
    }
  },

  // Real-time subscription to Firebase changes
  subscribeToUpdates: () => {
    const user = useAuthStore.getState().user;
    if (!user) return () => {};

    return subscribeToHeadacheEpisodes(user.uid, (episodes) => {
      set({ episodes });
      get().cacheLocally();
    });
  },

  // Cache episodes locally (AsyncStorage)
  cacheLocally: async () => {
    try {
      await storage.set(STORAGE_KEYS.EPISODES, get().episodes);
    } catch (error) {
      console.error('Failed to cache episodes:', error);
    }
  },

  // Load from local cache (for offline support)
  loadFromCache: async () => {
    try {
      const cached = await storage.get<HeadacheEpisode[]>(STORAGE_KEYS.EPISODES);
      if (cached) {
        set({ episodes: cached });
      }
    } catch (error) {
      console.error('Failed to load cache:', error);
    }
  },

  // Clear all data (logout)
  clear: () => {
    set({ episodes: [], loading: false, synced: false });
  },
}));