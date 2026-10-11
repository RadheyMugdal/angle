import { useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import CheckIcon from '@mui/icons-material/Check';
import { INPUT } from '../../construct/config';

/**
 * The pieces a construction round is made of, shared by the daily's Round 2
 * and the arcade run so both behave identically.
 */

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 0.7rem auto 0;
  max-width: 320px;
  min-height: 2.6rem;
`;

/**
 * The daily's guess row, in the same shape and the same words: what you made,
 * which way to go, how close. Round 1 shows the guess on every row, and
 * without it here a player had no way to tell a clue against what they built.
 */
const Row = styled.div`
  display: grid;
  grid-template-columns: 3.4rem 2.2rem 1fr;
  gap: 4px;
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

const SolvedCell = styled(Cell)`
  background-color: rgba(63, 169, 106, 0.16);
  color: #2f7d4f;
  @media (prefers-color-scheme: dark) {
    background-color: rgba(63, 169, 106, 0.2);
    color: #7ed0a1;
  }
`;

export function FeedbackList({ feedback, solved, attempts }) {
  return (
    <List data-testid="construct-feedback">
      {feedback.map((item, index) => (
        <Row key={index}>
          <Cell>{item.produced}°</Cell>
          <Cell>
            {item.direction === 'wider' ? (
              <ArrowUpwardIcon />
            ) : (
              <ArrowDownwardIcon />
            )}
          </Cell>
          <Cell>{item.label}</Cell>
        </Row>
      ))}
      {solved && (
        <Row>
          <SolvedCell>
            <CheckIcon />
          </SolvedCell>
          <SolvedCell style={{ gridColumn: '2 / span 2' }}>
            Made it in {attempts}
          </SolvedCell>
        </Row>
      )}
    </List>
  );
}

export const Controls = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 0.9rem;
  @media (max-width: 359px) {
    gap: 0.5rem;
  }
`;

export const NudgeButton = styled.button`
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
`;

export const Primary = styled.button`
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

export const Secondary = styled(Primary)`
  color: #df6247;
  background-color: rgba(223, 98, 71, 0.12);
  :hover {
    background-color: rgba(223, 98, 71, 0.2);
  }
`;

export const Quiet = styled.button`
  border: none;
  background: none;
  padding: 0.4rem 0.6rem;
  font-family: 'Boston-Regular';
  font-size: 0.9rem;
  color: #8b93a1;
  cursor: pointer;
  :hover {
    color: #df6247;
    text-decoration: underline;
  }
`;

export const Reveal = styled.div`
  text-align: center;
  margin-top: 0.8rem;
  font-size: 0.95rem;
  color: #6b7280;
  @media (prefers-color-scheme: dark) {
    color: #9aa0a8;
  }
`;

export const RevealValue = styled.span`
  color: #3fa96a;
`;

/** Press and hold to keep nudging, faster the longer it is held. */
export function useHoldRepeat(step) {
  const repeat = useRef({ timer: null, delay: INPUT.hold.startMs });

  const stop = useCallback(() => {
    clearTimeout(repeat.current.timer);
    repeat.current = { timer: null, delay: INPUT.hold.startMs };
  }, []);

  useEffect(() => stop, [stop]);

  const start = useCallback(
    (delta) => {
      step(delta);
      const tick = () => {
        step(delta);
        repeat.current.delay = Math.max(
          INPUT.hold.minMs,
          repeat.current.delay * INPUT.hold.ramp
        );
        repeat.current.timer = setTimeout(tick, repeat.current.delay);
      };
      repeat.current.delay = INPUT.hold.startMs;
      repeat.current.timer = setTimeout(tick, INPUT.hold.delayMs);
    },
    [step]
  );

  const holdProps = (delta) => ({
    onPointerDown: (event) => {
      event.preventDefault();
      start(delta);
    },
    onPointerUp: stop,
    onPointerLeave: stop,
    onPointerCancel: stop,
  });

  return holdProps;
}
