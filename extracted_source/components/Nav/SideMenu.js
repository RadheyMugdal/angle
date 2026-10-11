import { useEffect, useRef } from 'react';
import styled from 'styled-components';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CloseIcon from '@mui/icons-material/Close';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import { Attribution } from '../Attribution';
import { SocialLinks } from '../SocialLinks';
import {
  ACCOUNT_URL,
  CONSTRUCT_URL,
  FEEDBACK_URL,
  MORE_GAMES_URL,
  PRIVACY_URL,
  SETTINGS_URL,
  STATS_URL,
} from './config';

/**
 * The full-height menu that slides in from the right, in the same shape the
 * other Teuteuf games use: an account row, then short labelled sections.
 */

const PANEL_WIDTH = '300px';
const TRANSITION = '240ms cubic-bezier(0.4, 0, 0.2, 1)';

const Scrim = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9998;
  background-color: rgba(0, 0, 0, 0.45);
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  pointer-events: ${({ $open }) => ($open ? 'auto' : 'none')};
  transition: opacity ${TRANSITION};
  touch-action: none;
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const Panel = styled.aside`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  width: min(${PANEL_WIDTH}, 82vw);
  display: flex;
  flex-direction: column;
  /* The page centres its text; the menu reads as a list, so undo that. */
  text-align: left;
  background-color: #ffffff;
  box-shadow: -8px 0 24px rgba(0, 0, 0, 0.12);
  transform: translateX(${({ $open }) => ($open ? '0' : '100%')});
  visibility: ${({ $open }) => ($open ? 'visible' : 'hidden')};
  transition:
    transform ${TRANSITION},
    visibility 0s linear ${({ $open }) => ($open ? '0s' : '240ms')};
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  @media (prefers-color-scheme: dark) {
    background-color: #1b1c1f;
    box-shadow: -8px 0 24px rgba(0, 0, 0, 0.5);
  }
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 2px solid #e5e7eb;
  @media (prefers-color-scheme: dark) {
    border-bottom-color: #2b2d31;
  }
`;

const AccountLink = styled.a`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  color: #df6247;
  font-size: 1rem;
  text-decoration: none;
  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const Avatar = styled.img`
  width: 26px;
  height: 26px;
  border-radius: 100%;
`;

const IconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  flex: none;
  padding: 0;
  border: none;
  border-radius: 999px;
  background: none;
  cursor: pointer;
  color: #8b93a1;
  -webkit-tap-highlight-color: transparent;
  :hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
  @media (prefers-color-scheme: dark) {
    :hover {
      background-color: rgba(255, 255, 255, 0.08);
    }
  }
`;

const Scroller = styled.nav`
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 8px 0 16px;
  /* Column layout so the footer block can sit at the bottom of a short menu
     and still flow with the content when the list gets long. */
  display: flex;
  flex-direction: column;
`;

const MenuFooter = styled.div`
  margin-top: auto;
  padding-top: 8px;
`;

const SectionLabel = styled.div`
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #9aa0a8;
  padding: 14px 16px 6px;
  @media (prefers-color-scheme: dark) {
    color: #797f88;
  }
`;

const ItemRoot = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 8px 16px;
  border: none;
  background: none;
  cursor: pointer;
  text-align: left;
  text-decoration: none;
  font-family: 'Boston-Regular';
  font-size: 1rem;
  color: #24272c;
  -webkit-tap-highlight-color: transparent;
  :hover {
    background-color: rgba(223, 98, 71, 0.08);
  }
  @media (prefers-color-scheme: dark) {
    color: #dadada;
    :hover {
      background-color: rgba(223, 98, 71, 0.14);
    }
  }
`;

const IconTile = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  flex: none;
  border-radius: 9px;
  background-color: #f2f3f5;
  color: #4b5058;
  svg {
    font-size: 1.25rem;
  }
  @media (prefers-color-scheme: dark) {
    background-color: #26282d;
    color: #b9bec6;
  }
`;

const ItemLabel = styled.span`
  flex: 1;
  min-width: 0;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #eceef1;
  margin: 12px 16px 0;
  @media (prefers-color-scheme: dark) {
    border-top-color: #2b2d31;
  }
`;

/** Small, quiet, bottom of the panel: legal links, not features. */
const FooterLinks = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding: 14px 16px 4px;
  font-size: 0.75rem;
  color: #b6bcc4;
  a,
  button {
    padding: 0;
    border: none;
    background: none;
    font-family: inherit;
    font-size: inherit;
    color: #9aa0a8;
    text-decoration: none;
    cursor: pointer;
    :hover {
      text-decoration: underline;
    }
  }
  @media (prefers-color-scheme: dark) {
    color: #5c626b;
    a,
    button {
      color: #797f88;
    }
  }
`;

function MenuItem({ icon, label, ...rest }) {
  return (
    <ItemRoot {...rest}>
      <IconTile>{icon}</IconTile>
      <ItemLabel>{label}</ItemLabel>
    </ItemRoot>
  );
}

export function SideMenu({ open, onClose, user, onHowTo }) {
  const closeRef = useRef(null);
  // Kept in a ref so the lock below depends on `open` alone: re-running it on
  // an unrelated render would re-capture the scroll position mid-lock, when it
  // reads as 0, and closing would then jump the page to the top.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Escape closes, and the close button takes focus so the panel is reachable
  // from the keyboard as soon as it opens. The page behind is held still while
  // the menu is open — padding stands in for the scrollbar so nothing shifts.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onCloseRef.current();
    };
    document.addEventListener('keydown', onKeyDown);
    const focusTimer = setTimeout(() => closeRef.current?.focus(), 60);

    // Hold the page still by pinning the body at its current offset. Hiding
    // overflow instead — on body or on html — makes the page unscrollable, and
    // an unscrollable scroller snaps its position back to the top.
    const { body } = document;
    const scrollY = window.scrollY;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    const previous = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      padding: body.style.paddingRight,
    };
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      clearTimeout(focusTimer);
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.left = previous.left;
      body.style.right = previous.right;
      body.style.paddingRight = previous.padding;
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  const runAndClose = (action) => () => {
    onClose();
    action();
  };

  const handleConsent = runAndClose(() => {
    if (window.adconsent) window.adconsent('showGUI');
  });

  return (
    <>
      <Scrim $open={open} onClick={onClose} aria-hidden="true" />
      <Panel
        $open={open}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        aria-hidden={!open}
        data-testid="side-menu"
      >
        <Header>
          <AccountLink href={ACCOUNT_URL}>
            {user?.photoURL ? (
              <Avatar src={user.photoURL} alt="" />
            ) : (
              <AccountCircleIcon />
            )}
            <span>{user ? user.firstName || 'Your account' : 'Sign in'}</span>
          </AccountLink>
          <IconButton ref={closeRef} onClick={onClose} aria-label="Close menu">
            <CloseIcon />
          </IconButton>
        </Header>

        <Scroller>
          <SectionLabel>Play</SectionLabel>
          <MenuItem
            as="a"
            href={CONSTRUCT_URL}
            icon={<ArchitectureIcon />}
            label="Construct"
          />
          <MenuItem
            as="a"
            href={MORE_GAMES_URL}
            icon={<SportsEsportsIcon />}
            label="More games"
          />

          <SectionLabel>Game</SectionLabel>
          <MenuItem
            onClick={runAndClose(onHowTo)}
            icon={<HelpOutlineIcon />}
            label="How to play"
          />
          <MenuItem
            as="a"
            href={STATS_URL}
            icon={<LeaderboardIcon />}
            label="Statistics"
          />
          <MenuItem
            as="a"
            href={SETTINGS_URL}
            icon={<SettingsOutlinedIcon />}
            label="Settings"
          />
          <MenuItem
            as="a"
            href={FEEDBACK_URL}
            target="_blank"
            rel="noreferrer"
            icon={<ChatBubbleOutlineIcon />}
            label="Feedback"
          />

          <MenuFooter>
            <Divider />
            <Attribution align="left" />
            <SocialLinks />
            {/* Available, but out of the way — nobody opens a menu for these. */}
            <FooterLinks>
              <a href={PRIVACY_URL}>Privacy policy</a>
              <span aria-hidden="true">·</span>
              <button type="button" onClick={handleConsent}>
                Manage consent
              </button>
            </FooterLinks>
          </MenuFooter>
        </Scroller>
      </Panel>
    </>
  );
}
