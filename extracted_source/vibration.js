/**
 * Whether the game may vibrate, remembered per browser.
 *
 * On by default: the ticks as the dial turns are most of what makes it feel
 * like turning something, so silence is a choice rather than the starting
 * point. Only an explicit "false" turns it off, so a browser that has never
 * been asked still buzzes.
 *
 * Read on each buzz rather than cached — the calls come from a gesture, never
 * from a loop, and reading keeps the setting true even in a tab that was
 * already open when it changed.
 */

export const VIBRATION_KEY = 'angle.vibration.enabled';

export function readVibration() {
  try {
    return localStorage.getItem(VIBRATION_KEY) !== 'false';
  } catch (e) {
    return true;
  }
}

export function writeVibration(on) {
  try {
    localStorage.setItem(VIBRATION_KEY, on ? 'true' : 'false');
  } catch (e) {}
}
