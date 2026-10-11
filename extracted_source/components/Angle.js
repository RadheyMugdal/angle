import { useState } from 'react';
import styled, { css } from 'styled-components';
import { DASHED, OFF, readAngleStyle } from '../angleStyle';

const RADIUS = 100;
function polarToCartesian(centerX, centerY, radius, angleInRadians) {
  // var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(x, y, radius, angle1, angle2, largeArc) {
  const startAngle = angle1 < angle2 ? angle1 : angle2;
  const endAngle = angle1 < angle2 ? angle2 : angle1;

  var start = polarToCartesian(x, y, radius, endAngle);
  var end = polarToCartesian(x, y, radius, startAngle);

  var d = [
    'M',
    start.x,
    start.y,
    'A',
    radius,
    radius,
    0,
    largeArc ? '1' : '0',
    angle1 > angle2 ? '0' : '1',
    end.x,
    end.y,
  ].join(' ');

  return d;
}

/**
 * The same span as the arc, closed back to the vertex. Flags are copied from
 * describeArc so the fill can never disagree with the arc drawn over it —
 * including the reflex case, where the wedge is the larger side.
 */
function describeWedge(x, y, radius, angle1, angle2, largeArc) {
  const startAngle = angle1 < angle2 ? angle1 : angle2;
  const endAngle = angle1 < angle2 ? angle2 : angle1;

  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);

  return [
    'M',
    x,
    y,
    'L',
    start.x,
    start.y,
    'A',
    radius,
    radius,
    0,
    largeArc ? '1' : '0',
    angle1 > angle2 ? '0' : '1',
    end.x,
    end.y,
    'Z',
  ].join(' ');
}

const HEIGHT = 200;
const WIDTH = 300;
const ARC_RADIUS = 22;
const WEDGE_RADIUS = 36;
const TIP_ARC_RADIUS = 98;
const LABEL_RADIUS = 74;
const LINE_COLOUR = '#DF6247';
const ARC_COLOUR = '#446688';

const TWO_PI = 2 * Math.PI;

/**
 * The drawing is the game, so it gets the room the screen can spare: the
 * geometry lives in a viewBox and the frame decides how big that is. Phones
 * keep the size the rest of the layout was tuned around; wider screens, where
 * there is space going spare, let it grow.
 */
const Frame = styled.div`
  width: 100%;
  max-width: 300px;
  margin: 15px auto 0;
  @media (min-width: 480px) {
    max-width: 340px;
  }
  @media (min-width: 768px) {
    max-width: 400px;
  }
`;

const Drawing = styled.svg`
  display: block;
  width: 100%;
  height: auto;
  animation: angle-in 420ms cubic-bezier(0.2, 0.7, 0.3, 1) both;
  @keyframes angle-in {
    from {
      opacity: 0;
      transform: scale(0.97);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

/**
 * A whisper of fill, so the angle reads as a quantity rather than two sticks.
 * Kept close to the vertex on purpose: a wide one turns a reflex angle into a
 * grey disc that dominates the drawing instead of describing it.
 */
const Wedge = styled.path`
  fill: ${ARC_COLOUR};
  opacity: 0.1;
  @media (prefers-color-scheme: dark) {
    fill: #8fb0d4;
    opacity: 0.15;
  }
`;

const Arc = styled.path`
  fill: none;
  stroke: ${ARC_COLOUR};
  stroke-width: 2.2;
  @media (prefers-color-scheme: dark) {
    stroke: #8fb0d4;
  }
`;

/**
 * An arc closing the measured side across the tips of the arms.
 *
 * The small arc at the vertex already says which of the two angles is meant,
 * but at a glance a reflex angle still reads as its non-reflex twin; carrying
 * the same span out to the open end leaves nothing to misread. Faint either
 * way, so it stays a boundary rather than another line in the figure.
 *
 * Blurred by default, dashed as an alternative, or left off entirely — see
 * angleStyle.js.
 *
 * Just inside the tips: at exactly the arm length the circle touches the
 * viewBox edge, and the stroke would be clipped where it does.
 */
const TipArc = styled.path`
  fill: none;
  stroke: ${ARC_COLOUR};
  stroke-linecap: round;
  opacity: 0.45;
  ${({ $mode }) =>
    $mode === DASHED
      ? css`
          stroke-width: 1.2;
          stroke-dasharray: 5 4;
        `
      : css`
          stroke-width: 0.7;
          filter: blur(1.5px);
        `}
  @media (prefers-color-scheme: dark) {
    stroke: #8fb0d4;
    opacity: 0.5;
  }
`;

const Arm = styled.line`
  stroke: ${LINE_COLOUR};
  stroke-width: 2.6;
  stroke-linecap: round;
`;

const Vertex = styled.circle`
  fill: #2b3440;
  stroke: #ffffff;
  stroke-width: 1.5;
  @media (prefers-color-scheme: dark) {
    fill: #e6e8ec;
    stroke: #121212;
  }
`;

/**
 * The answer, printed just beyond the tinted wedge it measures. The stroke is
 * painted first so the digits stay readable where a narrow angle puts them
 * across one of the arms.
 */
const AnswerLabel = styled.text`
  font-family: 'Boston-Regular';
  font-size: 16px;
  font-weight: 600;
  fill: ${ARC_COLOUR};
  stroke: #ffffff;
  stroke-width: 3px;
  paint-order: stroke;
  @media (prefers-color-scheme: dark) {
    fill: #8fb0d4;
    stroke: #121212;
  }
`;

/** `tipStyle` overrides the stored setting, for the previews on /settings. */
export function Angle({ angle1, angle2, largeArc, answer, tipStyle }) {
  const [stored] = useState(readAngleStyle);
  const mode = tipStyle ?? stored;

  // The drawn arc runs from angle2 round to angle1, so its middle sits half
  // that sweep on from angle2.
  const sweep = (((angle1 - angle2) % TWO_PI) + TWO_PI) % TWO_PI;
  const labelPoint = polarToCartesian(
    WIDTH / 2,
    HEIGHT / 2,
    LABEL_RADIUS,
    angle2 + sweep / 2
  );

  return (
    <Frame>
      <Drawing viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img">
        <Wedge
          d={describeWedge(
            WIDTH / 2,
            HEIGHT / 2,
            WEDGE_RADIUS,
            angle1,
            angle2,
            largeArc
          )}
        />
        <Arc
          d={describeArc(
            WIDTH / 2,
            HEIGHT / 2,
            ARC_RADIUS,
            angle1,
            angle2,
            largeArc
          )}
        />
        {mode !== OFF && (
          <TipArc
            $mode={mode}
            d={describeArc(
              WIDTH / 2,
              HEIGHT / 2,
              TIP_ARC_RADIUS,
              angle1,
              angle2,
              largeArc
            )}
          />
        )}
        <Arm
          x1={WIDTH / 2}
          y1={HEIGHT / 2}
          x2={RADIUS * Math.cos(angle1) + WIDTH / 2}
          y2={RADIUS * Math.sin(angle1) + HEIGHT / 2}
        />
        <Arm
          x1={WIDTH / 2}
          y1={HEIGHT / 2}
          x2={RADIUS * Math.cos(angle2) + WIDTH / 2}
          y2={RADIUS * Math.sin(angle2) + HEIGHT / 2}
        />
        <Vertex cx={WIDTH / 2} cy={HEIGHT / 2} r={3.5} />
        {answer != null && (
          <AnswerLabel
            x={labelPoint.x}
            y={labelPoint.y}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {answer}°
          </AnswerLabel>
        )}
      </Drawing>
    </Frame>
  );
}
