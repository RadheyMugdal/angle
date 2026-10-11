import { HAPTICS } from './config';
import { readVibration } from '../../vibration';

/**
 * Vibration helpers. Everything funnels through here, so both the build-time
 * switch (`HAPTICS.enabled`) and the player's own choice on /settings are
 * checked in one place and every buzz obeys them.
 *
 * Only Android exposes `navigator.vibrate`; on iOS these calls do nothing and
 * the game just carries on silently.
 */
function vibrate(pattern) {
  if (!HAPTICS.enabled || !readVibration()) return;
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;
  try {
    navigator.vibrate(pattern);
  } catch (e) {}
}

/** The physical "nudge" as a number clicks past the marker. */
export function buzzDetent() {
  vibrate(HAPTICS.detentMs);
}

/** A slightly firmer tick: the dial was reset to zero. */
export function buzzReset() {
  vibrate(HAPTICS.resetMs);
}

/** Three short buzzes: that guess was wrong. */
export function buzzWrongGuess() {
  vibrate(HAPTICS.wrongGuessPattern);
}
