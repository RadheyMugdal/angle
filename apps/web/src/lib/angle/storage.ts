import type { DailyRoundRecord, GameStats, Guess, UserSettings } from './types';

const GUESSES_KEY = 'guesses';
const CONSTRUCT_KEY = 'angle.construct.daily';
const STATS_KEY = 'angle.stats';
const SETTINGS_KEY = 'angle.settings';

export const DEFAULT_SETTINGS: UserSettings = {
  tipStyle: 'blurred',
  dialMode: 'auto',
  haptics: true,
};

export const DEFAULT_STATS: GameStats = {
  played: 0,
  wins: 0,
  currentStreak: 0,
  maxStreak: 0,
  guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0 },
  round2Completed: 0,
};

export function loadAllGuesses(): Record<string, Guess[]> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(GUESSES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveGuesses(dayString: string, guesses: Guess[]): void {
  if (typeof window === 'undefined') return;
  try {
    const all = loadAllGuesses();
    localStorage.setItem(GUESSES_KEY, JSON.stringify({ ...all, [dayString]: guesses }));
  } catch {}
}

export function loadDailyRound(dayString: string): DailyRoundRecord | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CONSTRUCT_KEY);
    const all = raw ? JSON.parse(raw) : {};
    return all[dayString] ?? null;
  } catch {
    return null;
  }
}

export function saveDailyRound(dayString: string, record: DailyRoundRecord): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(CONSTRUCT_KEY);
    const all = raw ? JSON.parse(raw) : {};
    localStorage.setItem(CONSTRUCT_KEY, JSON.stringify({ ...all, [dayString]: record }));
  } catch {}
}

export function loadStats(): GameStats {
  if (typeof window === 'undefined') return DEFAULT_STATS;
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return DEFAULT_STATS;
    return { ...DEFAULT_STATS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATS;
  }
}

export function saveStats(stats: GameStats): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {}
}

export function recordGameResult(
  won: boolean,
  attemptsCount: number,
  round2Won: boolean
): GameStats {
  const current = loadStats();
  const nextPlayed = current.played + 1;
  const nextWins = current.wins + (won ? 1 : 0);
  const nextCurrentStreak = won ? current.currentStreak + 1 : 0;
  const nextMaxStreak = Math.max(current.maxStreak, nextCurrentStreak);
  const nextDistribution = { ...current.guessDistribution };

  if (won && attemptsCount >= 1 && attemptsCount <= 4) {
    const key = attemptsCount as 1 | 2 | 3 | 4;
    nextDistribution[key] = (nextDistribution[key] || 0) + 1;
  }

  const nextRound2 = current.round2Completed + (round2Won ? 1 : 0);

  const updated: GameStats = {
    played: nextPlayed,
    wins: nextWins,
    currentStreak: nextCurrentStreak,
    maxStreak: nextMaxStreak,
    guessDistribution: nextDistribution,
    round2Completed: nextRound2,
  };

  saveStats(updated);
  return updated;
}

export function loadSettings(): UserSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: UserSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {}
}
