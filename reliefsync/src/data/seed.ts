import { HeadacheEpisode, HeadacheLocation, HeadacheQuality, Trigger } from '../types/episode';
import { HabitLog } from '../types/habit';

/**
 * Generate 14 days of realistic demo data for chart previews and testing
 */

const MODES = ['Tension', 'Migraine', 'Sinus', 'Cluster', 'Custom'] as const;
const PATTERNS = ['Wave', 'Pulse', 'Knead'] as const;
const LOCATIONS: HeadacheLocation[] = ['Frontal', 'Temporal', 'Occipital', 'Diffuse', 'One-sided'];
const QUALITIES: HeadacheQuality[] = ['Throbbing', 'Pressure', 'Sharp', 'Dull', 'Aura'];
const TRIGGERS: Trigger[] = [
  'Stress',
  'Sleep loss',
  'Caffeine',
  'Sugar',
  'Skipped meal',
  'Barometric',
  'Dehydration',
  'Screen time',
];

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min: number, max: number) => Math.random() * (max - min) + min;
const randomPick = <T>(arr: T[]): T => arr[randomInt(0, arr.length - 1)];
const randomPickN = <T>(arr: T[], n: number): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
};

export function generateDemoEpisodes(): Omit<HeadacheEpisode, 'id' | 'timestamp'>[] {
  const episodes: Omit<HeadacheEpisode, 'id' | 'timestamp'>[] = [];
  const now = new Date();

  // Generate 8-12 episodes over 14 days
  const episodeCount = randomInt(8, 12);

  for (let i = 0; i < episodeCount; i++) {
    const daysAgo = randomInt(0, 13);
    const startTime = new Date(now);
    startTime.setDate(startTime.getDate() - daysAgo);
    startTime.setHours(randomInt(6, 22), randomInt(0, 59), 0, 0);

    const usedDevice = Math.random() > 0.3; // 70% used device
    const intensity = randomInt(3, 9);

    const episode: Omit<HeadacheEpisode, 'id' | 'timestamp'> = {
      startTime: startTime.toISOString(),
      durationMin: randomInt(30, 360),
      intensity,
      location: randomPickN(LOCATIONS, randomInt(1, 2)),
      quality: randomPickN(QUALITIES, randomInt(1, 3)),
      triggers: randomPickN(TRIGGERS, randomInt(1, 3)),
      notes: Math.random() > 0.7 ? 'Sample episode from demo data' : '',
      usedDevice,
      deviceEffectiveness: usedDevice ? randomInt(4, 9) : undefined,
      barometricPressure: randomInt(995, 1025),
    };

    if (usedDevice) {
      episode.deviceMode = randomPick([...MODES]);
      episode.deviceDuration = randomInt(10, 45);
      episode.deviceTemp = randomInt(20, 38);
      episode.devicePressure = randomInt(3, 9);
      episode.devicePattern = randomPick([...PATTERNS]);
    }

    episodes.push(episode);
  }

  return episodes.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
}

export function generateDemoHabits(): Omit<HabitLog, 'id' | 'timestamp'>[] {
  const logs: Omit<HabitLog, 'id' | 'timestamp'>[] = [];
  const now = new Date();

  // Generate logs for all 14 days
  for (let i = 0; i < 14; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const log: Omit<HabitLog, 'id' | 'timestamp'> = {
      date: date.toISOString(),

      // Diet
      sugar: randomPick(['None', 'Low', 'Medium', 'High']),
      starch: Math.random() > 0.5,
      dairy: Math.random() > 0.6,
      caffeine: randomPick(['None', '1', '2', '3+']),
      hydration: randomPick(['Poor', 'OK', 'Good']),
      skippedMeals: Math.random() > 0.8,

      // Sleep
      sleepDuration: randomFloat(5, 9),
      sleepQuality: randomPick(['Poor', 'Fair', 'Good']),

      // Stress
      stress: randomInt(2, 8),

      // Exercise
      exercise: Math.random() > 0.5,
      exerciseIntensity: Math.random() > 0.5 ? randomPick(['Low', 'Med', 'High']) : undefined,

      // Environment
      barometricPressure: randomInt(995, 1025),
      weather: randomPickN(['Dry', 'Humid', 'Rain', 'Windy'], randomInt(1, 2)),

      // Menstruation (simulate cycle)
      menstruation: i % 28 < 5, // ~5 day period every 28 days
      menstruationPhase: i % 28 < 5 ? 'On' : i % 28 < 12 ? 'Post' : i % 28 < 19 ? 'Off' : 'Pre',

      // Notes
      notes: Math.random() > 0.8 ? 'Demo habit log entry' : '',
    };

    logs.push(log);
  }

  return logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Get a summary of the generated demo data
 */
export function getDemoDataSummary() {
  const episodes = generateDemoEpisodes();
  const habits = generateDemoHabits();

  return {
    episodes: episodes.length,
    habits: habits.length,
    avgIntensity: (episodes.reduce((sum, e) => sum + e.intensity, 0) / episodes.length).toFixed(1),
    deviceUsage: `${Math.round((episodes.filter((e) => e.usedDevice).length / episodes.length) * 100)}%`,
  };
}
