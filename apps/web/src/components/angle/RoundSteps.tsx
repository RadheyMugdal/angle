"use client";

import React from 'react';

interface RoundStepsProps {
  round1Done: boolean;
  inRound2: boolean;
  view: 'game' | 'round2' | 'final';
  onNavigate: (view: 'game' | 'round2' | 'final') => void;
  hasRound2: boolean;
}

export const RoundSteps: React.FC<RoundStepsProps> = ({
  round1Done,
  view,
  onNavigate,
  hasRound2,
}) => {
  return (
    <div className="flex items-center justify-center gap-2 my-2 text-xs font-boston select-none">
      <button
        type="button"
        onClick={() => onNavigate('game')}
        className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
          view === 'game'
            ? 'bg-[#df6247] text-white font-bold shadow-sm'
            : round1Done
              ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-300'
              : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-500'
        }`}
      >
        1. Guess Angle {round1Done ? '✓' : ''}
      </button>

      <span className="text-neutral-400">→</span>

      <button
        type="button"
        disabled={!round1Done && !hasRound2}
        onClick={() => onNavigate('round2')}
        className={`px-3 py-1 rounded-full transition-all ${
          view === 'round2'
            ? 'bg-[#df6247] text-white font-bold shadow-sm cursor-pointer'
            : round1Done
              ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-300 cursor-pointer'
              : 'opacity-40 cursor-not-allowed bg-neutral-100 dark:bg-neutral-900 text-neutral-400'
        }`}
      >
        2. Make Angle
      </button>

      <span className="text-neutral-400">→</span>

      <button
        type="button"
        disabled={!round1Done}
        onClick={() => onNavigate('final')}
        className={`px-3 py-1 rounded-full transition-all ${
          view === 'final'
            ? 'bg-[#df6247] text-white font-bold shadow-sm cursor-pointer'
            : round1Done
              ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-300 cursor-pointer'
              : 'opacity-40 cursor-not-allowed bg-neutral-100 dark:bg-neutral-900 text-neutral-400'
        }`}
      >
        3. Results
      </button>
    </div>
  );
};
