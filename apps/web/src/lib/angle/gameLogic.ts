import {
  AXIS_GUARD_DEGREES,
  CLOSENESS,
  CONSTRUCT_BANDS,
  CONSTRUCT_TOLERANCE,
  FAR_SQUARE,
  FIRST_DAY_OF_ANGLE,
  MAX_CONSTRUCT_ATTEMPTS,
  MAX_GUESSES,
  NEAR_SQUARE,
  SOLVED_SQUARE,
  SQUARE_COUNT,
} from './constants';
import { alea } from './prng';
import type { ConstructVerdict, DailyRoundRecord, Guess } from './types';

export function getDayString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getPuzzleNumber(dayString: string): number {
  const target = new Date(dayString + 'T00:00:00Z');
  const start = new Date(FIRST_DAY_OF_ANGLE + 'T00:00:00Z');
  const diffTime = target.getTime() - start.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

export function getDailyAngles(dayString: string) {
  const prng1 = alea(dayString);
  const prng2 = alea(dayString + 'otherrandomstring');

  const angle1 = prng1() * 2 * Math.PI;
  const angle2 = prng2() * 2 * Math.PI;

  const deltaAngle =
    angle1 >= angle2 ? angle1 - angle2 : 2 * Math.PI - (angle2 - angle1);
  const answer = Math.round((180 / Math.PI) * deltaAngle);

  return { angle1, angle2, deltaAngle, answer };
}

export function getRandomAngles() {
  const angle1 = Math.random() * 2 * Math.PI;
  const angle2 = Math.random() * 2 * Math.PI;

  const deltaAngle =
    angle1 >= angle2 ? angle1 - angle2 : 2 * Math.PI - (angle2 - angle1);
  const answer = Math.round((180 / Math.PI) * deltaAngle);

  return { angle1, angle2, deltaAngle, answer };
}

export const temperature = (guess: number, answer: number): string => {
  const diff = Math.abs(answer - guess);
  if (diff === 0) return '🎉🎉🎉';
  if (diff < 5) return 'Boiling!🔥';
  if (diff < 10) return 'Hot!';
  if (diff < 20) return 'Getting Hot';
  if (diff < 50) return 'Warm';
  if (diff < 100) return 'Cold!';
  return 'Freezing!🥶';
};

export const arrow = (guess: number, answer: number): string => {
  if (answer === guess) return '🥳';
  return answer > guess ? '⬆️' : '⬇️';
};

export function parseGuess(text: string): { ok: true; value: number } | { ok: false; reason: 'empty' | 'range' } {
  const trimmed = String(text ?? '').trim();
  if (trimmed === '') return { ok: false, reason: 'empty' };

  const numeric = Number(trimmed);
  if (!Number.isFinite(numeric)) return { ok: false, reason: 'empty' };
  if (numeric < 0 || numeric > 360) {
    return { ok: false, reason: 'range' };
  }
  return { ok: true, value: Math.round(numeric) };
}

export function foldToNonReflex(value: number): number {
  const wrapped = ((value % 360) + 360) % 360;
  return wrapped > 180 ? 360 - wrapped : wrapped;
}

export function circularDifference(produced: number, target: number): number {
  return ((((produced - target) % 360) + 540) % 360) - 180;
}

export function normaliseSweep(value: number): number {
  return ((Math.round(value) % 360) + 360) % 360;
}

export function effectiveAngle(produced: number, target: number): number {
  return target > 180 ? normaliseSweep(produced) : foldToNonReflex(produced);
}

export function angleError(produced: number, target: number): number {
  return target > 180
    ? circularDifference(normaliseSweep(produced), target)
    : foldToNonReflex(produced) - target;
}

export function judge(produced: number, target: number): ConstructVerdict {
  const difference = angleError(produced, target);
  const credited = effectiveAngle(produced, target);
  if (Math.abs(difference) <= CONSTRUCT_TOLERANCE) {
    return {
      solved: true,
      produced: credited,
      error: difference,
      label: 'Solved! 🎉',
      direction: 'wider',
    };
  }
  const band = CONSTRUCT_BANDS.find((b) => Math.abs(difference) < b.under) ?? CONSTRUCT_BANDS[CONSTRUCT_BANDS.length - 1];
  return {
    solved: false,
    produced: credited,
    error: difference,
    direction: difference > 0 ? 'narrower' : 'wider',
    label: band.label,
  };
}

export function dailyFixedAngle(dayString: string): number {
  const prng = alea(`${dayString}-construct`);
  const angle = prng() * 360;
  const nearestAxis = Math.round(angle / 90) * 90;
  if (Math.abs(angle - nearestAxis) < AXIS_GUARD_DEGREES) {
    const pushed = nearestAxis + (angle >= nearestAxis ? 1 : -1) * AXIS_GUARD_DEGREES;
    return ((pushed % 360) + 360) % 360;
  }
  return angle;
}

export function startingSweep(target: number, random: () => number = Math.random): number {
  const reflex = target > 180;
  const from = reflex ? 190 : 15;
  const span = reflex ? 155 : 160;

  for (let attempt = 0; attempt < 100; attempt += 1) {
    const value = from + Math.round(random() * span);
    if (Math.abs(angleError(value, target)) > CONSTRUCT_TOLERANCE * 4) {
      return value;
    }
  }
  if (reflex) return target > 270 ? 200 : 340;
  return target > 90 ? 20 : 170;
}

export function dailyStartSweep(dayString: string, attemptIndex: number, target: number): number {
  return startingSweep(target, alea(`${dayString}-start-${attemptIndex}`));
}

export function getGuessRow(guess: Guess) {
  if (guess.delta === 0) {
    return { direction: 'solved' as const, filled: SQUARE_COUNT };
  }
  const distance = Math.abs(guess.delta);
  const step = CLOSENESS.find((level) => distance < level.within);
  return {
    direction: guess.delta > 0 ? ('down' as const) : ('up' as const),
    filled: step ? step.squares : 0,
  };
}

const ROW_EMOJI = { solved: '🎉', up: '⬆️', down: '⬇️' };

function rowToEmoji(row: { direction: 'solved' | 'up' | 'down'; filled: number }) {
  const fill = row.direction === 'solved' ? SOLVED_SQUARE : NEAR_SQUARE;
  return `${ROW_EMOJI[row.direction]} ${fill.repeat(row.filled)}${FAR_SQUARE.repeat(
    SQUARE_COUNT - row.filled
  )}`;
}

export function buildShareText({
  dayString,
  guesses,
  win,
  round2,
}: {
  dayString: string;
  guesses: Guess[];
  win: boolean;
  round2?: DailyRoundRecord | null;
}): string {
  const score = win ? `${guesses.length}/${MAX_GUESSES}` : `X/${MAX_GUESSES}`;
  let round2Part = '';
  if (round2 && !round2.skipped && round2.attempts?.length) {
    round2Part = round2.solved ? ` · made it in ${round2.attempts.length}` : ' · not made';
  }

  const rows = guesses.map(getGuessRow);
  return [
    `#Angle #${getPuzzleNumber(dayString)} ${score}${round2Part}`,
    ...rows.map(rowToEmoji),
    'https://angle.wtf',
  ].join('\n');
}
