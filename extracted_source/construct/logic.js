import {
  AXIS_GUARD_DEGREES,
  MAX_ATTEMPTS,
  STARS_BY_ATTEMPT,
  TARGETS,
  TOLERANCE,
} from './config';

/**
 * Targets, feedback and scoring for Construct.
 *
 * Feedback follows the daily's own language — a direction and a warm/cold
 * word — rather than stating how far off you were. That keeps the useful part
 * (which way, roughly how far) without ever handing over the number, and it
 * means anyone who plays the daily already knows how to read it.
 */

export function generateTargets(count) {
  const { min, max, landmarks, landmarkGuard, minSeparation } = TARGETS;
  const targets = [];
  let guard = 0;

  while (targets.length < count && guard < 2000) {
    guard += 1;
    const value = min + Math.round(Math.random() * (max - min));
    if (landmarks.some((l) => Math.abs(value - l) <= landmarkGuard)) continue;
    const previous = targets[targets.length - 1];
    if (previous != null && Math.abs(value - previous) < minSeparation)
      continue;
    targets.push(value);
  }

  return targets;
}

/** A starting orientation that gives away nothing: never near a screen axis. */
export function randomFixedAngle() {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const angle = Math.random() * 360;
    const nearAxis = [0, 90, 180, 270, 360].some(
      (axis) => Math.abs(angle - axis) < AXIS_GUARD_DEGREES
    );
    if (!nearAxis) return angle;
  }
  return 37;
}

/**
 * The daily's warm/cold ladder, shifted so the first band starts where the
 * tolerance ends — otherwise "Boiling" would describe an angle you had
 * already made.
 */
const BANDS = [
  { under: 10, label: 'Boiling!🔥' },
  { under: 20, label: 'Hot!' },
  { under: 35, label: 'Getting Hot' },
  { under: 60, label: 'Warm' },
  { under: 100, label: 'Cold!' },
  { under: Infinity, label: 'Freezing!🥶' },
];

/**
 * The angle a rotation actually makes, measured the short way round.
 *
 * The sweep is stored in [0,360), but every target is 170° or less, so turning
 * 330° one way builds the same figure as turning 30° the other. Judging the
 * raw sweep called a correct 30° angle 300° wrong purely because of the
 * direction the player happened to rotate; folding first is what makes the two
 * directions equivalent, as they already look on screen.
 */
export function foldToNonReflex(value) {
  const wrapped = ((value % 360) + 360) % 360;
  return wrapped > 180 ? 360 - wrapped : wrapped;
}

/** Signed error wrapped to (-180, 180]: 2° past 355° is +7, not -353. */
export function circularDifference(produced, target) {
  return ((((produced - target) % 360) + 540) % 360) - 180;
}

/** The sweep as a value in [0, 360). */
export function normaliseSweep(value) {
  return ((Math.round(value) % 360) + 360) % 360;
}

/**
 * The angle the player is credited with building.
 *
 * Up to 180° the two rotation directions build the same figure, so the short
 * way round is what they made. Past it they do not: 141° and 219° are
 * different angles, and folding a reflex target's sweep made every one of them
 * unwinnable. So the fold only applies where it is true.
 */
export function effectiveAngle(produced, target) {
  return target > 180 ? normaliseSweep(produced) : foldToNonReflex(produced);
}

/**
 * Signed error: negative means the angle made was too narrow, positive too
 * wide. It is a comparison between the angle built and the one asked for, not
 * a direction to turn in — every attempt opens somewhere new, so there is no
 * "from here" for an arrow to point from.
 *
 * Measured against the credited angle, which is what the row, the reveal and
 * the ghost all show, so the clue can never describe a different figure from
 * the one on screen.
 */
export function angleError(produced, target) {
  return target > 180
    ? circularDifference(normaliseSweep(produced), target)
    : foldToNonReflex(produced) - target;
}

/**
 * Where a fresh attempt starts.
 *
 * Never zero. With a 1° step a known origin let a player tap the button and
 * count rather than judge the angle by eye, which is the one skill this mode
 * exists to train. From an arbitrary start a tap count is relative, and so
 * tells them nothing. Kept clear of the target too, so the opening position is
 * never a free win.
 *
 * `random` is injected so the daily can seed it and stay the same for everyone.
 */
export function startingSweep(target, random = Math.random) {
  // Open on the same side of 180 as the answer: starting at 90° for a 219°
  // target means dragging through the straight line with nothing saying so.
  const reflex = target > 180;
  const from = reflex ? 190 : 15;
  const span = reflex ? 155 : 160;

  for (let attempt = 0; attempt < 100; attempt += 1) {
    const value = from + Math.round(random() * span);
    if (Math.abs(angleError(value, target)) > TOLERANCE * 4) {
      return value;
    }
  }
  // Only reached if every draw landed near the answer, which a real sequence
  // will not do — but a fixed 200 here was itself a free win for targets
  // either side of it.
  if (reflex) return target > 270 ? 200 : 340;
  return target > 90 ? 20 : 170;
}

/**
 * What the player is told after an attempt. The exact difference is kept out
 * of the result on purpose: only the direction and the band travel to the UI.
 *
 * `produced` comes back as the angle actually credited, so the verdict, the
 * reveal and the ghost rays can never quote different numbers.
 */
export function judge(produced, target) {
  const difference = angleError(produced, target);
  const credited = effectiveAngle(produced, target);
  if (Math.abs(difference) <= TOLERANCE) {
    return { solved: true, produced: credited };
  }
  return {
    solved: false,
    produced: credited,
    // Positive difference means the angle is too wide, so aim narrower.
    direction: difference > 0 ? 'narrower' : 'wider',
    label: BANDS.find((band) => Math.abs(difference) < band.under).label,
  };
}

export function starsForAttempt(attemptIndex) {
  return STARS_BY_ATTEMPT[attemptIndex] ?? 0;
}

export function maxStars(runLength) {
  return runLength * STARS_BY_ATTEMPT[0];
}

/** Mean error of first attempts — the number that shows real improvement. */
export function meanFirstAttemptError(results) {
  const errors = results
    .map((result) => result.firstError)
    .filter((error) => Number.isFinite(error));
  if (!errors.length) return null;
  return errors.reduce((total, error) => total + error, 0) / errors.length;
}

const SQUARE_BY_ATTEMPT = ['🟩', '🟨', '🟧'];

export function buildConstructShareText(results, runLength) {
  const stars = results.reduce((total, result) => total + result.stars, 0);
  const squares = results
    .map((result) =>
      result.solved ? SQUARE_BY_ATTEMPT[result.attempts - 1] : '⬜'
    )
    .join('');
  const meanError = meanFirstAttemptError(results);

  return [
    `Angle Construct · ${stars}/${maxStars(runLength)} ⭐`,
    squares,
    meanError != null ? `First-attempt error: ${meanError.toFixed(1)}°` : null,
    'https://www.angle.wtf',
  ]
    .filter(Boolean)
    .join('\n');
}

export { MAX_ATTEMPTS, TOLERANCE };
