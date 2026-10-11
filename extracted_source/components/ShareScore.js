import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import IosShareIcon from '@mui/icons-material/IosShare';
import LinkIcon from '@mui/icons-material/Link';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import XIcon from '@mui/icons-material/X';
import { buildShareText } from '../share';
import { track } from '../analytics';

/**
 * The ways out of a finished round: the score as text, the score somewhere in
 * particular, or the link on its own.
 *
 * Icons rather than labels because there are five of them and each one is a
 * place people already recognise. What each does is in its `aria-label` and
 * its title, and the line underneath says what just happened, since copying
 * gives no other sign that it worked.
 */

const SITE = 'https://www.angle.wtf';
/** Only the link carries campaign tags: it is the one with nothing around it. */
const LINK = `${SITE}/?utm_source=share&utm_medium=link`;

const Wrap = styled.div`
  margin-top: 1.1rem;
`;

const Label = styled.div`
  font-family: 'Boston-Regular';
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #8b93a1;
`;

const Row = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 0.6rem;
`;

const Action = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  padding: 0;
  border: 1px solid rgba(139, 147, 161, 0.35);
  border-radius: 12px;
  background: none;
  color: #6b7280;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition:
    color 140ms ease,
    border-color 140ms ease,
    background-color 140ms ease;
  svg {
    font-size: 1.25rem;
  }
  :hover {
    color: #df6247;
    border-color: #df6247;
    background-color: rgba(223, 98, 71, 0.08);
  }
  @media (prefers-color-scheme: dark) {
    color: #b9bec6;
  }
`;

const Status = styled.div`
  min-height: 1.1rem;
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: #8b93a1;
`;

/** Clipboard, with the old-fashioned fallback for browsers that refuse it. */
function copy(text) {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    return navigator.clipboard.writeText(text).then(
      () => true,
      () => copyWithTextarea(text)
    );
  }
  return Promise.resolve(copyWithTextarea(text));
}

function copyWithTextarea(text) {
  try {
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.appendChild(field);
    field.select();
    const done = document.execCommand('copy');
    document.body.removeChild(field);
    return done;
  } catch (e) {
    return false;
  }
}

const openWindow = (url) => window.open(url, '_blank', 'noopener,noreferrer');

export function ShareScore({ dayString, guesses, win, round2 }) {
  const [status, setStatus] = useState('');
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const say = (message) => {
    setStatus(message);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus(''), 2600);
  };

  const text = () => buildShareText({ dayString, guesses, win, round2 });

  const actions = [
    {
      key: 'copy',
      title: 'Copy your score',
      icon: <ContentCopyIcon />,
      run: () => copy(text()).then((ok) => say(ok ? 'Score copied' : 'Could not copy')),
    },
    {
      key: 'x',
      title: 'Post on X',
      icon: <XIcon />,
      run: () =>
        openWindow(`https://x.com/intent/post?text=${encodeURIComponent(text())}`),
    },
    {
      key: 'whatsapp',
      title: 'Send on WhatsApp',
      icon: <WhatsAppIcon />,
      run: () => openWindow(`https://wa.me/?text=${encodeURIComponent(text())}`),
    },
    {
      key: 'link',
      title: 'Copy a link to the game',
      icon: <LinkIcon />,
      run: () => copy(LINK).then((ok) => say(ok ? 'Link copied' : 'Could not copy')),
    },
    {
      key: 'share',
      title: "Share with your device's share sheet",
      icon: <IosShareIcon />,
      // Always here, whatever the device. Where there is a share sheet it
      // opens — called straight from the click, since the sheet is only
      // allowed while the gesture is still live, so nothing may be awaited
      // first. Where there is not, the score goes to the clipboard instead:
      // the button says what it will do, so it has to do something.
      run: () => {
        if (typeof navigator !== 'undefined' && navigator.share) {
          return navigator.share({ text: text() }).catch((error) => {
            if (!error || error.name !== 'AbortError') say('Could not share');
          });
        }
        return copy(text()).then((ok) =>
          say(ok ? 'No share sheet here — score copied' : 'Could not share')
        );
      },
    },
  ];

  return (
    <Wrap>
      <Label>Share your score</Label>
      <Row>
        {actions.map((action) => (
          <Action
            key={action.key}
            type="button"
            title={action.title}
            aria-label={action.title}
            data-testid={`share-${action.key}`}
            onClick={() => {
              action.run();
              track('share_score', { via: action.key });
            }}
          >
            {action.icon}
          </Action>
        ))}
      </Row>
      <Status role="status">{status}</Status>
    </Wrap>
  );
}
