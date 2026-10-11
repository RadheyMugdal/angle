"use client";

import React from 'react';
import type { GameStats } from '@/lib/angle/types';

interface StatsModalProps {
  open: boolean;
  onClose: () => void;
  stats: GameStats;
}

export const StatsModal: React.FC<StatsModalProps> = ({ open, onClose, stats }) => {
  if (!open) return null;

  const winPct = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;
  const maxGuessesInDist = Math.max(
    1,
    stats.guessDistribution[1],
    stats.guessDistribution[2],
    stats.guessDistribution[3],
    stats.guessDistribution[4]
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#16171a] border border-neutral-200 dark:border-neutral-800 p-5 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3 mb-4">
          <h2 className="font-boston text-xl font-bold text-neutral-900 dark:text-neutral-100">
            Statistics
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* 4 Key Metric Tiles */}
        <div className="grid grid-cols-4 gap-2 text-center mb-6">
          <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-[#1f2024] border border-neutral-100 dark:border-neutral-800/80">
            <div className="font-boston text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {stats.played}
            </div>
            <div className="font-boston text-[10px] uppercase text-neutral-500 tracking-wider mt-0.5">
              Played
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-[#1f2024] border border-neutral-100 dark:border-neutral-800/80">
            <div className="font-boston text-2xl font-bold text-[#df6247]">
              {winPct}%
            </div>
            <div className="font-boston text-[10px] uppercase text-neutral-500 tracking-wider mt-0.5">
              Win %
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-[#1f2024] border border-neutral-100 dark:border-neutral-800/80">
            <div className="font-boston text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {stats.currentStreak}
            </div>
            <div className="font-boston text-[10px] uppercase text-neutral-500 tracking-wider mt-0.5">
              Streak
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-[#1f2024] border border-neutral-100 dark:border-neutral-800/80">
            <div className="font-boston text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {stats.maxStreak}
            </div>
            <div className="font-boston text-[10px] uppercase text-neutral-500 tracking-wider mt-0.5">
              Max
            </div>
          </div>
        </div>

        {/* Guess Distribution Bars */}
        <div className="mb-4">
          <h3 className="font-boston text-xs uppercase tracking-wider text-neutral-500 font-semibold mb-2.5">
            Guess Distribution
          </h3>
          <div className="flex flex-col gap-1.5">
            {([1, 2, 3, 4] as const).map((count) => {
              const val = stats.guessDistribution[count];
              const pct = Math.max(8, Math.round((val / maxGuessesInDist) * 100));
              return (
                <div key={count} className="flex items-center gap-2 font-boston text-xs">
                  <span className="w-3 text-neutral-500 font-bold">{count}</span>
                  <div className="flex-1 bg-neutral-100 dark:bg-neutral-800 rounded-md overflow-hidden h-5">
                    <div
                      style={{ width: `${pct}%` }}
                      className={`h-full flex items-center justify-end px-2 font-bold text-white rounded-md transition-all duration-500 ${
                        val > 0 ? 'bg-[#df6247]' : 'bg-neutral-300 dark:bg-neutral-700 text-neutral-500'
                      }`}
                    >
                      {val}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Round 2 Construction metric */}
        <div className="p-3 rounded-xl bg-[#df6247]/10 flex items-center justify-between text-xs font-boston">
          <span className="text-neutral-700 dark:text-neutral-300 font-medium">
            Round 2 Constructions Completed
          </span>
          <span className="font-bold text-[#df6247] text-sm">
            {stats.round2Completed}
          </span>
        </div>
      </div>
    </div>
  );
};
