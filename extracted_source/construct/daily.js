import seedrandom from 'seedrandom';
import { AXIS_GUARD_DEGREES, MAX_ATTEMPTS } from './config';
import { effectiveAngle, judge, startingSweep } from './logic';

/**
 * Round 2 of the daily: make the angle you just identified.
 *
 * The target needs no generator — it is the day's answer, which is already
 * deterministic. Only the orientation of the fixed ray is drawn from the seed,
 * and it is a *different* orientation from Round 1 so there is nothing on
 * screen to pattern-match against; the player has to work from the number.
 *
 * Kept in its own storage key so streaks, win % and the guess distribution —
 * all of which read the `guesses` map — are untouched by whether anyone plays
 * the second round.
 */

const STORAGE_KEY = 'angle.construct.daily';

export function dailyFixedAngle(dayString) {
  const angle = seedrandom.alea(`${dayString}-construct`)() * 360;
  // Nudge off any screen axis, deterministically: no free right angles.
  const nearestAxis = Math.round(angle / 90) * 90;
  if (Math.abs(angle - nearestAxis) < AXIS_GUARD_DEGREES) {
    const pushed =
      nearestAxis + (angle >= nearestAxis ? 1 : -1) * AXIS_GUARD_DEGREES;
    return ((pushed % 360) + 360) % 360;
  }
  return angle;
}

/**
 * The opening position for an attempt. Seeded per day and per attempt, so it
 * is the same challenge for everyone and a refresh cannot reroll it into
 * something easier.
 */
export function dailyStartSweep(dayString, attemptIndex, target) {
  return startingSweep(
    target,
    seedrandom.alea(`${dayString}-start-${attemptIndex}`)
  );
}

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {};
  } catch (e) {
    return {};
  }
}

/** null means the player has not touched Round 2 today. */
export function loadDailyRound(dayString) {
  const record = readAll()[dayString];
  if (!record || !Array.isArray(record.attempts)) return null;
  return record;
}

export function saveDailyRound(dayString, record) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...readAll(), [dayString]: record })
    );
  } catch (e) {}
}

/**
 * Re-derive a stored round from its attempts.
 *
 * Rounds played while reflex targets were mis-judged were saved with
 * `solved: false` even when the player hit the angle. The board recomputes on
 * load, but the result card, the share text and the stats read the stored
 * flag, so it has to be corrected in place. Attempts are rewritten to the
 * angle now credited for them, which keeps the reveal and the ghosts honest.
 *
 * Returns the record only when something changed, so callers can leave state
 * alone in the ordinary case.
 */
export function reconcileDailyRound(dayString, target) {
  const record = loadDailyRound(dayString);
  if (!record || record.attempts.length === 0) return null;

  const attempts = record.attempts.map((produced) =>
    effectiveAngle(produced, target)
  );
  const solved = attempts.some((produced) => judge(produced, target).solved);
  const done = solved || attempts.length >= MAX_ATTEMPTS;

  const unchanged =
    solved === Boolean(record.solved) &&
    done === Boolean(record.done) &&
    attempts.every((value, i) => value === record.attempts[i]);
  if (unchanged) return null;

  const healed = { ...record, attempts, solved, done };
  saveDailyRound(dayString, healed);
  return healed;
}

/**
 * Whether a stored round was actually made, judged from its attempts.
 *
 * The record carries a `solved` flag, but a flag is a second copy of
 * something already known, and a stale one — written by an older rule, or by a
 * version that got the judging wrong — is how a round that was made comes back
 * as "not made". The attempts are the record; this is the reading of them.
 */
export function roundSolved(record, target) {
  if (!record || !Array.isArray(record.attempts)) return false;
  return record.attempts.some((produced) => judge(produced, target).solved);
}

export function isRoundFinished(record) {
  return Boolean(record && (record.solved || record.skipped || record.done));
}
