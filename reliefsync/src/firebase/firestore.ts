import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './config';
import type { HeadacheEpisode } from '../types/episode';
import type { HabitLog } from '../types/habit';

// ---- HEADACHE EPISODES ----

export async function saveHeadacheEpisode(userId: string, episode: HeadacheEpisode) {
  try {
    const episodeRef = doc(db, `users/${userId}/episodes`, episode.id);
    await setDoc(episodeRef, {
      ...episode,
      // Firestore-specific: convert timestamps
      startTime: new Date(episode.startTime),
      syncedAt: new Date(),
    });
  } catch (error) {
    console.error('Error saving episode:', error);
    throw error;
  }
}

export async function getHeadacheEpisodes(userId: string): Promise<HeadacheEpisode[]> {
  try {
    const episodesRef = collection(db, `users/${userId}/episodes`);
    const q = query(episodesRef, orderBy('startTime', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      startTime: doc.data().startTime.toDate().toISOString(),
    })) as HeadacheEpisode[];
  } catch (error) {
    console.error('Error fetching episodes:', error);
    throw error;
  }
}

export function subscribeToHeadacheEpisodes(
  userId: string,
  callback: (episodes: HeadacheEpisode[]) => void
): Unsubscribe {
  const episodesRef = collection(db, `users/${userId}/episodes`);
  const q = query(episodesRef, orderBy('startTime', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const episodes = snapshot.docs.map((doc) => ({
      ...doc.data(),
      startTime: doc.data().startTime.toDate().toISOString(),
    })) as HeadacheEpisode[];
    callback(episodes);
  });
}

export async function deleteHeadacheEpisode(userId: string, episodeId: string) {
  try {
    await deleteDoc(doc(db, `users/${userId}/episodes`, episodeId));
  } catch (error) {
    console.error('Error deleting episode:', error);
    throw error;
  }
}

// ---- HABIT LOGS ----

export async function saveHabitLog(userId: string, habitLog: HabitLog) {
  try {
    const habitRef = doc(db, `users/${userId}/habits`, habitLog.id);
    await setDoc(habitRef, {
      ...habitLog,
      syncedAt: new Date(),
    });
  } catch (error) {
    console.error('Error saving habit log:', error);
    throw error;
  }
}

export async function getHabitLogs(userId: string): Promise<HabitLog[]> {
  try {
    const habitsRef = collection(db, `users/${userId}/habits`);
    const q = query(habitsRef, orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => doc.data()) as HabitLog[];
  } catch (error) {
    console.error('Error fetching habit logs:', error);
    throw error;
  }
}

export function subscribeToHabitLogs(
  userId: string,
  callback: (logs: HabitLog[]) => void
): Unsubscribe {
  const habitsRef = collection(db, `users/${userId}/habits`);
  const q = query(habitsRef, orderBy('date', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map((doc) => doc.data()) as HabitLog[];
    callback(logs);
  });
}

// ---- USER SETTINGS ----

export interface UserSettings {
  vibrationMode: 'on' | 'off';
  temperaturePreference: number; // Celsius
  defaultSessionDuration: number; // Minutes
  notificationsEnabled: boolean;
  theme: 'dark' | 'light';
}

export async function saveUserSettings(userId: string, settings: UserSettings) {
  try {
    const settingsRef = doc(db, 'users', userId);
    await updateDoc(settingsRef, {
      settings,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
}

export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data().settings || null;
    }
    return null;
  } catch (error) {
    console.error('Error fetching settings:', error);
    throw error;
  }
}

export function subscribeToUserSettings(
  userId: string,
  callback: (settings: UserSettings) => void
): Unsubscribe {
  const userRef = doc(db, 'users', userId);

  return onSnapshot(userRef, (snap) => {
    if (snap.exists() && snap.data().settings) {
      callback(snap.data().settings);
    }
  });
}

// ---- CREATE USER DOCUMENT (on first signup) ----

export async function createUserDocument(userId: string, email: string) {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      email,
      createdAt: new Date(),
      settings: {
        vibrationMode: 'on',
        temperaturePreference: 30,
        defaultSessionDuration: 20,
        notificationsEnabled: true,
        theme: 'dark',
      },
    });
  } catch (error) {
    console.error('Error creating user document:', error);
    throw error;
  }
}