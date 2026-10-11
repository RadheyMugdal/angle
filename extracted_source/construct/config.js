/**
 * Construct — every tunable of the arcade mode in one place.
 *
 * The daily asks "what angle is this?". Construct asks "make me this angle":
 * a target in degrees, a ray to rotate, and a handful of attempts.
 */

/** Angles in a run. Roughly 20s each, so this is a ~2.5 minute session. */
export const RUN_LENGTH = 8;
export const MAX_ATTEMPTS = 3;

/**
 * How close counts as made. Deliberately looser than it sounds: producing an
 * angle is a coarser skill than recognising one, and the first attempt has no
 * information to work from. Tighten once real first-attempt rates are visible.
 */
export const TOLERANCE = 5;

/** Stars by the attempt that solved it. */
export const STARS_BY_ATTEMPT = [3, 2, 1];
export const MAX_STARS_PER_ANGLE = STARS_BY_ATTEMPT[0];

export const TARGETS = {
  min: 10,
  max: 170,
  /** Landmarks are easy to produce and teach nothing, so they are excluded. */
  landmarks: [45, 90, 135],
  landmarkGuard: 3,
  /** Consecutive targets stay apart so the last one is no help. */
  minSeparation: 15,
};

/** The fixed ray never lines up with a screen edge — no free right angles. */
export const AXIS_GUARD_DEGREES = 10;

export const INPUT = {
  step: 1,
  coarseStep: 5, // shift + arrow key
  /** Dragging this close to the pivot is ignored: 1px there is several degrees. */
  deadZone: 0.22,
  hold: { delayMs: 400, startMs: 110, minMs: 40, ramp: 0.85 },
};

/** Board geometry, in viewBox units. */
export const BOARD = {
  size: 300,
  rayLength: 130,
  arcRadius: 34,
  ghostArcRadius: 34,
};
