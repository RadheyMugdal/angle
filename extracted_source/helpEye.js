/**
 * Whether the dial keyboard is showing, remembered per browser.
 *
 * Three states, deliberately: "true" and "false" are choices the player made,
 * and no key at all means they haven't chosen. Only the last case falls back
 * to the default, so an explicit "closed" is never mistaken for silence.
 *
 * The default itself depends on whether this browser has played before: a
 * first-time visitor gets the keyboard open, everyone else gets it closed.
 */

export const HELP_EYE_KEY = 'angle.helpEye.open';
/** Written by save_local.js the first time a guess is stored. */
const GUESSES_KEY = 'guesses';

function read(key) {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    return null;
  }
}

/** No guesses ever stored in this browser => nobody has played here. */
export function hasNeverPlayed() {
  return read(GUESSES_KEY) === null;
}

/** The state to open with: the player's choice, or the first-visit default. */
export function getInitialHelpEyeOpen() {
  const stored = read(HELP_EYE_KEY);
  if (stored === 'true') return true;
  if (stored === 'false') return false;
  return hasNeverPlayed();
}

export function writeHelpEyeOpen(open) {
  try {
    localStorage.setItem(HELP_EYE_KEY, open ? 'true' : 'false');
  } catch (e) {}
}
