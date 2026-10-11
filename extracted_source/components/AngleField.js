import { useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';

/**
 * The angle entry: a number field with a step down and step up either side.
 *
 * `type="number"` already offers arrows, but only on desktop — phones never
 * render them — and the native ones are a ~10px target. These work everywhere,
 * take a proper press, and repeat when held, which is what the endgame of a
 * round actually needs: "Boiling! ⬆️" then one degree at a time.
 *
 * The field is narrow on purpose. An angle is at most three characters, and a
 * tight group reads as a purpose-built control rather than a generic form.
 */

const MIN = 0;
const MAX = 360;
const STEP = 1;
/** Hold to repeat: a beat before it starts, then faster the longer it's held. */
const REPEAT_DELAY_MS = 400;
const REPEAT_START_MS = 110;
const REPEAT_MIN_MS = 40;
const REPEAT_RAMP = 0.85;

const Group = styled.div`
  display: inline-flex;
  align-items: stretch;
  border: 1px solid black;
  border-radius: 10px;
  overflow: hidden;
  background-color: #ffffff;
  @media (prefers-color-scheme: dark) {
    background-color: #1f2023;
    border-color: #3a3f46;
  }
`;

const StepButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  flex: none;
  padding: 0;
  border: none;
  background: none;
  font-family: 'Boston-Regular';
  font-size: 1.35rem;
  line-height: 1;
  color: #df6247;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  user-select: none;
  :hover {
    background-color: rgba(223, 98, 71, 0.1);
  }
  :active {
    background-color: rgba(223, 98, 71, 0.2);
  }
  :disabled {
    color: #c3c7cd;
    cursor: default;
    background: none;
  }
`;

const Field = styled.input`
  width: 74px;
  padding: 10px 2px;
  border: none;
  outline: none;
  background: none;
  text-align: center;
  font-family: 'Boston-Regular';
  font-size: 1.1rem;
  color: inherit;
  /* The native spinner is replaced by the buttons either side. */
  appearance: textfield;
  -moz-appearance: textfield;
  ::-webkit-outer-spin-button,
  ::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  @media (prefers-color-scheme: dark) {
    color: #dadada;
  }
`;

const clamp = (value) => Math.min(MAX, Math.max(MIN, value));

export function AngleField({ value, onChange, onEnter, autoFocus }) {
  const repeat = useRef({ timer: null, delay: REPEAT_START_MS });
  const valueRef = useRef(value);
  valueRef.current = value;

  const stop = useCallback(() => {
    clearTimeout(repeat.current.timer);
    repeat.current = { timer: null, delay: REPEAT_START_MS };
  }, []);

  useEffect(() => stop, [stop]);

  const step = useCallback(
    (direction) => {
      const current = parseInt(valueRef.current, 10);
      const base = Number.isFinite(current) ? current : 0;
      const next = clamp(base + direction * STEP);
      valueRef.current = String(next);
      onChange(String(next));
    },
    [onChange]
  );

  const startRepeating = useCallback(
    (direction) => {
      step(direction);
      const tick = () => {
        step(direction);
        repeat.current.delay = Math.max(
          REPEAT_MIN_MS,
          repeat.current.delay * REPEAT_RAMP
        );
        repeat.current.timer = setTimeout(tick, repeat.current.delay);
      };
      repeat.current.delay = REPEAT_START_MS;
      repeat.current.timer = setTimeout(tick, REPEAT_DELAY_MS);
    },
    [step]
  );

  const holdProps = (direction) => ({
    onPointerDown: (event) => {
      // Keep focus where it is: stealing it would close the phone's keyboard.
      event.preventDefault();
      startRepeating(direction);
    },
    onPointerUp: stop,
    onPointerLeave: stop,
    onPointerCancel: stop,
  });

  const numeric = parseInt(value, 10);
  const atMin = Number.isFinite(numeric) && numeric <= MIN;
  const atMax = Number.isFinite(numeric) && numeric >= MAX;

  return (
    <Group data-testid="angle-field">
      <StepButton
        type="button"
        aria-label="Decrease by one degree"
        disabled={atMin}
        data-testid="step-down"
        {...holdProps(-1)}
      >
        −
      </StepButton>
      <Field
        autoFocus={autoFocus}
        type="number"
        inputMode="numeric"
        pattern="\d*"
        min={MIN}
        max={MAX}
        step={STEP}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        // The dial leaves the last guess in the field. Selecting it on focus
        // means typing replaces it instead of running on the end of it.
        onFocus={(event) => event.target.select()}
        onKeyDown={onEnter}
        aria-label="Your angle in degrees"
      />
      <StepButton
        type="button"
        aria-label="Increase by one degree"
        disabled={atMax}
        data-testid="step-up"
        {...holdProps(1)}
      >
        +
      </StepButton>
    </Group>
  );
}
