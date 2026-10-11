import { useEffect, useMemo, useState } from 'react';
import { GEOMETRY } from './config';

/**
 * Pixel diameter of the dial: a fixed share of the window width, decided once
 * and only revisited when the window itself changes width.
 *
 * It deliberately does not measure its own container. Container width moves
 * for reasons that have nothing to do with the dial — a scrollbar appearing,
 * the menu's scroll lock padding the body, a guess row being added — and
 * every one of those made the dial resize under the finger. Nor does it
 * follow window *height*, which on mobile changes constantly as the browser
 * chrome collapses during a scroll.
 *
 * So: width decides the size, and height only ever caps it on a short
 * viewport (a phone in landscape), sampled at the same moments as the width.
 */

function readViewport() {
  if (typeof window === 'undefined') return { width: 360, height: 640 };
  return {
    width: window.innerWidth || 360,
    height: window.innerHeight || 640,
  };
}

function computeSize({ width, height }) {
  return Math.max(
    GEOMETRY.minSizePx,
    Math.round(
      Math.min(
        width * GEOMETRY.widthRatio,
        height * GEOMETRY.maxViewportHeight,
        GEOMETRY.maxSizePx
      )
    )
  );
}

const isLandscape = ({ width, height }) => width > height;

export function useDialSize() {
  // Resolved before the first paint, so the dial is never drawn at one size
  // and corrected to another a frame later.
  const [viewport, setViewport] = useState(readViewport);

  useEffect(() => {
    const update = () => {
      const next = readViewport();
      setViewport((current) => {
        // Height on its own is noise: ignore it unless the window actually
        // turned, which is the one case where the cap needs recalculating.
        const turned = isLandscape(current) !== isLandscape(next);
        if (next.width === current.width && !turned) return current;
        return next;
      });
    };

    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);

  return useMemo(() => computeSize(viewport), [viewport]);
}
