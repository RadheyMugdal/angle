import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import CheckIcon from '@mui/icons-material/Check';
import IosShareIcon from '@mui/icons-material/IosShare';
import { PageShell } from '../PageShell';
import { ConstructBoard } from './ConstructBoard';
import { INPUT, RUN_LENGTH, TOLERANCE } from '../../construct/config';
import {
  buildConstructShareText,
  maxStars,
  meanFirstAttemptError,
  startingSweep,
} from '../../construct/logic';
import { useConstructRun } from '../../construct/useConstructRun';
import { shareResult } from '../../share';
import { track } from '../../analytics';

/**
 * `/construct` — make the angle you are given.
 *
 * There is no numeric readout of what the player has built, anywhere. The
 * target is a number, the construction is visual, and the translation between
 * the two is the whole exercise.
 *
 * `?angles=n` shortens the run — the daily's result modal uses `?angles=1` to
 * offer a single construction rather than a three-minute commitment at the
 * moment a thirty-second ritual just ended.
 */

const Header = styled.div`
  text-align: center;
  margin: 0.25rem 0 0.6rem;
`;

const Progress = styled.div`
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #8b93a1;
`;

const Task = styled.h1`
  margin: 2px 0 0;
  font-size: 2rem;
  line-height: 1.15;
  font-family: 'Boston-Regular';
  font-weight: normal;
  color: #df6247;
`;

const Hint = styled.div`
  font-size: 0.85rem;
  color: #6b7280;
  @media (prefers-color-scheme: dark) {
    color: #9aa0a8;
  }
`;

const Feedback = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 0.7rem auto 0;
  max-width: 320px;
  min-height: 2.6rem;
`;

/** The daily's guess row, in the same shape and the same words. */
const FeedbackRow = styled.div`
  display: grid;
  grid-template-columns: 2.2rem 1fr;
  gap: 4px;
  align-items: stretch;
  font-size: 0.9rem;
`;

const Cell = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.3rem;
  border-radius: 3px;
  background-color: #dddddd;
  svg {
    font-size: 1.05rem;
  }
  @media (prefers-color-scheme: dark) {
    background-color: #1f2023;
    color: #dadada;
  }
`;

const Solved = styled(Cell)`
  background-color: rgba(63, 169, 106, 0.16);
  color: #2f7d4f;
  @media (prefers-color-scheme: dark) {
    background-color: rgba(63, 169, 106, 0.2);
    color: #7ed0a1;
  }
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 0.9rem;
  @media (max-width: 359px) {
    gap: 0.5rem;
  }
`;

const NudgeButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 48px;
  flex: none;
  border: 1px solid rgba(139, 147, 161, 0.5);
  border-radius: 12px;
  background: none;
  font-family: 'Boston-Regular';
  font-size: 1.3rem;
  color: #df6247;
  cursor: pointer;
  touch-action: manipulation;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  :hover {
    border-color: #df6247;
    background-color: rgba(223, 98, 71, 0.08);
  }
  :disabled {
    color: #c3c7cd;
    border-color: rgba(139, 147, 161, 0.25);
    cursor: default;
    background: none;
  }
`;

const Primary = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-width: 140px;
  height: 48px;
  padding: 0 1.2rem;
  border: none;
  border-radius: 12px;
  font-family: 'Boston-Regular';
  font-size: 1.05rem;
  color: #ffffff;
  background-color: #df6247;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  :hover {
    background-color: #c9553c;
  }
`;

const Reveal = styled.div`
  text-align: center;
  margin-top: 0.8rem;
  font-size: 0.95rem;
  color: #6b7280;
  @media (prefers-color-scheme: dark) {
    color: #9aa0a8;
  }
`;

const RevealValue = styled.span`
  color: #3fa96a;
`;

const KeyboardHint = styled.div`
  margin-top: 0.8rem;
  text-align: center;
  font-size: 0.75rem;
  color: #b6bcc4;
  @media (max-width: 767px) {
    display: none;
  }
`;

const Results = styled.div`
  text-align: center;
  padding: 0.5rem 0 1rem;
`;

const Score = styled.div`
  font-size: 2.4rem;
  line-height: 1.1;
  font-family: 'Boston-Regular';
  color: #df6247;
`;

const Squares = styled.div`
  display: flex;
  justify-content: center;
  gap: 5px;
  margin: 0.9rem 0;
`;

const Square = styled.span`
  width: 20px;
  height: 20px;
  border-radius: 5px;
  background-color: ${({ $attempt, $solved }) =>
    !$solved
      ? '#dfe1e5'
      : $attempt === 1
        ? '#3fa96a'
        : $attempt === 2
          ? '#e8b53f'
          : '#df6247'};
  @media (prefers-color-scheme: dark) {
    background-color: ${({ $attempt, $solved }) =>
      !$solved
        ? '#33363b'
        : $attempt === 1
          ? '#3fa96a'
          : $attempt === 2
            ? '#e8b53f'
            : '#df6247'};
  }
`;

const Stat = styled.div`
  font-size: 0.95rem;
  color: #6b7280;
  @media (prefers-color-scheme: dark) {
    color: #9aa0a8;
  }
`;

const ResultActions = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 1.2rem;
  flex-wrap: wrap;
`;

const Secondary = styled(Primary)`
  color: #df6247;
  background-color: rgba(223, 98, 71, 0.12);
  :hover {
    background-color: rgba(223, 98, 71, 0.2);
  }
`;

function readRunLength() {
  try {
    const raw = new URLSearchParams(window.location.search).get('angles');
    const value = parseInt(raw, 10);
    if (Number.isFinite(value)) return Math.min(Math.max(value, 1), 20);
  } catch (e) {}
  return RUN_LENGTH;
}

export function ConstructPage() {
  const length = useMemo(readRunLength, []);
  const run = useConstructRun(length);
  const [sweep, setSweep] = useState(0);
  const [status, setStatus] = useState('');
  const repeat = useRef({ timer: null, delay: INPUT.hold.startMs });
  const sweepRef = useRef(0);
  sweepRef.current = sweep;

  // Every attempt starts somewhere fresh, so attempt two is another act of
  // construction rather than nudging the ghost of the first — and so that
  // counting taps from a known origin cannot stand in for judging by eye.
  useEffect(() => {
    if (run.target == null) return;
    const start = startingSweep(run.target);
    setSweep(start);
    sweepRef.current = start;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run.index, run.attemptIndex]);

  const aiming = run.phase === 'aiming';

  // Started runs are the denominator: completion rate is meaningless without
  // knowing how many people began.
  useEffect(() => {
    track('construct_start', { length });
  }, [length]);

  useEffect(() => {
    if (run.phase !== 'done') return;
    const meanError = meanFirstAttemptError(run.results);
    track('construct_complete', {
      length: run.length,
      stars: run.stars,
      solved: run.results.filter((result) => result.solved).length,
      mean_first_error:
        meanError == null ? null : Number(meanError.toFixed(1)),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run.phase]);

  const nudge = useCallback((delta) => {
    setSweep((value) => {
      const next = (((value + delta) % 360) + 360) % 360;
      sweepRef.current = next;
      return next;
    });
  }, []);

  const stopRepeat = useCallback(() => {
    clearTimeout(repeat.current.timer);
    repeat.current = { timer: null, delay: INPUT.hold.startMs };
  }, []);

  useEffect(() => stopRepeat, [stopRepeat]);

  const startRepeat = useCallback(
    (delta) => {
      nudge(delta);
      const tick = () => {
        nudge(delta);
        repeat.current.delay = Math.max(
          INPUT.hold.minMs,
          repeat.current.delay * INPUT.hold.ramp
        );
        repeat.current.timer = setTimeout(tick, repeat.current.delay);
      };
      repeat.current.delay = INPUT.hold.startMs;
      repeat.current.timer = setTimeout(tick, INPUT.hold.delayMs);
    },
    [nudge]
  );

  const commit = useCallback(() => {
    run.commit(Math.round(sweepRef.current));
  }, [run]);

  // Desktop deserves the keyboard: arrows nudge, shift nudges faster, enter commits.
  useEffect(() => {
    const onKeyDown = (event) => {
      if (run.phase === 'done') return;
      const step = event.shiftKey ? INPUT.coarseStep : INPUT.step;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
        event.preventDefault();
        if (aiming) nudge(-step);
      } else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
        event.preventDefault();
        if (aiming) nudge(step);
      } else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (aiming) commit();
        else run.next();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [aiming, commit, nudge, run]);

  const handleShare = () => {
    shareResult(buildConstructShareText(run.results, run.length)).then(
      (outcome) => {
        setStatus(
          outcome === 'shared'
            ? 'Shared'
            : outcome === 'copied'
              ? 'Copied to clipboard'
              : ''
        );
        setTimeout(() => setStatus(''), 3000);
        track('share_result', {
          mode: 'construct',
          outcome,
          length: run.length,
          stars: run.stars,
        });
      }
    );
  };

  if (run.phase === 'done') {
    const meanError = meanFirstAttemptError(run.results);
    return (
      <PageShell>
        <Results data-testid="construct-results">
          <Progress>Run complete</Progress>
          <Score>
            {run.stars}/{maxStars(run.length)} ⭐
          </Score>
          <Squares>
            {run.results.map((result, i) => (
              <Square
                key={i}
                $attempt={result.attempts}
                $solved={result.solved}
              />
            ))}
          </Squares>
          {meanError != null && (
            <Stat>First-attempt error: {meanError.toFixed(1)}°</Stat>
          )}
          <ResultActions>
            <Primary onClick={handleShare}>
              <IosShareIcon />
              Share
            </Primary>
            <Secondary onClick={run.restart}>Play again</Secondary>
          </ResultActions>
          {status && <Stat role="status">{status}</Stat>}
        </Results>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Header>
        <Progress>
          Angle {run.index + 1} of {run.length} · {run.stars} ⭐
        </Progress>
        <Task data-testid="construct-target">Make {run.target}°</Task>
        <Hint>
          {aiming
            ? `Turn the ray, then commit. Within ${TOLERANCE}° counts.`
            : run.solvedThisAngle
              ? 'Made it.'
              : 'Not this time.'}
        </Hint>
      </Header>

      <ConstructBoard
        fixedAngle={run.fixedAngle}
        sweep={aiming ? sweep : (run.lastProduced ?? sweep)}
        ghosts={aiming ? run.attempts : run.attempts.slice(0, -1)}
        truth={aiming ? null : run.target}
        disabled={!aiming}
        onSweepChange={setSweep}
      />

      <Feedback data-testid="construct-feedback">
        {run.feedback.map((item, i) => (
          <FeedbackRow key={i}>
            <Cell>
              {item.direction === 'wider' ? (
                <ArrowUpwardIcon />
              ) : (
                <ArrowDownwardIcon />
              )}
            </Cell>
            <Cell>{item.label}</Cell>
          </FeedbackRow>
        ))}
        {run.phase === 'revealed' && run.solvedThisAngle && (
          <FeedbackRow>
            <Solved>
              <CheckIcon />
            </Solved>
            <Solved>Solved in {run.attempts.length}</Solved>
          </FeedbackRow>
        )}
      </Feedback>

      {aiming ? (
        <>
          <Controls>
            <NudgeButton
              type="button"
              aria-label="One degree narrower"
              data-testid="nudge-down"
              onPointerDown={(event) => {
                event.preventDefault();
                startRepeat(-INPUT.step);
              }}
              onPointerUp={stopRepeat}
              onPointerLeave={stopRepeat}
              onPointerCancel={stopRepeat}
            >
              −
            </NudgeButton>
            <Primary onClick={commit} data-testid="construct-commit">
              Commit
            </Primary>
            <NudgeButton
              type="button"
              aria-label="One degree wider"
              data-testid="nudge-up"
              onPointerDown={(event) => {
                event.preventDefault();
                startRepeat(INPUT.step);
              }}
              onPointerUp={stopRepeat}
              onPointerLeave={stopRepeat}
              onPointerCancel={stopRepeat}
            >
              +
            </NudgeButton>
          </Controls>
          <KeyboardHint>
            Arrow keys nudge · hold shift for {INPUT.coarseStep}° · enter
            commits
          </KeyboardHint>
        </>
      ) : (
        <>
          <Reveal data-testid="construct-reveal">
            You made {run.lastProduced}° · it was{' '}
            <RevealValue>{run.target}°</RevealValue>
          </Reveal>
          <Controls>
            <Primary onClick={run.next} data-testid="construct-next">
              {run.index + 1 >= run.length ? 'See results' : 'Next angle'}
            </Primary>
          </Controls>
        </>
      )}
    </PageShell>
  );
}
