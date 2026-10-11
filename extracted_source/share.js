import { DateTime } from 'luxon';
import { MAX_GUESSES } from './constants';
import { roundSolved } from './construct/daily';

/**
 * The daily result as shareable text.
 *
 * Each guess becomes a row: the arrow the game showed you, then five squares
 * for how close you were — the same warm/cold scale as the hints, so the grid
 * reads like a replay of the round rather than a score out of nowhere.
 */

const FIRST_DAY_OF_ANGLE = DateTime.fromFormat('June 21 2022', 'LLLL dd yyyy');
const SQUARE_COUNT = 5;
const NEAR = '🟧';
const FAR = '⬜';
const SOLVED = '🟩';

/** Distance from the answer -> how many squares fill in. */
const CLOSENESS = [
  { within: 5, squares: 4 },
  { within: 10, squares: 3 },
  { within: 20, squares: 2 },
  { within: 50, squares: 1 },
];

export function getPuzzleNumber(dayString) {
  const day = DateTime.fromFormat(dayString, 'yyyy-MM-dd');
  return Math.round(day.diff(FIRST_DAY_OF_ANGLE, 'days').toObject().days);
}

export const SQUARES_PER_ROW = SQUARE_COUNT;

/**
 * One guess as plain data: which way the game pointed you, and how many
 * squares light up. The page draws this with real elements — emoji are only
 * used for the text that leaves the app, where they are the whole point.
 */
export function getGuessRow(guess) {
  if (guess.delta === 0) {
    return { direction: 'solved', filled: SQUARE_COUNT };
  }
  const distance = Math.abs(guess.delta);
  const step = CLOSENESS.find((level) => distance < level.within);
  return {
    // delta is guess - answer, so a positive delta means aim lower.
    direction: guess.delta > 0 ? 'down' : 'up',
    filled: step ? step.squares : 0,
  };
}

export function getGuessRows(guesses) {
  return guesses.map(getGuessRow);
}

const ROW_EMOJI = { solved: '🎉', up: '⬆️', down: '⬇️' };

function rowToEmoji(row) {
  const fill = row.direction === 'solved' ? SOLVED : NEAR;
  return `${ROW_EMOJI[row.direction]} ${fill.repeat(row.filled)}${FAR.repeat(
    SQUARE_COUNT - row.filled
  )}`;
}

/** Round 2, if it was played, rides on the headline rather than a new block. */
function round2Suffix(round2, answer) {
  if (!round2 || round2.skipped || !round2.attempts?.length) return '';
  return roundSolved(round2, answer)
    ? ` · made it in ${round2.attempts.length}`
    : ' · not made';
}

export function buildShareText({ dayString, guesses, win, round2 }) {
  // Every guess carries its distance from the answer, so the answer comes
  // back from any one of them without re-deriving the day's puzzle.
  const answer = guesses.length ? guesses[0].value - guesses[0].delta : null;
  const score = win ? `${guesses.length}/${MAX_GUESSES}` : `X/${MAX_GUESSES}`;
  return [
    `#Angle #${getPuzzleNumber(dayString)} ${score}${round2Suffix(round2, answer)}`,
    ...getGuessRows(guesses).map(rowToEmoji),
    'https://www.angle.wtf',
  ].join('\n');
}

/** Last-resort copy for browsers without the async clipboard API. */
function copyWithTextarea(text) {
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(area);
    return ok;
  } catch (e) {
    return false;
  }
}

/**
 * Hand the result to the device: the native share sheet where there is one,
 * otherwise the clipboard.
 *
 * Must be called straight from the click — `navigator.share` is only allowed
 * while the user gesture is still live, so nothing may be awaited before it.
 *
 * Resolves to 'shared' | 'cancelled' | 'copied' | 'failed'.
 */
export function shareResult(text) {
  if (typeof navigator !== 'undefined' && navigator.share) {
    return navigator
      .share({ text })
      .then(() => 'shared')
      .catch((error) => {
        if (error && error.name === 'AbortError') return 'cancelled';
        return copyToClipboard(text);
      });
  }
  return copyToClipboard(text);
}

/**
 * Same as shareResult, but for an address: passing `url` rather than `text`
 * is what makes a chat app treat it as a link and fetch its preview.
 *
 * `useSheet` is off for anything that is not a phone. Desktop browsers do
 * offer navigator.share, but it opens an OS dialog nobody asked for when the
 * useful thing on a computer is simply having the link on the clipboard.
 */
export function shareLink(url, { useSheet = true } = {}) {
  if (useSheet && typeof navigator !== 'undefined' && navigator.share) {
    return navigator
      .share({ url })
      .then(() => 'shared')
      .catch((error) => {
        if (error && error.name === 'AbortError') return 'cancelled';
        return copyToClipboard(url);
      });
  }
  return copyToClipboard(url);
}

function copyToClipboard(text) {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    return navigator.clipboard
      .writeText(text)
      .then(() => 'copied')
      .catch(() => (copyWithTextarea(text) ? 'copied' : 'failed'));
  }
  return Promise.resolve(copyWithTextarea(text) ? 'copied' : 'failed');
}
