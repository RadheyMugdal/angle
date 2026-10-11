export interface Guess {
  value: number;
  delta: number; // guess - answer
}

export type TipStyle = 'blurred' | 'dashed' | 'off';

export type DialMode = 'auto' | 'always' | 'off';

export interface DailyRoundRecord {
  attempts: number[];
  solved: boolean;
  done: boolean;
  skipped?: boolean;
}

export interface ConstructVerdict {
  produced: number;
  error: number;
  label: string;
  direction: 'wider' | 'narrower';
  solved: boolean;
}

export interface GameStats {
  played: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
  };
  round2Completed: number;
}

export interface UserSettings {
  tipStyle: TipStyle;
  dialMode: DialMode;
  haptics: boolean;
}

export type GameMode = 'daily' | 'practice' | 'arcade';
