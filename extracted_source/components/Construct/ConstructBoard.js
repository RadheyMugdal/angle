import { useCallback, useRef } from 'react';
import styled from 'styled-components';
import { BOARD, INPUT } from '../../construct/config';

/**
 * The play surface: a fixed ray, the ray the player turns, their earlier
 * attempts as ghosts, and — once the angle is over — the true angle laid on
 * top of them.
 *
 * Drawn in SVG rather than rotated DOM, deliberately. A rotated element still
 * contributes its bounding box to the page's scrollable area, which is how the
 * dial keyboard once grew the page every time it turned; SVG content is
 * clipped to its viewBox and cannot do that.
 *
 * Angles here are degrees of sweep clockwise on screen from the fixed ray,
 * the same convention the daily uses (SVG's y axis points down, so positive
 * radians run clockwise).
 */

const { size, rayLength, arcRadius } = BOARD;
const CENTRE = size / 2;

const Frame = styled.div`
  width: 100%;
  max-width: 320px;
  margin: 0 auto;
  @media (min-width: 480px) {
    max-width: 420px;
  }
`;

const Surface = styled.svg`
  display: block;
  width: 100%;
  height: auto;
  touch-action: none;
  cursor: ${({ $disabled }) => ($disabled ? 'default' : 'grab')};
  -webkit-tap-highlight-color: transparent;
  :active {
    cursor: ${({ $disabled }) => ($disabled ? 'default' : 'grabbing')};
  }
`;

const Dial = styled.circle`
  fill: #fafafb;
  stroke: #ecedef;
  stroke-width: 1;
  @media (prefers-color-scheme: dark) {
    fill: #16171a;
    stroke: #26282d;
  }
`;

const FixedRay = styled.line`
  stroke: #8b93a1;
  stroke-width: 2.6;
  stroke-linecap: round;
`;

const LiveRay = styled.line`
  stroke: #df6247;
  stroke-width: 3;
  stroke-linecap: round;
`;

const GhostRay = styled.line`
  stroke: #df6247;
  stroke-width: 2;
  stroke-linecap: round;
  opacity: 0.22;
`;

const TruthRay = styled.line`
  stroke: #3fa96a;
  stroke-width: 3;
  stroke-linecap: round;
`;

/**
 * The measured side, filled close to the pivot.
 *
 * An arc alone left the two sides of a reflex angle looking alike: a player
 * asked for 219° could build 141° and see nothing to say which one they had.
 * Kept to the arc's own radius so it says *which* side, not how big — the size
 * is what the mode asks the player to judge.
 */
const SweepFill = styled.path`
  fill: #446688;
  opacity: 0.09;
  @media (prefers-color-scheme: dark) {
    fill: #8fb0d4;
    opacity: 0.14;
  }
`;

/** Thin and quiet: it traces the edge of the side being measured. */
const SweepArc = styled.path`
  fill: none;
  stroke: #446688;
  stroke-width: 2;
  opacity: 0.65;
  @media (prefers-color-scheme: dark) {
    stroke: #8fb0d4;
  }
`;

const TruthArc = styled(SweepArc)`
  stroke: #3fa96a;
  opacity: 0.75;
  @media (prefers-color-scheme: dark) {
    stroke: #3fa96a;
  }
`;

const Pivot = styled.circle`
  fill: #2b3440;
  stroke: #ffffff;
  stroke-width: 1.5;
  @media (prefers-color-scheme: dark) {
    fill: #e6e8ec;
    stroke: #121212;
  }
`;

const Grip = styled.circle`
  fill: #df6247;
  opacity: 0.9;
`;

const polar = (radiusPx, degrees) => {
  const radians = (degrees * Math.PI) / 180;
  return {
    x: CENTRE + radiusPx * Math.cos(radians),
    y: CENTRE + radiusPx * Math.sin(radians),
  };
};

/** The same span as the arc, closed back to the pivot. */
function wedgePath(radiusPx, fromDegrees, sweepDegrees) {
  const start = polar(radiusPx, fromDegrees);
  const end = polar(radiusPx, fromDegrees + sweepDegrees);
  const largeArc = sweepDegrees > 180 ? 1 : 0;
  return `M ${CENTRE} ${CENTRE} L ${start.x} ${start.y} A ${radiusPx} ${radiusPx} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}

function arcPath(radiusPx, fromDegrees, sweepDegrees) {
  const start = polar(radiusPx, fromDegrees);
  const end = polar(radiusPx, fromDegrees + sweepDegrees);
  const largeArc = sweepDegrees > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${radiusPx} ${radiusPx} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

const Ray = ({ as: Component, fixedAngle, sweep, length = rayLength }) => {
  const end = polar(length, fixedAngle + sweep);
  return <Component x1={CENTRE} y1={CENTRE} x2={end.x} y2={end.y} />;
};

export function ConstructBoard({
  fixedAngle,
  sweep,
  ghosts = [],
  truth = null,
  disabled = false,
  onSweepChange,
}) {
  const surfaceRef = useRef(null);
  const drag = useRef({ pointerId: null, offset: 0 });

  /** Pointer position as degrees clockwise from the fixed ray. */
  const pointerSweep = useCallback(
    (event) => {
      const rect = surfaceRef.current.getBoundingClientRect();
      const scale = rect.width / size;
      const dx = event.clientX - (rect.left + CENTRE * scale);
      const dy = event.clientY - (rect.top + CENTRE * scale);
      const distance = Math.hypot(dx, dy);
      // Too close to the pivot a pixel is several degrees: ignore it.
      if (distance < rayLength * scale * INPUT.deadZone) return null;
      const degrees = (Math.atan2(dy, dx) * 180) / Math.PI;
      return degrees - fixedAngle;
    },
    [fixedAngle]
  );

  const normalise = (value) => ((value % 360) + 360) % 360;

  const onPointerDown = (event) => {
    if (disabled) return;
    const grabbed = pointerSweep(event);
    if (grabbed === null) return;
    // Rotate from wherever it was grabbed rather than snapping to the finger.
    drag.current = {
      pointerId: event.pointerId,
      offset: normalise(grabbed - sweep),
    };
    try {
      surfaceRef.current.setPointerCapture(event.pointerId);
    } catch (e) {}
  };

  const onPointerMove = (event) => {
    if (disabled || drag.current.pointerId !== event.pointerId) return;
    const moved = pointerSweep(event);
    if (moved === null) return;
    onSweepChange(normalise(moved - drag.current.offset));
  };

  const endDrag = (event) => {
    if (drag.current.pointerId !== event.pointerId) return;
    try {
      surfaceRef.current.releasePointerCapture(event.pointerId);
    } catch (e) {}
    drag.current.pointerId = null;
  };

  const grip = polar(rayLength, fixedAngle + sweep);

  return (
    <Frame>
      <Surface
        ref={surfaceRef}
        viewBox={`0 0 ${size} ${size}`}
        $disabled={disabled}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        role="img"
        aria-label="Rotate the ray to build the angle"
        data-testid="construct-board"
      >
        <Dial cx={CENTRE} cy={CENTRE} r={rayLength + 8} />

        {ghosts.map((ghost, i) => (
          <Ray key={i} as={GhostRay} fixedAngle={fixedAngle} sweep={ghost} />
        ))}

        <SweepFill d={wedgePath(arcRadius, fixedAngle, sweep)} />
        <SweepArc d={arcPath(arcRadius, fixedAngle, sweep)} />
        <Ray
          as={FixedRay}
          fixedAngle={fixedAngle}
          sweep={0}
          length={rayLength + 10}
        />

        {truth != null && (
          <>
            <TruthArc d={arcPath(arcRadius + 9, fixedAngle, truth)} />
            <Ray as={TruthRay} fixedAngle={fixedAngle} sweep={truth} />
          </>
        )}

        <Ray as={LiveRay} fixedAngle={fixedAngle} sweep={sweep} />
        {!disabled && <Grip cx={grip.x} cy={grip.y} r={7} />}
        <Pivot cx={CENTRE} cy={CENTRE} r={4} />
      </Surface>
    </Frame>
  );
}
