import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Attribution } from './Attribution';
import { HowToModal } from './HowToModal';
import { NavBar } from './Nav';
import useUser from '../hooks/useUser';
import { checkForConsent } from '../ads';
import { railPlacement, railSpacing } from '../adLayout';

/**
 * Chrome shared by the pages outside the game itself: the nav bar, a back
 * link, and a column that lines up with the bar above it.
 *
 * `flex: 1 0 auto` rather than a fixed height — the page grows with its
 * content and the document scrolls. See index.css.
 */

const Page = styled.div`
  ${railSpacing}
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1 0 auto;
  width: 100%;
  @media (prefers-color-scheme: dark) {
    background-color: #121212;
    color: #fff;
  }
`;

const Inner = styled.div`
  width: 100%;
  max-width: 520px;
  /* The adhesion unit is pinned to the bottom of the viewport, so leave it
     room rather than letting it sit over the page's own controls. */
  padding: 0 12px ${({ $adhesion }) => ($adhesion ? '7rem' : '2.5rem')};
  text-align: left;
`;

/** Same rail as the daily — see adLayout.js. */
const SidebarAd = styled.div`
  ${railPlacement}
`;

const BackLink = styled.a`
  display: inline-block;
  margin: 0.9rem 0 0.25rem;
  color: #df6247;
  text-decoration: none;
  :hover {
    text-decoration: underline;
  }
`;

export function PageShell({ children }) {
  const { user } = useUser();
  const [howToSignal, setHowToSignal] = useState(0);
  // The ad script is loaded by useUser on every page; without these containers
  // the secondary pages ran the engine with nowhere to put anything.
  const showAds = !user?.premiumGames?.includes('angle');

  useEffect(() => {
    checkForConsent();
  }, []);

  return (
    <>
      {showAds && (
        <>
          <div id="adngin-top_banner-0"></div>
          <div id="adngin-video-0"></div>
          <div id="adngin-adhesion-0"></div>
        </>
      )}
      <Page>
        <NavBar user={user} onHowTo={() => setHowToSignal((n) => n + 1)} />
        <HowToModal hideTrigger openSignal={howToSignal} />
        <Inner $adhesion={showAds}>
          <BackLink href="/">&#8592; Back</BackLink>
          {children}
          <Attribution />
        </Inner>
        {showAds && (
          <SidebarAd>
            <div id="adngin-sidebar_left-0"></div>
          </SidebarAd>
        )}
      </Page>
    </>
  );
}
