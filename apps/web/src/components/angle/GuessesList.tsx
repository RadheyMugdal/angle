"use client";

import React from 'react';
import type { Guess } from '@/lib/angle/types';
import { arrow, temperature } from '@/lib/angle/gameLogic';
import { MAX_GUESSES } from '@/lib/angle/constants';

interface GuessesListProps {
  guesses: Guess[];
  answer: number;
}

export const GuessesList: React.FC<GuessesListProps> = ({ guesses, answer }) => {
  return (
    <div className="w-full max-w-[280px] sm:max-w-[320px] mx-auto mt-2 mb-4">
      <div className="text-sm font-boston text-neutral-600 dark:text-neutral-400 mb-2 font-medium text-center">
        Attempts: <span className="font-bold text-neutral-900 dark:text-neutral-100">{guesses.length}/{MAX_GUESSES}</span>
      </div>

      <div className="flex flex-col gap-1.5">
        {guesses.map((guess, idx) => {
          const isSolved = guess.delta === 0;
          return (
            <div
              key={idx}
              className={`grid grid-cols-6 gap-1.5 font-boston text-sm py-1 px-1 rounded-md transition-all ${
                isSolved
                  ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-500/30'
                  : 'bg-neutral-200/80 dark:bg-[#1f2023] text-neutral-800 dark:text-neutral-200'
              }`}
            >
              {/* Guess Value */}
              <div className="col-span-2 flex items-center justify-center py-1.5 px-2 font-semibold">
                {guess.value}°
              </div>

              {/* Arrow */}
              <div className="col-span-1 flex items-center justify-center text-base">
                {arrow(guess.value, answer)}
              </div>

              {/* Hint / Temperature */}
              <div className="col-span-3 flex items-center justify-center font-medium">
                {temperature(guess.value, answer)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
