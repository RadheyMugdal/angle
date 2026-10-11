import { useCallback, useMemo, useState } from 'react';
import { MAX_ATTEMPTS, RUN_LENGTH } from './config';
import {
  angleError,
  generateTargets,
  judge,
  randomFixedAngle,
  starsForAttempt,
} from './logic';

/**
 * The run: a fixed list of targets, three attempts each, and what the player
 * has been told so far.
 *
 * Phases per angle: 'aiming' -> 'revealed'. The reveal is its own phase rather
 * than a flash, because seeing the true angle land over your own attempts is
 * where the learning happens.
 */
export function useConstructRun(length = RUN_LENGTH) {
  const [seed, setSeed] = useState(0);

  const angles = useMemo(() => {
    const targets = generateTargets(length);
    return targets.map((target) => ({
      target,
      fixedAngle: randomFixedAngle(),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [length, seed]);

  const [index, setIndex] = useState(0);
  const [attempts, setAttempts] = useState([]); // this angle's produced values
  const [feedback, setFeedback] = useState([]); // one per missed attempt
  const [phase, setPhase] = useState('aiming'); // 'aiming' | 'revealed' | 'done'
  const [results, setResults] = useState([]);

  const current = angles[index];
  const attemptIndex = attempts.length;

  const commit = useCallback(
    (produced) => {
      if (phase !== 'aiming' || !current) return;

      const verdict = judge(produced, current.target);
      // The credited angle, so the ghosts and the reveal cannot quote a
      // different number from the verdict.
      const nextAttempts = [...attempts, verdict.produced];
      setAttempts(nextAttempts);

      const finish = (solved) =>
        setResults((all) => [
          ...all,
          {
            target: current.target,
            solved,
            attempts: nextAttempts.length,
            stars: solved ? starsForAttempt(nextAttempts.length - 1) : 0,
            // Always the first attempt's error: that is the one that tracks
            // whether the player is actually getting better. Measured the same
            // way the verdict is — see judge().
            firstError: Math.abs(angleError(nextAttempts[0], current.target)),
          },
        ]);

      if (verdict.solved) {
        finish(true);
        setPhase('revealed');
        return;
      }

      setFeedback((all) => [...all, verdict]);

      if (nextAttempts.length >= MAX_ATTEMPTS) {
        finish(false);
        setPhase('revealed');
      }
    },
    [attempts, current, phase]
  );

  const next = useCallback(() => {
    setAttempts([]);
    setFeedback([]);
    if (index + 1 >= angles.length) {
      setPhase('done');
      return;
    }
    setIndex((value) => value + 1);
    setPhase('aiming');
  }, [angles.length, index]);

  const restart = useCallback(() => {
    setSeed((value) => value + 1);
    setIndex(0);
    setAttempts([]);
    setFeedback([]);
    setResults([]);
    setPhase('aiming');
  }, []);

  const stars = results.reduce((total, result) => total + result.stars, 0);
  const solvedThisAngle =
    phase === 'revealed' && results[index] ? results[index].solved : false;

  return {
    length: angles.length,
    index,
    target: current ? current.target : null,
    fixedAngle: current ? current.fixedAngle : 0,
    attemptIndex,
    attempts,
    feedback,
    phase,
    results,
    stars,
    solvedThisAngle,
    lastProduced: attempts[attempts.length - 1] ?? null,
    commit,
    next,
    restart,
  };
}
