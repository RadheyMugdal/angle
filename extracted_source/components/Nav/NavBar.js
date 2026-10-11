import { useState } from 'react';
import styled from 'styled-components';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import MenuIcon from '@mui/icons-material/Menu';
import { AccountButton } from '../AccountPage';
import { SideMenu } from './SideMenu';
import { STATS_URL } from './config';

/**
 * The header shared in spirit with Worldle, Travle and GeoGrid: account on the
 * left, the wordmark in the middle, stats and the menu on the right, sitting
 * on a thin rule. Same bar on phone, tablet and desktop — only the sizes move.
 */

const Bar = styled.header`
  width: 100%;
  flex: none;
  border-bottom: 2px solid #e5e7eb;
  @media (prefers-color-scheme: dark) {
    border-bottom-color: #2b2d31;
  }
`;

const Row = styled.div`
  max-width: 520px;
  margin: 0 auto;
  padding: 0 6px;
  height: 48px;
  display: flex;
  align-items: center;
  gap: 4px;
  @media (min-width: 768px) {
    height: 56px;
  }
`;

/** Equal-width sides keep the wordmark optically centred. */
const Side = styled.div`
  flex: 1 0 0;
  display: flex;
  align-items: center;
  gap: 2px;
  justify-content: ${({ $align }) => $align};
`;

const Brand = styled.a`
  display: flex;
  align-items: center;
  gap: 7px;
  text-decoration: none;
  flex: none;
`;

const BrandLogo = styled.img`
  height: 1.7rem;
  @media (min-width: 768px) {
    height: 1.9rem;
  }
`;

const BrandText = styled.span`
  font-size: 1.7rem;
  line-height: 1;
  font-family: 'Boston-Regular';
  color: #df6247;
  @media (min-width: 768px) {
    font-size: 1.9rem;
  }
`;

const IconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex: none;
  padding: 0;
  border: none;
  border-radius: 999px;
  background: none;
  cursor: pointer;
  color: #df6247;
  -webkit-tap-highlight-color: transparent;
  svg {
    font-size: 1.6rem;
  }
  :hover {
    background-color: rgba(223, 98, 71, 0.1);
  }
`;

/** The account link is an <a> from AccountPage; give it the same footprint. */
const AccountSlot = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  :hover {
    background-color: rgba(223, 98, 71, 0.1);
  }
`;

export function NavBar({ user, onHowTo }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <Bar>
      <Row>
        <Side $align="flex-start">
          <AccountSlot>
            <AccountButton user={user} />
          </AccountSlot>
        </Side>

        <Brand href="/" aria-label="Angle">
          <BrandLogo src="/images/angle.svg" alt="" />
          <BrandText>ANGLE</BrandText>
        </Brand>

        <Side $align="flex-end">
          <IconButton as="a" href={STATS_URL} aria-label="Statistics">
            <LeaderboardIcon />
          </IconButton>
          <IconButton
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
          >
            <MenuIcon />
          </IconButton>
        </Side>
      </Row>

      <SideMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        user={user}
        onHowTo={onHowTo}
      />
    </Bar>
  );
}
