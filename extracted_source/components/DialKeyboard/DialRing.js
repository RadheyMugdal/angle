import styled from 'styled-components';

/**
 * One rotary ring: a decorative band, a "lens" marking the selected slot, the
 * rotating layer of ticks + numbers, and the transparent disc that catches the
 * finger.
 *
 * Everything is absolutely positioned inside the square dial frame, so the
 * pieces are returned as a fragment. Order matters: rings are rendered
 * outer-first, which lets the inner ring's hit disc sit on top of the outer
 * one and own the middle of the dial.
 */

const Band = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  border-radius: 50%;
  border-style: solid;
  box-sizing: border-box;
  transform: translate(-50%, -50%);
  pointer-events: none;
  background-color: var(--dial-face);
  box-shadow: var(--dial-band-shadow);
  border-color: ${({ $tone }) =>
    $tone === 'inner' ? 'var(--dial-band-inner)' : 'var(--dial-band)'};
`;

/** Sits under the number that is currently at the top marker. */
const Lens = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  border-radius: 8px;
  pointer-events: none;
  background-color: var(--dial-lens);
  border: 1px solid var(--dial-lens-edge);
  box-sizing: border-box;
`;

const RotatingLayer = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  will-change: transform;
  transform-origin: 50% 50%;
  /* The rotation itself is written to .style.transform on every frame. */
`;

const Label = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  line-height: 1;
  white-space: nowrap;
  font-family: 'Boston-Regular';
  color: var(--dial-label);
`;

const Tick = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  border-radius: 999px;
  background-color: var(--dial-tick);
`;

const HitDisc = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  touch-action: none;
  cursor: ${({ $disabled }) => ($disabled ? 'default' : 'grab')};
  :active {
    cursor: ${({ $disabled }) => ($disabled ? 'default' : 'grabbing')};
  }
`;

/** Places an element on the ring at `angle`, `radius` px out from the centre. */
const onRing = (angle, radius) =>
  `translate(-50%, -50%) rotate(${angle}deg) translateY(${-radius}px)`;

export function DialRing({
  dial,
  size,
  steps,
  valuePerStep,
  tone,
  bandInner,
  bandOuter,
  labelRadius,
  tickRadius,
  fontRatio,
  fontMinPx = 0,
  lensWidthEm = 2.5,
  majorEvery = 0,
  disabled,
}) {
  const radius = size / 2;
  const stepAngle = 360 / steps;
  const bandWidth = (bandOuter - bandInner) * radius;
  const fontSize = Math.max(size * fontRatio, fontMinPx);
  const tickLength = Math.max(2, size * 0.016);
  const tickWidth = Math.max(1, size * 0.005);

  const detents = [];
  for (let i = 0; i < steps; i += 1) detents.push(i);

  return (
    <>
      <Band
        $tone={tone}
        style={{
          width: bandOuter * size,
          height: bandOuter * size,
          borderWidth: bandWidth,
        }}
      />

      <Lens
        style={{
          width: fontSize * lensWidthEm,
          height: fontSize * 1.7,
          transform: onRing(0, labelRadius * radius),
        }}
      />

      <RotatingLayer ref={dial.ringRef} data-ring={tone}>
        {detents.map((i) => {
          const major = majorEvery > 0 && i % majorEvery === 0;
          return (
            <Tick
              key={`tick-${i}`}
              style={{
                width: major ? tickWidth * 2 : tickWidth,
                height: major ? tickLength * 1.6 : tickLength,
                opacity: major ? 1 : 0.5,
                transform: onRing(i * stepAngle, tickRadius * radius),
              }}
            />
          );
        })}
        {detents.map((i) => (
          <Label
            key={`label-${i}`}
            style={{
              fontSize,
              transform: onRing(i * stepAngle, labelRadius * radius),
            }}
          >
            {i * valuePerStep}
          </Label>
        ))}
      </RotatingLayer>

      <HitDisc
        ref={dial.hitRef}
        $disabled={disabled}
        style={{ width: bandOuter * size, height: bandOuter * size }}
        {...dial.handlers}
      />
    </>
  );
}
