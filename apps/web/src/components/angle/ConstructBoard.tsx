"use client";

import React, { useRef } from 'react';

interface ConstructBoardProps {
  fixedAngle: number;
  sweep: number;
  onSweepChange: (newSweep: number) => void;
  attempts: number[];
  target: number;
  finished: boolean;
  disabled?: boolean;
}

const SIZE = 300;
const CENTRE = SIZE / 2;
const RAY_LENGTH = 130;
const ARC_RADIUS = 34;

const polar = (radiusPx: number, degrees: number) => {
  const radians = (degrees * Math.PI) / 180;
  return {
    x: CENTRE + radiusPx * Math.cos(radians),
    y: CENTRE + radiusPx * Math.sin(radians),
  };
};

function wedgePath(radiusPx: number, fromDegrees: number, sweepDegrees: number) {
  const start = polar(radiusPx, fromDegrees);
  const end = polar(radiusPx, fromDegrees + sweepDegrees);
  const largeArc = sweepDegrees > 180 ? 1 : 0;
  return `M ${CENTRE} ${CENTRE} L ${start.x} ${start.y} A ${radiusPx} ${radiusPx} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}

function arcPath(radiusPx: number, fromDegrees: number, sweepDegrees: number) {
  const start = polar(radiusPx, fromDegrees);
  const end = polar(radiusPx, fromDegrees + sweepDegrees);
  const largeArc = sweepDegrees > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${radiusPx} ${radiusPx} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

export const ConstructBoard: React.FC<ConstructBoardProps> = ({
  fixedAngle,
  sweep,
  onSweepChange,
  attempts,
  target,
  finished,
  disabled = false,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const isDragging = useRef(false);

  const calculateSweep = (clientX: number, clientY: number) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;

    // Angle of pointer in screen coordinates (0 = +x, clockwise)
    let pointerAngleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
    if (pointerAngleDeg < 0) pointerAngleDeg += 360;

    // Sweep clockwise from fixed ray
    let computedSweep = pointerAngleDeg - fixedAngle;
    computedSweep = ((computedSweep % 360) + 360) % 360;
    onSweepChange(Math.round(computedSweep));
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled || finished) return;
    isDragging.current = true;
    calculateSweep(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || disabled || finished) return;
    calculateSweep(e.clientX, e.clientY);
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  const fixedTip = polar(RAY_LENGTH, fixedAngle);
  const liveTip = polar(RAY_LENGTH, fixedAngle + sweep);
  const truthTip = polar(RAY_LENGTH, fixedAngle + target);

  return (
    <div className="w-full max-w-[300px] sm:max-w-[340px] mx-auto select-none touch-none my-2">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label="Construct Angle Board"
        className={`w-full h-auto block rounded-full transition-all ${
          disabled || finished ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Background Dial Circle */}
        <circle
          cx={CENTRE}
          cy={CENTRE}
          r={CENTRE - 4}
          className="fill-neutral-50 dark:fill-[#16171a] stroke-neutral-200 dark:stroke-neutral-800"
          strokeWidth="1.5"
        />

        {/* Sweep wedge fill */}
        <path
          d={wedgePath(ARC_RADIUS, fixedAngle, sweep)}
          className="fill-[#446688] opacity-15 dark:fill-[#8fb0d4] dark:opacity-20"
        />

        {/* Sweep arc */}
        <path
          d={arcPath(ARC_RADIUS, fixedAngle, sweep)}
          className="fill-none stroke-[#446688] dark:stroke-[#8fb0d4] stroke-[2px] opacity-75"
        />

        {/* Fixed reference ray */}
        <line
          x1={CENTRE}
          y1={CENTRE}
          x2={fixedTip.x}
          y2={fixedTip.y}
          className="stroke-neutral-500 dark:stroke-neutral-400 stroke-[2.8px]"
          strokeLinecap="round"
        />

        {/* Ghost rays from earlier attempts */}
        {attempts.map((attemptAngle, i) => {
          const ghostTip = polar(RAY_LENGTH, fixedAngle + attemptAngle);
          return (
            <g key={i}>
              <path
                d={arcPath(ARC_RADIUS, fixedAngle, attemptAngle)}
                className="fill-none stroke-[#df6247] stroke-[1px] opacity-30"
              />
              <line
                x1={CENTRE}
                y1={CENTRE}
                x2={ghostTip.x}
                y2={ghostTip.y}
                className="stroke-[#df6247] stroke-[2px] opacity-30"
                strokeLinecap="round"
              />
            </g>
          );
        })}

        {/* Truth ray if finished */}
        {finished && (
          <g className="animate-in fade-in duration-500">
            <path
              d={arcPath(ARC_RADIUS + 6, fixedAngle, target)}
              className="fill-none stroke-emerald-500 stroke-[2.5px] opacity-90"
            />
            <line
              x1={CENTRE}
              y1={CENTRE}
              x2={truthTip.x}
              y2={truthTip.y}
              className="stroke-emerald-500 stroke-[3.2px]"
              strokeLinecap="round"
            />
          </g>
        )}

        {/* Live player rotatable ray */}
        {!finished && (
          <g>
            <line
              x1={CENTRE}
              y1={CENTRE}
              x2={liveTip.x}
              y2={liveTip.y}
              className="stroke-[#df6247] stroke-[3px]"
              strokeLinecap="round"
            />
            {/* Grip handle on the end of the ray */}
            <circle
              cx={liveTip.x}
              cy={liveTip.y}
              r={7}
              className="fill-[#df6247] stroke-white dark:stroke-[#16171a] stroke-[2px] shadow-md"
            />
          </g>
        )}

        {/* Vertex Pivot */}
        <circle
          cx={CENTRE}
          cy={CENTRE}
          r={4}
          className="fill-neutral-900 dark:fill-neutral-100 stroke-white dark:stroke-[#16171a] stroke-[1.5px]"
        />
      </svg>
    </div>
  );
};
