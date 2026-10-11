import styled from 'styled-components';
import CheckIcon from '@mui/icons-material/Check';

/**
 * Two steps, shown from the first second of the day.
 *
 * The point is expectation: if a player can see that the daily is "guess it,
 * then make it" before they finish round one, the hand-off is a step they were
 * already expecting rather than something that appears out of nowhere.
 */

const Steps = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin: 0.5rem 0 0.2rem;
`;

const Step = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.68rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;
  transition:
    background-color 200ms ease,
    color 200ms ease;

  /* 'next' is the invitation: coloured, but not filled in yet. */
  color: ${({ $state }) =>
    $state === 'active' || $state === 'next'
      ? '#df6247'
      : $state === 'done'
        ? '#6b7280'
        : '#b6bcc4'};
  background-color: ${({ $state }) =>
    $state === 'active' ? 'rgba(223, 98, 71, 0.12)' : 'transparent'};

  svg {
    font-size: 0.85rem;
  }

  @media (prefers-color-scheme: dark) {
    color: ${({ $state }) =>
      $state === 'active' || $state === 'next'
        ? '#df6247'
        : $state === 'done'
          ? '#9aa0a8'
          : '#5c626b'};
  }
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const Join = styled.span`
  width: 14px;
  height: 1px;
  background-color: #d8dce2;
  @media (prefers-color-scheme: dark) {
    background-color: #33373d;
  }
`;

export function RoundSteps({ round1Done, inRound2 }) {
  const first = round1Done ? 'done' : 'active';
  const second = inRound2 ? 'active' : round1Done ? 'next' : 'todo';

  return (
    <Steps data-testid="round-steps" aria-label="Daily progress">
      <Step $state={first}>{round1Done && <CheckIcon />}1 · Guess</Step>
      <Join />
      <Step $state={second}>2 · Make</Step>
    </Steps>
  );
}
