import { useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { DialRing } from './DialRing';
import { BEHAVIOUR, GEOMETRY, MAX_DIAL_VALUE, RINGS } from './config';
import { buzzReset } from './haptics';
import { useDialSize } from './useDialSize';
import { useRotaryDial } from './useRotaryDial';
import { useTapTarget } from './useTapTarget';

/**
 * The mobile keyboard: two nested dials (tens outside, units inside) with the
 * resulting angle on top of them. Spinning either ring writes the guess back
 * to the app immediately — the user rotates, then hits "Guess!".
 */

const Wrapper = styled.div`
  --dial-face: #fbfbfc;
  --dial-band: #eceef1;
  --dial-band-inner: #dfe5ec;
  --dial-band-shadow:
    0 1px 3px rgba(0, 0, 0, 0.12), inset 0 0 0 1px rgba(0, 0, 0, 0.05);
  --dial-label: #3d4450;
  --dial-tick: #aab2be;
  --dial-lens: rgba(223, 98, 71, 0.12);
  --dial-lens-edge: rgba(223, 98, 71, 0.35);
  --dial-marker: #df6247;
  --dial-readout-bg: #ffffff;
  --dial-readout-text: #df6247;
  --dial-hint: #8b93a1;

  @media (prefers-color-scheme: dark) {
    --dial-face: #17181b;
    --dial-band: #26282d;
    --dial-band-inner: #2f333a;
    --dial-band-shadow:
      0 1px 3px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.04);
    --dial-label: #dadada;
    --dial-tick: #5a6169;
    --dial-lens: rgba(223, 98, 71, 0.18);
    --dial-lens-edge: rgba(223, 98, 71, 0.5);
    --dial-marker: #df6247;
    --dial-readout-bg: #1f2023;
    --dial-readout-text: #ff8163;
    --dial-hint: #767c88;
  }

  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  margin: 0.25rem 0 0.75rem;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  opacity: ${({ $disabled }) => ($disabled ? 0.4 : 1)};
  pointer-events: ${({ $disabled }) => ($disabled ? 'none' : 'auto')};
  transition: opacity 200ms ease;
`;

const Frame = styled.div`
  position: relative;
  flex: none;
  /*
   * The rings are square layers that get rotated, and a rotated box still
   * counts towards the page's scrollable area — a 40° turn grows a 299px
   * square's bounding box to 421px, which showed up as the page gaining room
   * to scroll left, right and down the moment anyone touched the dial.
   * Everything drawn sits inside the circle, so clipping the square costs
   * nothing visible and keeps the rotation to itself.
   */
  overflow: hidden;
`;

/** Triangles at 12 o'clock: whatever sits under them is selected. */
const Marker = styled.div`
  position: absolute;
  left: 50%;
  width: 0;
  height: 0;
  border-style: solid;
  border-left-color: transparent;
  border-right-color: transparent;
  border-bottom-width: 0;
  border-top-color: var(--dial-marker);
  transform: translateX(-50%);
  pointer-events: none;
`;

/** Also the reset button: a press in the middle puts the dial back to 0°. */
const Readout = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Boston-Regular';
  color: var(--dial-readout-text);
  background-color: var(--dial-readout-bg);
  box-shadow: var(--dial-band-shadow);
  touch-action: none;
  cursor: pointer;
  transition: transform 120ms ease;
  :active {
    transform: translate(-50%, -50%) scale(0.93);
  }
`;

const Hint = styled.div`
  font-size: 0.75rem;
  color: var(--dial-hint);
`;

/** The rings can only express 0 - MAX_DIAL_VALUE; anything else is clamped. */
function parseGuess(value) {
  const numeric = parseInt(value, 10);
  if (!Number.isFinite(numeric)) return 0;
  return Math.min(Math.max(numeric, 0), MAX_DIAL_VALUE);
}

export function DialKeyboard({ value, onChange, disabled = false }) {
  const size = useDialSize();
  const radius = size / 2;

  const numeric = parseGuess(value);
  const outerIndex = Math.floor(numeric / RINGS.outer.valuePerStep);
  const innerIndex = numeric % RINGS.inner.steps;

  // Mirrors what each ring currently shows, so that turning one ring can be
  // combined with the other one's value without a re-render in between.
  const selection = useRef({ outer: outerIndex, inner: innerIndex });
  useEffect(() => {
    selection.current = { outer: outerIndex, inner: innerIndex };
  }, [outerIndex, innerIndex]);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const emit = useCallback(() => {
    const { outer, inner } = selection.current;
    onChangeRef.current(
      String(
        outer * RINGS.outer.valuePerStep + inner * RINGS.inner.valuePerStep
      )
    );
  }, []);

  const handleOuter = useCallback(
    (index) => {
      selection.current.outer = index;
      emit();
    },
    [emit]
  );

  const handleInner = useCallback(
    (index) => {
      selection.current.inner = index;
      emit();
    },
    [emit]
  );

  /** Touching a ring puts away the phone's own keyboard. */
  const handleGrab = useCallback(() => {
    if (!BEHAVIOUR.blurNativeKeyboardOnGrab) return;
    const active = document.activeElement;
    if (active && active !== document.body && active.blur) active.blur();
  }, []);

  const outer = useRotaryDial({
    steps: RINGS.outer.steps,
    index: outerIndex,
    onIndexChange: handleOuter,
    onGrab: handleGrab,
    disabled,
  });

  const inner = useRotaryDial({
    steps: RINGS.inner.steps,
    index: innerIndex,
    onIndexChange: handleInner,
    onGrab: handleGrab,
    disabled,
  });

  /**
   * Press in the middle: back to zero. The rings are told directly rather than
   * through `value`, so a reset lands even if they are mid-spin.
   */
  const handleReset = useCallback(() => {
    if (selection.current.outer === 0 && selection.current.inner === 0) return;
    selection.current = { outer: 0, inner: 0 };
    buzzReset();
    outer.glideTo(0);
    inner.glideTo(0);
    onChangeRef.current('0');
  }, [outer, inner]);

  const resetHandlers = useTapTarget({
    onTap: handleReset,
    onGrab: handleGrab,
  });

  const markerSize = size * GEOMETRY.markerSizeRatio;
  const readoutSize = GEOMETRY.readoutRadius * size;

  return (
    <Wrapper $disabled={disabled}>
      <Frame
        style={{ width: size, height: size }}
        aria-hidden="true"
        data-testid="dial-frame"
      >
        <DialRing
          dial={outer}
          size={size}
          tone="outer"
          steps={RINGS.outer.steps}
          valuePerStep={RINGS.outer.valuePerStep}
          bandInner={GEOMETRY.outerBandInner}
          bandOuter={1}
          labelRadius={GEOMETRY.outerLabelRadius}
          tickRadius={GEOMETRY.outerTickRadius}
          fontRatio={GEOMETRY.outerFontRatio}
          fontMinPx={GEOMETRY.outerFontMinPx}
          lensWidthEm={GEOMETRY.outerLensWidthEm}
          majorEvery={RINGS.outer.steps / 4}
          disabled={disabled}
        />
        <DialRing
          dial={inner}
          size={size}
          tone="inner"
          steps={RINGS.inner.steps}
          valuePerStep={RINGS.inner.valuePerStep}
          bandInner={GEOMETRY.innerBandInner}
          bandOuter={GEOMETRY.innerBandOuter}
          labelRadius={GEOMETRY.innerLabelRadius}
          tickRadius={GEOMETRY.innerTickRadius}
          fontRatio={GEOMETRY.innerFontRatio}
          fontMinPx={GEOMETRY.innerFontMinPx}
          lensWidthEm={GEOMETRY.innerLensWidthEm}
          disabled={disabled}
        />

        <Marker
          style={{
            top: 0,
            borderTopWidth: markerSize,
            borderLeftWidth: markerSize / 2,
            borderRightWidth: markerSize / 2,
          }}
        />
        <Marker
          style={{
            top: radius * (1 - GEOMETRY.innerBandOuter) - markerSize,
            borderTopWidth: markerSize,
            borderLeftWidth: markerSize / 2,
            borderRightWidth: markerSize / 2,
          }}
        />

        {/* The final number, sitting on top of the two circles. */}
        <Readout
          data-testid="dial-readout"
          {...resetHandlers}
          style={{
            width: readoutSize,
            height: readoutSize,
            fontSize: size * GEOMETRY.readoutFontRatio,
          }}
        >
          {numeric}°
        </Readout>
      </Frame>
      <Hint>Spin or tap a number · tap the middle to reset</Hint>
    </Wrapper>
  );
}
