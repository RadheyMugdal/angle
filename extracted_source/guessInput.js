/**
 * What the guess field's text means.
 *
 * Kept apart from the field and the handler so it can be swept over every
 * input a player can produce. The empty case is the reason it exists:
 * `Number('')` is 0, and 0° is a legal angle, so a check on the number alone
 * cannot tell "the player means zero" from "the player typed nothing" — and
 * an accidental tap on Guess! was costing an attempt.
 */

export const MIN_ANGLE = 0;
export const MAX_ANGLE = 360;

export const EMPTY = 'empty';
export const OUT_OF_RANGE = 'range';

export function parseGuess(text) {
  const trimmed = String(text ?? '').trim();
  if (trimmed === '') return { ok: false, reason: EMPTY };

  const numeric = Number(trimmed);
  if (!Number.isFinite(numeric)) return { ok: false, reason: EMPTY };
  if (numeric < MIN_ANGLE || numeric > MAX_ANGLE) {
    return { ok: false, reason: OUT_OF_RANGE };
  }
  return { ok: true, value: Math.round(numeric) };
}
