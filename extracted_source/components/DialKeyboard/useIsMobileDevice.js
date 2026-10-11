import { useEffect, useState } from 'react';
import { BEHAVIOUR } from './config';

/**
 * True on phone-ish devices (coarse pointer + narrow screen).
 *
 * `?keypad=1` / `?keypad=0` in the URL forces the answer, which is the easy
 * way to look at the dial keyboard on a desktop browser.
 */
function readOverride() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = new URLSearchParams(window.location.search).get(
      BEHAVIOUR.overrideQueryParam
    );
    if (raw === null) return null;
    return raw !== '0' && raw !== 'false';
  } catch (e) {
    return null;
  }
}

function detect() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  const override = readOverride();
  if (override !== null) return override;

  const coarse = window.matchMedia(BEHAVIOUR.pointerQuery).matches;
  const shortSide = Math.min(window.innerWidth || 0, window.innerHeight || 0);
  return coarse && shortSide > 0 && shortSide <= BEHAVIOUR.maxShortSidePx;
}

export function useIsMobileDevice() {
  const [isMobile, setIsMobile] = useState(detect);

  useEffect(() => {
    if (readOverride() !== null) return;
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const update = () => setIsMobile(detect());
    const query = window.matchMedia(BEHAVIOUR.pointerQuery);

    // addEventListener on MediaQueryList is unsupported on older iOS Safari.
    if (query.addEventListener) query.addEventListener('change', update);
    else query.addListener(update);
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    update();

    return () => {
      if (query.removeEventListener)
        query.removeEventListener('change', update);
      else query.removeListener(update);
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);

  return isMobile;
}
