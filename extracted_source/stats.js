import { DateTime } from 'luxon';
import { MAX_GUESSES } from './constants';
import { loadAllGuesses } from './save_local';

/**
 * All-time figures, worked out from the stored guesses.
 *
 * Two things this has to get right and used not to:
 *
 * The days are read in date order, not in whatever order they happen to sit
 * in storage. Streaks are about adjacency, so an out-of-order key made them
 * nonsense.
 *
 * The current streak is counted back from today rather than left wherever the
 * last stored day put it. Before, a streak that ended a week ago still showed
 * as if it were running — the page reported an old state of play as the
 * current one.
 */

const FORMAT = 'yyyy-MM-dd';

const isWin = (guesses) => guesses.some((guess) => guess.delta === 0);
const isLoss = (guesses) => !isWin(guesses) && guesses.length >= MAX_GUESSES;

export function getStatsData(todayString = DateTime.now().toFormat(FORMAT)) {
  const byDay = loadAllGuesses();
  const days = Object.entries(byDay)
    .filter(
      ([day, guesses]) =>
        Array.isArray(guesses) && DateTime.fromFormat(day, FORMAT).isValid
    )
    .sort(([a], [b]) => a.localeCompare(b));

  const guessDistribution = { 1: 0, 2: 0, 3: 0, 4: 0 };
  let maxStreak = 0;
  let run = 0;
  let previous = null;

  for (const [day, guesses] of days) {
    const date = DateTime.fromFormat(day, FORMAT);
    const winIndex = guesses.findIndex((guess) => guess.delta === 0);

    if (winIndex < 0) {
      run = 0;
      previous = date;
      continue;
    }

    guessDistribution[winIndex + 1] += 1;
    const followsOn = previous?.plus({ days: 1 }).hasSame(date, 'day');
    run = followsOn ? run + 1 : 1;
    if (run > maxStreak) maxStreak = run;
    previous = date;
  }

  // Counted backwards from today. An unfinished today does not end a streak —
  // there is still time — but a lost one does.
  let cursor = DateTime.fromFormat(todayString, FORMAT);
  const guessesOn = (date) => byDay[date.toFormat(FORMAT)];
  const today = guessesOn(cursor);
  if (!today || (!isWin(today) && !isLoss(today))) {
    cursor = cursor.minus({ days: 1 });
  }

  let currentStreak = 0;
  for (let step = 0; step <= days.length; step += 1) {
    const guesses = guessesOn(cursor);
    if (!Array.isArray(guesses) || !isWin(guesses)) break;
    currentStreak += 1;
    cursor = cursor.minus({ days: 1 });
  }

  const played = days.length;
  const winCount = Object.values(guessDistribution).reduce(
    (total, count) => total + count,
    0
  );

  return {
    currentStreak,
    maxStreak,
    played,
    winRatio: winCount / (played || 1),
    guessDistribution,
  };
}
