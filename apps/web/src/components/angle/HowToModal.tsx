"use client";

import React from 'react';

interface HowToModalProps {
  open: boolean;
  onClose: () => void;
}

export const HowToModal: React.FC<HowToModalProps> = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#16171a] border border-neutral-200 dark:border-neutral-800 p-5 shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3 mb-4">
          <h2 className="font-boston text-xl font-bold text-neutral-900 dark:text-neutral-100">
            How To Play
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-4 text-xs font-boston leading-relaxed text-neutral-700 dark:text-neutral-300">
          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Guess the angle in 4 tries or less! (0° - 360°)
          </p>

          <p>
            An angle is formed by two rays meeting at a vertex. The subtle blue arc and tinted wedge indicate which side is being measured.
          </p>

          {/* Sample Guess Rows */}
          <div className="p-3 rounded-xl bg-neutral-100 dark:bg-[#1f2023] border border-neutral-200 dark:border-neutral-800 space-y-2">
            <div className="font-bold text-neutral-900 dark:text-neutral-100 text-[11px] uppercase tracking-wider mb-1">
              Feedback Example
            </div>
            <div className="grid grid-cols-6 gap-1.5 text-center font-bold">
              <div className="col-span-2 bg-neutral-200 dark:bg-neutral-800 py-1 rounded">50°</div>
              <div className="col-span-1 bg-neutral-200 dark:bg-neutral-800 py-1 rounded">⬆️</div>
              <div className="col-span-3 bg-neutral-200 dark:bg-neutral-800 py-1 rounded">Getting Hot</div>
            </div>
            <p className="text-[11px] text-neutral-500">
              The arrow <strong>⬆️</strong> tells you the real angle is larger. &ldquo;Getting Hot&rdquo; means you are within 20°.
            </p>
          </div>

          {/* Closeness Ladder */}
          <div>
            <h3 className="font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              Temperature Clues
            </h3>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800/70">
                <span className="font-bold text-[#df6247]">Boiling!🔥</span>
                <span className="text-neutral-500 block">within 5°</span>
              </div>
              <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800/70">
                <span className="font-bold text-[#df6247]">Hot!</span>
                <span className="text-neutral-500 block">within 10°</span>
              </div>
              <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800/70">
                <span className="font-bold text-neutral-800 dark:text-neutral-200">Getting Hot</span>
                <span className="text-neutral-500 block">within 20°</span>
              </div>
              <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800/70">
                <span className="font-bold text-neutral-800 dark:text-neutral-200">Warm</span>
                <span className="text-neutral-500 block">within 50°</span>
              </div>
              <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800/70">
                <span className="font-bold text-neutral-500">Cold!</span>
                <span className="text-neutral-500 block">within 100°</span>
              </div>
              <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800/70">
                <span className="font-bold text-neutral-500">Freezing!🥶</span>
                <span className="text-neutral-500 block">100°+ away</span>
              </div>
            </div>
          </div>

          {/* Round 2 Info */}
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <h3 className="font-bold text-neutral-900 dark:text-neutral-100 mb-1">
              Round 2: Angle Construction
            </h3>
            <p>
              Once you identify the angle, test your spatial intuition by constructing it! Drag the coral ray or use the nudge buttons to match the exact target degrees in 3 attempts or less.
            </p>
          </div>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl font-boston text-sm font-bold text-white bg-[#df6247] hover:bg-[#c9533a] cursor-pointer shadow-sm"
            >
              Got it, let&apos;s play!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
