/**
 * Every tunable of the mobile dial keyboard lives here.
 *
 * The keyboard is two nested rotary dials:
 *   - outer ring = tens  (0, 10, 20 ... 350)
 *   - inner ring = units (0 ... 9)
 * The guess is simply `outerValue + innerValue`, e.g. 50 + 2 = 52.
 *
 * Nothing else in the app reads this file, so tweaking a number here can only
 * change how the keyboard looks/feels.
 */

/** Detents of each ring. `valuePerStep` is what one detent is worth. */
export const RINGS = {
  outer: { steps: 36, valuePerStep: 10 }, // 0,10,...,350
  inner: { steps: 10, valuePerStep: 1 }, // 0,1,...,9
};

/** Highest guess the two rings can express together (350 + 9). */
export const MAX_DIAL_VALUE =
  (RINGS.outer.steps - 1) * RINGS.outer.valuePerStep +
  (RINGS.inner.steps - 1) * RINGS.inner.valuePerStep;

/**
 * Geometry, as fractions of the dial radius (0 = centre, 1 = outer edge),
 * so the whole thing scales with the phone width.
 */
export const GEOMETRY = {
  widthRatio: 0.8, // the dial is this share of the window width, and that
  //                  width is the only thing that decides its size
  maxSizePx: 420, // never grow bigger than this, even on a tablet
  maxViewportHeight: 0.62, // only bites on a short viewport, i.e. landscape
  minSizePx: 200, // ...but never smaller than this, or the 36 tens labels
  //                 stop fitting round the ring (matters in landscape)

  // The 36 outer labels have to share the circumference, so "350" has to stay
  // small: one slot is only (2 * PI * outerLabelRadius * R) / 36 wide.
  outerBandInner: 0.74, // outer ring band: 0.74R -> 1.00R
  outerLabelRadius: 0.86,
  outerTickRadius: 0.955,
  outerFontRatio: 0.036, // font-size = ratio * dial size
  outerFontMinPx: 8,
  outerLensWidthEm: 2.5, // the highlight around the selected label

  innerBandOuter: 0.66, // inner ring band: 0.34R -> 0.66R
  innerBandInner: 0.34,
  innerLabelRadius: 0.5,
  innerTickRadius: 0.63,
  innerFontRatio: 0.08,
  innerFontMinPx: 16,
  innerLensWidthEm: 1.6,

  readoutRadius: 0.32, // the disc in the middle showing the final number
  readoutFontRatio: 0.115,
  markerSizeRatio: 0.03, // the little triangles pointing at the selection

  deadZoneRadius: 0.17, // drags this close to the centre are ignored
};

/**
 * Rotation physics. Degrees and seconds.
 *
 * A gesture goes: drag (1:1 with the finger) -> spin (friction only) ->
 * settle (critically damped spring onto the nearest detent).
 */
export const PHYSICS = {
  friction: 3.1, // exponential spin decay, 1/s
  snapVelocity: 130, // deg/s under which the detent spring takes over
  snapLookahead: 0.09, // s of travel used to pick the detent to land on
  stiffness: 260, // detent snap: spring constant, deg/s² per deg
  damping: 32, // ~2*sqrt(stiffness) => critically damped, no wobble
  // Moves we start ourselves (tap a number, typed value, reset) are a timed
  // ease instead of a spring: a spring's tail is long and unpredictable, and
  // the dial has to be back at rest before the next tap.
  glideMinMs: 220,
  glideMsPerDegree: 1.6,
  glideMaxMs: 620,
  restVelocity: 5, // deg/s
  restOffset: 0.12, // deg
  maxFrameMs: 40, // ignore longer gaps (tab was backgrounded)
  subStepMs: 4, // fixed integration sub-step, keeps the spring stable
  velocityBlend: 0.45, // EMA weight of the newest finger sample
  maxVelocity: 2600, // deg/s clamp, stops absurd flings
  staleReleaseMs: 90, // finger parked this long before lift => no fling
};

/**
 * What counts as a tap rather than a drag.
 *
 * This is deliberately strict. A tap on a ring jumps that number up to the
 * marker, which can be half a turn away — so mistaking a small, careful drag
 * for a tap would fling the dial somewhere the user never asked for. Failing
 * the other way is harmless: the gesture is treated as a drag and the ring
 * simply settles back where it was, and the user can tap again.
 *
 * `maxRotationSteps` is a fraction of one detent, so it scales per ring: 0.3
 * is 3° on the tens ring and 10.8° on the units ring.
 */
export const TAP = {
  maxTravelPx: 12, // total finger path length, not just start-to-end
  maxRotationSteps: 0.3,
  maxDurationMs: 450, // longer than this is a considered press, ignore it
  /** Button-like targets (the centre) only care about movement, so give
   *  them a roomier time budget — a slow press should still work. */
  pressMaxDurationMs: 900,
};

/**
 * Vibration. `navigator.vibrate` is Android-only — iOS Safari has no
 * equivalent, so on an iPhone these are silent no-ops.
 */
export const HAPTICS = {
  enabled: true,
  /** The nudge felt every time a number clicks past the marker. */
  detentMs: 6,
  /** Tapping the middle of the dial to reset it to zero. */
  resetMs: 18,
  /** Three buzzes with pauses, 800ms in total, for a wrong guess. */
  wrongGuessPattern: [140, 190, 140, 190, 140],
};

export const BEHAVIOUR = {
  /** Touching a dial dismisses the native keyboard if it was open. */
  blurNativeKeyboardOnGrab: true,
  /** ?keypad=1 forces the dial on (handy on desktop), ?keypad=0 forces it off. */
  overrideQueryParam: 'keypad',
  /** A device is "mobile" when it has a coarse pointer and a small screen. */
  pointerQuery: '(pointer: coarse)',
  /**
   * Measured on the *short* side, so turning a phone to landscape doesn't take
   * the keyboard away mid-game — a phone is a phone whichever way up it is.
   */
  maxShortSidePx: 820,
};
