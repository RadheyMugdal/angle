"use client";

import React, { useCallback, useRef } from 'react';
import { buzzReset, buzzTick } from '@/lib/angle/haptics';

interface DialKeyboardProps {
  value: string;
  onChange: (val: string) => void;
  hapticsEnabled?: boolean;
}

export const DialKeyboard: React.FC<DialKeyboardProps> = ({
  value,
  onChange,
  hapticsEnabled = true,
}) => {
  const currentAngle = parseInt(value, 10) || 0;
  const tens = Math.floor((currentAngle % 360) / 10) * 10;
  const units = currentAngle % 10;

  const outerSvgRef = useRef<SVGSVGElement | null>(null);
  const isDraggingOuter = useRef(false);
  const isDraggingInner = useRef(false);

  const setAngleFromTens = useCallback(
    (newTens: number) => {
      const combined = Math.min(360, newTens + units);
      onChange(String(combined));
      if (hapticsEnabled) buzzTick();
    },
    [units, onChange, hapticsEnabled]
  );

  const setAngleFromUnits = useCallback(
    (newUnits: number) => {
      const combined = Math.min(360, tens + newUnits);
      onChange(String(combined));
      if (hapticsEnabled) buzzTick();
    },
    [tens, onChange, hapticsEnabled]
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!outerSvgRef.current) return;
    const rect = outerSvgRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const radiusOuter = rect.width / 2;

    if (dist < radiusOuter * 0.3) {
      // Clicked inside center readout -> reset
      onChange('0');
      if (hapticsEnabled) buzzReset();
      return;
    }

    // Determine angle clockwise from 12 o'clock
    let angleRad = Math.atan2(dx, -dy);
    if (angleRad < 0) angleRad += 2 * Math.PI;
    const deg = (angleRad * 180) / Math.PI;

    if (dist > radiusOuter * 0.65) {
      // Outer tens ring (36 segments, 10 deg each)
      isDraggingOuter.current = true;
      const steppedTens = Math.round(deg / 10) * 10;
      setAngleFromTens(steppedTens % 360);
    } else {
      // Inner units ring (10 segments, 36 deg each)
      isDraggingInner.current = true;
      const unitVal = Math.round(deg / 36);
      setAngleFromUnits(unitVal % 10);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingOuter.current && !isDraggingInner.current) return;
    if (!outerSvgRef.current) return;

    const rect = outerSvgRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;

    let angleRad = Math.atan2(dx, -dy);
    if (angleRad < 0) angleRad += 2 * Math.PI;
    const deg = (angleRad * 180) / Math.PI;

    if (isDraggingOuter.current) {
      const steppedTens = Math.round(deg / 10) * 10;
      setAngleFromTens(steppedTens % 360);
    } else if (isDraggingInner.current) {
      const unitVal = Math.round(deg / 36);
      setAngleFromUnits(unitVal % 10);
    }
  };

  const handlePointerUp = () => {
    isDraggingOuter.current = false;
    isDraggingInner.current = false;
  };

  // Generate outer ticks (Tens: 0, 10, ..., 350)
  const outerTicks = Array.from({ length: 36 }).map((_, i) => {
    const angleDeg = i * 10;
    const rad = (angleDeg * Math.PI) / 180;
    const x1 = 150 + 130 * Math.sin(rad);
    const y1 = 150 - 130 * Math.cos(rad);
    const x2 = 150 + 144 * Math.sin(rad);
    const y2 = 150 - 144 * Math.cos(rad);
    const isMajor = i % 3 === 0;
    const labelRad = ((angleDeg) * Math.PI) / 180;
    const lx = 150 + 115 * Math.sin(labelRad);
    const ly = 150 - 115 * Math.cos(labelRad);
    return { angleDeg, val: i * 10, x1, y1, x2, y2, isMajor, lx, ly };
  });

  // Generate inner ticks (Units: 0..9)
  const innerTicks = Array.from({ length: 10 }).map((_, i) => {
    const angleDeg = i * 36;
    const rad = (angleDeg * Math.PI) / 180;
    const x1 = 150 + 68 * Math.sin(rad);
    const y1 = 150 - 68 * Math.cos(rad);
    const x2 = 150 + 84 * Math.sin(rad);
    const y2 = 150 - 84 * Math.cos(rad);
    const lx = 150 + 58 * Math.sin(rad);
    const ly = 150 - 58 * Math.cos(rad);
    return { val: i, x1, y1, x2, y2, lx, ly };
  });

  return (
    <div className="flex flex-col items-center justify-center my-2 select-none touch-none">
      <div className="relative w-64 h-64 sm:w-72 sm:h-72">
        <svg
          ref={outerSvgRef}
          viewBox="0 0 300 300"
          className="w-full h-full cursor-grab active:cursor-grabbing"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* Outer ring background */}
          <circle
            cx="150"
            cy="150"
            r="146"
            className="fill-neutral-100 dark:fill-[#1b1c20] stroke-neutral-300 dark:stroke-neutral-800"
            strokeWidth="2"
          />

          {/* Inner ring background */}
          <circle
            cx="150"
            cy="150"
            r="88"
            className="fill-neutral-200/70 dark:fill-[#24262b] stroke-neutral-300 dark:stroke-neutral-700"
            strokeWidth="1.5"
          />

          {/* Outer ticks & numbers */}
          {outerTicks.map((tick) => (
            <g key={`outer-${tick.val}`}>
              <line
                x1={tick.x1}
                y1={tick.y1}
                x2={tick.x2}
                y2={tick.y2}
                className={
                  tick.isMajor
                    ? 'stroke-[#df6247] stroke-[2px]'
                    : 'stroke-neutral-400 dark:stroke-neutral-600 stroke-[1px]'
                }
              />
              {tick.isMajor && (
                <text
                  x={tick.lx}
                  y={tick.ly}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="font-boston text-[10px] font-semibold fill-neutral-600 dark:fill-neutral-400 select-none pointer-events-none"
                >
                  {tick.val}
                </text>
              )}
            </g>
          ))}

          {/* Inner ticks & numbers */}
          {innerTicks.map((tick) => (
            <g key={`inner-${tick.val}`}>
              <line
                x1={tick.x1}
                y1={tick.y1}
                x2={tick.x2}
                y2={tick.y2}
                className="stroke-neutral-400 dark:stroke-neutral-500 stroke-[1.5px]"
              />
              <text
                x={tick.lx}
                y={tick.ly}
                textAnchor="middle"
                dominantBaseline="middle"
                className="font-boston text-[11px] font-bold fill-neutral-700 dark:fill-neutral-300 select-none pointer-events-none"
              >
                {tick.val}
              </text>
            </g>
          ))}

          {/* Outer marker triangle at 12 o'clock */}
          <polygon
            points="145,5 155,5 150,15"
            className="fill-[#df6247]"
          />

          {/* Inner marker triangle at 12 o'clock */}
          <polygon
            points="146,63 154,63 150,71"
            className="fill-[#df6247]"
          />

          {/* Center Readout & Reset Button */}
          <circle
            cx="150"
            cy="150"
            r="40"
            className="fill-white dark:fill-[#121316] stroke-[#df6247]/30 stroke-[2px] cursor-pointer hover:stroke-[#df6247] transition-colors"
          />
          <text
            x="150"
            y="146"
            textAnchor="middle"
            dominantBaseline="middle"
            className="font-boston text-xl font-bold fill-[#df6247] select-none pointer-events-none"
          >
            {currentAngle}°
          </text>
          <text
            x="150"
            y="164"
            textAnchor="middle"
            dominantBaseline="middle"
            className="font-boston text-[9px] uppercase tracking-wider fill-neutral-400 select-none pointer-events-none"
          >
            tap reset
          </text>
        </svg>
      </div>
      <div className="text-[11px] font-boston text-neutral-500 dark:text-neutral-400 mt-1">
        Outer: Tens · Inner: Units · Center: Reset
      </div>
    </div>
  );
};
