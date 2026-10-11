"use client";

import React, { useState } from 'react';
import type { DailyRoundRecord, Guess } from '@/lib/angle/types';
import { buildShareText, getGuessRow, getPuzzleNumber } from '@/lib/angle/gameLogic';
import { MAX_GUESSES, SQUARE_COUNT } from '@/lib/angle/constants';
import { toast } from 'sonner';

interface FinalScreenProps {
  win: boolean;
  guesses: Guess[];
  answer: number;
  dayString: string;
  round2: DailyRoundRecord | null;
  onStartRound2: () => void;
  onBackToGame: () => void;
  onPracticeNew?: () => void;
  isPracticeMode?: boolean;
}

export const FinalScreen: React.FC<FinalScreenProps> = ({
  win,
  guesses,
  answer,
  dayString,
  round2,
  onStartRound2,
  onBackToGame,
  onPracticeNew,
  isPracticeMode = false,
}) => {
  const [copied, setCopied] = useState(false);
  const puzzleNumber = getPuzzleNumber(dayString);
  const playedRound2 = Boolean(round2 && !round2.skipped && round2.attempts?.length > 0);
  const round2Solved = Boolean(round2?.solved);

  const handleShare = async () => {
    const text = buildShareText({
      dayString,
      guesses,
      win,
      round2,
    });

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const area = document.createElement('textarea');
        area.value = text;
        document.body.appendChild(area);
        area.select();
        document.execCommand('copy');
        document.body.removeChild(area);
      }
      setCopied(true);
      toast.success('Results copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Could not copy to clipboard.');
    }
  };

  const rows = guesses.map(getGuessRow);

  return (
    <div className="w-full max-w-[340px] sm:max-w-[380px] mx-auto text-center flex flex-col items-center py-4 px-2 animate-in fade-in zoom-in-95 duration-300">
      {/* Outcome Title */}
      <h1
        className={`font-boston text-3xl font-extrabold leading-tight ${
          win ? 'text-[#df6247]' : 'text-neutral-800 dark:text-neutral-200'
        }`}
      >
        {win ? `Solved in ${guesses.length}/${MAX_GUESSES}` : 'Not solved'}
      </h1>

      {/* Angle number and degree */}
      <p className="font-boston text-sm text-neutral-500 dark:text-neutral-400 mt-1">
        {isPracticeMode ? 'Practice Round' : `Angle #${puzzleNumber}`} · the angle was{' '}
        <span className="font-bold text-neutral-900 dark:text-neutral-100">{answer}°</span>
      </p>

      {/* Visual Result Grid */}
      <div className="flex flex-col gap-1.5 my-5 p-3 rounded-2xl bg-neutral-100 dark:bg-[#1b1c20] border border-neutral-200 dark:border-neutral-800 shadow-sm w-full max-w-[260px]">
        {rows.map((row, idx) => (
          <div key={idx} className="flex items-center justify-center gap-1.5 font-boston">
            {/* Direction Arrow */}
            <span className="w-6 text-center text-sm">
              {row.direction === 'solved' ? '🎉' : row.direction === 'up' ? '⬆️' : '⬇️'}
            </span>
            {/* 5 Blocks */}
            <div className="flex items-center gap-1">
              {Array.from({ length: SQUARE_COUNT }).map((_, blockIdx) => {
                const isFilled = blockIdx < row.filled;
                const isWin = row.direction === 'solved';
                return (
                  <div
                    key={blockIdx}
                    className={`w-5 h-5 rounded-[4px] transition-all ${
                      isWin
                        ? 'bg-emerald-500 shadow-sm'
                        : isFilled
                          ? 'bg-amber-500 shadow-sm'
                          : 'bg-neutral-300 dark:bg-neutral-700'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Round 2 Status / Offer */}
      {playedRound2 ? (
        <div className="font-boston text-xs text-neutral-600 dark:text-neutral-400 mb-4 p-2 rounded-lg bg-neutral-100 dark:bg-[#1f2023] w-full">
          Round 2 Construction: {round2Solved ? `✓ Solved in ${round2?.attempts.length} attempts` : '✕ Not solved'}
        </div>
      ) : (
        <button
          type="button"
          onClick={onStartRound2}
          className="w-full mb-3 py-2.5 px-4 rounded-xl font-boston text-sm font-bold text-[#df6247] bg-[#df6247]/10 hover:bg-[#df6247]/20 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <span>📐</span>
          <span>Round 2 · Construct {answer}°</span>
        </button>
      )}

      {/* Share Score Button */}
      <button
        type="button"
        onClick={handleShare}
        className="w-full py-3 rounded-xl font-boston text-base font-bold text-white bg-[#df6247] hover:bg-[#c9533a] active:scale-[0.98] transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
      >
        <span>{copied ? '✓ Copied!' : 'Share Result'}</span>
      </button>

      {/* Practice Next or Back navigation */}
      <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-800 w-full">
        {isPracticeMode && onPracticeNew && (
          <button
            type="button"
            onClick={onPracticeNew}
            className="font-boston text-sm font-semibold text-[#df6247] hover:underline cursor-pointer"
          >
            Play Another Angle →
          </button>
        )}
        <button
          type="button"
          onClick={onBackToGame}
          className="font-boston text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer"
        >
          ← Back to drawing
        </button>
      </div>
    </div>
  );
};
