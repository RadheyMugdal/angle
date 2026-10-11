"use client";

import React, { useCallback, useEffect, useRef } from 'react';

interface AngleFieldProps {
  value: string;
  onChange: (val: string) => void;
  onEnter: () => void;
  onGuess: () => void;
  autoFocus?: boolean;
  disabled?: boolean;
}

const MIN = 0;
const MAX = 360;
const STEP = 1;
const REPEAT_DELAY_MS = 380;
const REPEAT_START_MS = 110;
const REPEAT_MIN_MS = 40;
const REPEAT_RAMP = 0.85;

const clamp = (val: number) => Math.min(MAX, Math.max(MIN, val));

export const AngleField: React.FC<AngleFieldProps> = ({
  value,
  onChange,
  onEnter,
  onGuess,
  autoFocus = false,
  disabled = false,
}) => {
  const repeat = useRef<{ timer: NodeJS.Timeout | null; delay: number }>({
    timer: null,
    delay: REPEAT_START_MS,
  });
  const valueRef = useRef(value);
  valueRef.current = value;

  const stop = useCallback(() => {
    if (repeat.current.timer) {
      clearTimeout(repeat.current.timer);
    }
    repeat.current = { timer: null, delay: REPEAT_START_MS };
  }, []);

  useEffect(() => stop, [stop]);

  const step = useCallback(
    (direction: number) => {
      const current = parseInt(valueRef.current, 10);
      const base = Number.isFinite(current) ? current : 0;
      const next = clamp(base + direction * STEP);
      valueRef.current = String(next);
      onChange(String(next));
    },
    [onChange]
  );

  const startRepeating = useCallback(
    (direction: number) => {
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

  const holdProps = (direction: number) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
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
    <div className="flex items-center justify-center gap-3 my-3">
      {/* Stepper + Input pill */}
      <div className="inline-flex items-stretch border border-neutral-300 dark:border-neutral-700 rounded-xl overflow-hidden bg-white dark:bg-[#1a1b1e] shadow-sm">
        <button
          type="button"
          disabled={disabled || atMin}
          {...holdProps(-1)}
          aria-label="Decrease angle"
          className="flex items-center justify-center w-11 text-xl font-boston text-[#df6247] hover:bg-[#df6247]/10 active:bg-[#df6247]/20 disabled:text-neutral-400 disabled:hover:bg-transparent transition-colors select-none touch-manipulation cursor-pointer"
        >
          −
        </button>

        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoFocus={autoFocus}
          disabled={disabled}
          value={value}
          placeholder="0"
          onChange={(e) => {
            const val = e.target.value.replace(/[^0-9]/g, '');
            if (val === '') {
              onChange('');
            } else {
              const num = parseInt(val, 10);
              onChange(String(clamp(num)));
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onEnter();
            }
          }}
          className="w-16 py-2.5 text-center font-boston text-lg outline-none bg-transparent text-neutral-900 dark:text-neutral-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />

        <button
          type="button"
          disabled={disabled || atMax}
          {...holdProps(1)}
          aria-label="Increase angle"
          className="flex items-center justify-center w-11 text-xl font-boston text-[#df6247] hover:bg-[#df6247]/10 active:bg-[#df6247]/20 disabled:text-neutral-400 disabled:hover:bg-transparent transition-colors select-none touch-manipulation cursor-pointer"
        >
          +
        </button>
      </div>

      {/* Guess! Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={onGuess}
        className="px-5 py-2.5 rounded-xl font-boston text-base font-semibold text-white bg-[#df6247] hover:bg-[#c9533a] active:scale-[0.98] transition-all shadow-sm cursor-pointer disabled:opacity-50 select-none"
      >
        Guess!
      </button>
    </div>
  );
};
