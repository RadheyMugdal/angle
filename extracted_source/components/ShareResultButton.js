import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import IosShareIcon from '@mui/icons-material/IosShare';
import { buildShareText, shareResult } from '../share';
import { track } from '../analytics';

/**
 * Hands the day's result to the device: the native share sheet where there is
 * one, the clipboard otherwise. Feedback is a quiet line beside the button
 * rather than a toast over the game.
 */

const Wrap = styled.div`
  display: flex;
  flex-direction: ${({ $fullWidth }) => ($fullWidth ? 'column' : 'row')};
  align-items: center;
  justify-content: ${({ $center }) => ($center ? 'center' : 'flex-start')};
  gap: ${({ $fullWidth }) => ($fullWidth ? '8px' : '10px')};
  flex-wrap: wrap;
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 10px;
  font-family: 'Boston-Regular';
  font-size: 1rem;
  color: #ffffff;
  background-color: #df6247;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  :hover {
    background-color: #c9553c;
  }
  svg {
    font-size: 1.15rem;
  }
`;

const Status = styled.span`
  font-size: 0.85rem;
  color: #6b7280;
  @media (prefers-color-scheme: dark) {
    color: #9aa0a8;
  }
`;

const STATUS_TEXT = {
  shared: 'Shared',
  copied: 'Copied to clipboard',
  cancelled: '',
  failed: "Couldn't share — copy it manually",
};

export function ShareResultButton({
  dayString,
  guesses,
  win,
  round2,
  center,
  fullWidth,
}) {
  const [status, setStatus] = useState('');
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleShare = () => {
    // Called straight from the click: `navigator.share` is only permitted
    // while the user gesture is live, so nothing is awaited before it.
    shareResult(buildShareText({ dayString, guesses, win, round2 })).then(
      (result) => {
        clearTimeout(timer.current);
        setStatus(STATUS_TEXT[result] ?? '');
        timer.current = setTimeout(() => setStatus(''), 3000);
        // `outcome` separates a real share from a cancelled sheet, so the
        // number does not flatter itself.
        track('share_result', {
          mode: 'daily',
          outcome: result,
          win: Boolean(win),
          guesses: guesses?.length ?? 0,
          round2_played: Boolean(round2),
        });
      }
    );
  };

  return (
    <Wrap $center={center} $fullWidth={fullWidth}>
      <Button onClick={handleShare} $fullWidth={fullWidth}>
        <IosShareIcon />
        Share result
      </Button>
      {status && <Status role="status">{status}</Status>}
    </Wrap>
  );
}
