"use client";

import React from 'react';
import type { TipStyle } from '@/lib/angle/types';

interface AngleCanvasProps {
  angle1: number;
  angle2: number;
  largeArc: boolean;
  answer: number | null;
  tipStyle?: TipStyle;
}

const RADIUS = 100;
const HEIGHT = 200;
const WIDTH = 300;
const ARC_RADIUS = 22;
const WEDGE_RADIUS = 36;
const TIP_ARC_RADIUS = 98;
const LABEL_RADIUS = 74;
const TWO_PI = 2 * Math.PI;

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInRadians: number) {
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(
  x: number,
  y: number,
  radius: number,
  angle1: number,
  angle2: number,
  largeArc: boolean
) {
  const startAngle = angle1 < angle2 ? angle1 : angle2;
  const endAngle = angle1 < angle2 ? angle2 : angle1;

  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);

  return [
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
}

function describeWedge(
  x: number,
  y: number,
  radius: number,
  angle1: number,
  angle2: number,
  largeArc: boolean
) {
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

export const AngleCanvas: React.FC<AngleCanvasProps> = ({
  angle1,
  angle2,
  largeArc,
  answer,
  tipStyle = 'blurred',
}) => {
  const sweep = (((angle1 - angle2) % TWO_PI) + TWO_PI) % TWO_PI;
  const labelPoint = polarToCartesian(
    WIDTH / 2,
    HEIGHT / 2,
    LABEL_RADIUS,
    angle2 + sweep / 2
  );

  return (
    <div className="w-full max-w-[320px] sm:max-w-[360px] md:max-w-[420px] mx-auto select-none my-2 transition-transform duration-300">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label="Angle drawing"
        className="block w-full h-auto drop-shadow-sm transition-all duration-300"
      >
        <defs>
          <filter id="tip-blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.4" />
          </filter>
        </defs>

        {/* Tinted wedge */}
        <path
          d={describeWedge(WIDTH / 2, HEIGHT / 2, WEDGE_RADIUS, angle1, angle2, largeArc)}
          className="fill-[#446688] opacity-15 dark:fill-[#8fb0d4] dark:opacity-20 transition-all duration-300"
        />

        {/* Vertex arc */}
        <path
          d={describeArc(WIDTH / 2, HEIGHT / 2, ARC_RADIUS, angle1, angle2, largeArc)}
          fill="none"
          stroke="#446688"
          strokeWidth="2.2"
          className="dark:stroke-[#8fb0d4] transition-all duration-300"
        />

        {/* Tip arc if enabled */}
        {tipStyle !== 'off' && (
          <path
            d={describeArc(WIDTH / 2, HEIGHT / 2, TIP_ARC_RADIUS, angle1, angle2, largeArc)}
            fill="none"
            stroke="#446688"
            strokeLinecap="round"
            className="dark:stroke-[#8fb0d4] opacity-50"
            filter={tipStyle === 'blurred' ? 'url(#tip-blur)' : undefined}
            strokeWidth={tipStyle === 'dashed' ? '1.4' : '0.9'}
            strokeDasharray={tipStyle === 'dashed' ? '5 4' : undefined}
          />
        )}

        {/* Ray 1 */}
        <line
          x1={WIDTH / 2}
          y1={HEIGHT / 2}
          x2={RADIUS * Math.cos(angle1) + WIDTH / 2}
          y2={RADIUS * Math.sin(angle1) + HEIGHT / 2}
          stroke="#DF6247"
          strokeWidth="2.8"
          strokeLinecap="round"
        />

        {/* Ray 2 */}
        <line
          x1={WIDTH / 2}
          y1={HEIGHT / 2}
          x2={RADIUS * Math.cos(angle2) + WIDTH / 2}
          y2={RADIUS * Math.sin(angle2) + HEIGHT / 2}
          stroke="#DF6247"
          strokeWidth="2.8"
          strokeLinecap="round"
        />

        {/* Vertex pivot */}
        <circle
          cx={WIDTH / 2}
          cy={HEIGHT / 2}
          r={3.8}
          className="fill-[#2b3440] stroke-white stroke-[1.5px] dark:fill-[#e6e8ec] dark:stroke-[#121212]"
        />

        {/* Revealed answer label */}
        {answer !== null && (
          <text
            x={labelPoint.x}
            y={labelPoint.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="font-boston text-[17px] font-bold fill-[#446688] dark:fill-[#8fb0d4] stroke-white dark:stroke-[#121212] stroke-[3px] [paint-order:stroke] animate-in fade-in zoom-in duration-300"
          >
            {answer}°
          </text>
        )}
      </svg>
    </div>
  );
};
