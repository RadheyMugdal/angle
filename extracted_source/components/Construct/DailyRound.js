import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { ConstructBoard } from './ConstructBoard';
import {
  Controls,
  FeedbackList,
  Primary,
  Reveal,
  RevealValue,
} from './parts';
import { INPUT, MAX_ATTEMPTS, TOLERANCE } from '../../construct/config';
import {
  angleError,
  effectiveAngle,
  judge,
  normaliseSweep,
} from '../../construct/logic';
import {
  dailyFixedAngle,
  dailyStartSweep,
  saveDailyRound,
} from '../../construct/daily';
import { track } from '../../analytics';

/**
 * Round 2, played in the daily's own page: one angle, three attempts, the
 * ladder of feedback the daily already uses.
 *
 * Attempts are written to storage as they happen, so a refresh cannot hand out
 * a fresh set.
 */

const Task = styled.div`
  text-align: center;
  margin-bottom: 0.4rem;
`;

const Prompt = styled.div`
  font-size: 1.6rem;
  line-height: 1.2;
  font-family: 'Boston-Regular';
  color: #df6247;
`;

const Hint = styled.div`
  font-size: 0.85rem;
  color: #6b7280;
  @media (prefers-color-scheme: dark) {
    color: #9aa0a8;
  }
`;

export function DailyRound({ dayString, target, record, onFinish }) {
  const fixedAngle = dailyFixedAngle(dayString);
  const [attempts, setAttempts] = useState(() =>
    (record?.attempts ?? []).map((produced) => effectiveAngle(produced, target))
  );
  const [feedback, setFeedback] = useState(() =>
    (record?.attempts ?? [])
      .map((produced) => judge(produced, target))
      .filter((verdict) => !verdict.solved)
  );
  const [sweep, setSweep] = useState(() =>
    dailyStartSweep(dayString, (record?.attempts ?? []).length, target)
  );

  const solved = attempts.some((produced) => judge(produced, target).solved);
  const finished = solved || attempts.length >= MAX_ATTEMPTS;

  // Each attempt starts somewhere fresh, so this is another act of
  // construction rather than nudging the ghost of the last one — and so that
  // counting taps from a known origin cannot stand in for judging by eye.
  useEffect(() => {
    setSweep(dailyStartSweep(dayString, attempts.length, target));
  }, [attempts.length, dayString, target]);

  const nudge = useCallback((delta) => {
    setSweep((value) => (((value + delta) % 360) + 360) % 360);
  }, []);

  const commit = useCallback(() => {
    if (finished) return;
    // The credited angle, not the raw sweep: 359.7 must not store as 360, and
    // the verdict, the reveal and the ghosts all have to quote one number.
    const verdict = judge(normaliseSweep(sweep), target);
    const nextAttempts = [...attempts, verdict.produced];
    setAttempts(nextAttempts);
    if (!verdict.solved) setFeedback((all) => [...all, verdict]);

    const done = verdict.solved || nextAttempts.length >= MAX_ATTEMPTS;
    saveDailyRound(dayString, {
      attempts: nextAttempts,
      solved: verdict.solved,
      done,
    });

    // Fires once, when round 2 actually ends. Paired with `round_complete`
    // for round 1, this is the drop-off between the two rounds.
    if (done) {
      track('round_complete', {
        round: 2,
        solved: verdict.solved,
        attempts: nextAttempts.length,
      });
    }
  }, [attempts, dayString, finished, sweep, target]);

  // Desktop: arrows nudge, shift nudges faster, enter commits.
  useEffect(() => {
    const onKeyDown = (event) => {
      const step = event.shiftKey ? INPUT.coarseStep : INPUT.step;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
        event.preventDefault();
        if (!finished) nudge(-step);
      } else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
        event.preventDefault();
        if (!finished) nudge(step);
      } else if (event.key === 'Enter') {
        event.preventDefault();
        if (!finished) commit();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [commit, finished, nudge]);

  // The one worth showing at the end: the best of the three, not whichever
  // happened to be last. It is what the reveal names and what the board draws.
  const closestIndex = attempts.reduce(
    (best, produced, index) =>
      Math.abs(angleError(produced, target)) <
      Math.abs(angleError(attempts[best], target))
        ? index
        : best,
    0
  );
  const closest = attempts[closestIndex];

  return (
    <>
      <Task>
        <Prompt>Make {target}°</Prompt>
        <Hint>
          {finished
            ? solved
              ? 'Made it.'
              : 'Not this time.'
            : `Attempt ${attempts.length + 1} of ${MAX_ATTEMPTS} · within ${TOLERANCE}° counts`}
        </Hint>
      </Task>

      <ConstructBoard
        fixedAngle={fixedAngle}
        sweep={finished ? closest : sweep}
        ghosts={
          finished ? attempts.filter((_, i) => i !== closestIndex) : attempts
        }
        truth={finished ? target : null}
        disabled={finished}
        onSweepChange={setSweep}
      />

      <FeedbackList
        feedback={feedback}
        solved={solved}
        attempts={attempts.length}
      />

      {finished ? (
        <>
          <Reveal data-testid="round2-reveal">
            Your closest guess is <RevealValue>{closest}°</RevealValue>
          </Reveal>
          <Controls>
            <Primary onClick={onFinish} data-testid="round2-done">
              See result
            </Primary>
          </Controls>
        </>
      ) : (
        // Nothing to step the angle with: the ray is turned by hand and
        // judged by eye, which is the whole of the task.
        <Controls>
          <Primary onClick={commit} data-testid="round2-commit">
            Commit
          </Primary>
        </Controls>
      )}
    </>
  );
}
