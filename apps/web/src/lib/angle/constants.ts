export const MAX_GUESSES = 4;
export const MAX_CONSTRUCT_ATTEMPTS = 3;
export const CONSTRUCT_TOLERANCE = 5;

// The origin of Angle game #1: June 21, 2022
export const FIRST_DAY_OF_ANGLE = '2022-06-21';

export const SQUARE_COUNT = 5;
export const NEAR_SQUARE = '🟧';
export const FAR_SQUARE = '⬜';
export const SOLVED_SQUARE = '🟩';

export const AXIS_GUARD_DEGREES = 10;

export const CLOSENESS = [
  { within: 5, squares: 4 },
  { within: 10, squares: 3 },
  { within: 20, squares: 2 },
  { within: 50, squares: 1 },
] as const;

export const CONSTRUCT_BANDS = [
  { under: 10, label: 'Boiling!🔥' },
  { under: 20, label: 'Hot!' },
  { under: 35, label: 'Getting Hot' },
  { under: 60, label: 'Warm' },
  { under: 100, label: 'Cold!' },
  { under: Infinity, label: 'Freezing!🥶' },
] as const;

export const STARS_BY_ATTEMPT = [3, 2, 1] as const;
