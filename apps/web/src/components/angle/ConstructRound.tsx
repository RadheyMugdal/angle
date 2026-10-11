"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { ConstructBoard } from './ConstructBoard';
import type { ConstructVerdict, DailyRoundRecord } from '@/lib/angle/types';
import {
  dailyFixedAngle,
  dailyStartSweep,
  judge,
  normaliseSweep,
} from '@/lib/angle/gameLogic';
import { saveDailyRound } from '@/lib/angle/storage';
import { MAX_CONSTRUCT_ATTEMPTS } from '@/lib/angle/constants';
import { buzzSuccess, buzzWrongGuess } from '@/lib/angle/haptics';

interface ConstructRoundProps {
  dayString: string;
  target: number;
  initialRecord: DailyRoundRecord | null;
  onFinish: (record: DailyRoundRecord) => void;
  hapticsEnabled?: boolean;
}

export const ConstructRound: React.FC<ConstructRoundProps> = ({
  dayString,
  target,
  initialRecord,
  onFinish,
  hapticsEnabled = true,
}) => {
  const fixedAngle = dailyFixedAngle(dayString);

  const [attempts, setAttempts] = useState<number[]>(() => initialRecord?.attempts ?? []);
  const [feedback, setFeedback] = useState<ConstructVerdict[]>(() => {
    if (!initialRecord?.attempts) return [];
    return initialRecord.attempts
      .map((p) => judge(p, target))
      .filter((v) => !v.solved);
  });

  const [sweep, setSweep] = useState<number>(() =>
    dailyStartSweep(dayString, (initialRecord?.attempts ?? []).length, target)
  );

  const solved = attempts.some((p) => judge(p, target).solved);
  const finished = solved || attempts.length >= MAX_CONSTRUCT_ATTEMPTS;

  useEffect(() => {
    if (!finished) {
      setSweep(dailyStartSweep(dayString, attempts.length, target));
    }
  }, [attempts.length, dayString, target, finished]);

  const nudge = useCallback((delta: number) => {
    setSweep((val) => (((val + delta) % 360) + 360) % 360);
  }, []);

  const handleCommit = () => {
    if (finished) return;

    const verdict = judge(normaliseSweep(sweep), target);
    const nextAttempts = [...attempts, verdict.produced];
    setAttempts(nextAttempts);

    if (!verdict.solved) {
      setFeedback((prev) => [...prev, verdict]);
      if (hapticsEnabled) buzzWrongGuess();
    } else {
      if (hapticsEnabled) buzzSuccess();
    }

    const done = verdict.solved || nextAttempts.length >= MAX_CONSTRUCT_ATTEMPTS;
    const record: DailyRoundRecord = {
      attempts: nextAttempts,
      solved: verdict.solved,
      done,
    };

    saveDailyRound(dayString, record);

    if (done) {
      setTimeout(() => {
        onFinish(record);
      }, 1400);
    }
  };

  return (
    <div className="w-full max-w-[340px] sm:max-w-[380px] mx-auto flex flex-col items-center">
      {/* Target heading */}
      <div className="text-center my-1">
        <h2 className="font-boston text-2xl font-bold text-[#df6247]">
          Round 2 · Make {target}°
        </h2>
        <p className="font-boston text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
          Rotate the coral ray to draw the angle ({attempts.length}/{MAX_CONSTRUCT_ATTEMPTS} attempts)
        </p>
      </div>

      {/* Board */}
      <ConstructBoard
        fixedAngle={fixedAngle}
        sweep={sweep}
        onSweepChange={setSweep}
        attempts={attempts}
        target={target}
        finished={finished}
        disabled={finished}
      />

      {/* Nudge Controls and Submit */}
      {!finished && (
        <div className="w-full flex flex-col items-center gap-2.5 mt-2">
          {/* Fine Tuning Buttons */}
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => nudge(-5)}
              className="px-2.5 py-1 rounded-lg font-boston text-sm font-semibold bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 active:scale-95 transition-all cursor-pointer"
            >
              −5°
            </button>
            <button
              type="button"
              onClick={() => nudge(-1)}
              className="px-2.5 py-1 rounded-lg font-boston text-sm font-semibold bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 active:scale-95 transition-all cursor-pointer"
            >
              −1°
            </button>
            <div className="w-px h-5 bg-neutral-300 dark:bg-neutral-700 mx-1" />
            <button
              type="button"
              onClick={() => nudge(1)}
              className="px-2.5 py-1 rounded-lg font-boston text-sm font-semibold bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 active:scale-95 transition-all cursor-pointer"
            >
              +1°
            </button>
            <button
              type="button"
              onClick={() => nudge(5)}
              className="px-2.5 py-1 rounded-lg font-boston text-sm font-semibold bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 active:scale-95 transition-all cursor-pointer"
            >
              +5°
            </button>
          </div>

          {/* Commit Button */}
          <button
            type="button"
            onClick={handleCommit}
            className="w-full py-2.5 rounded-xl font-boston text-base font-semibold text-white bg-[#df6247] hover:bg-[#c9533a] active:scale-[0.98] transition-all shadow-sm cursor-pointer"
          >
            Check Angle!
          </button>
        </div>
      )}

      {/* Construct feedback ladder */}
      <div className="w-full flex flex-col gap-1.5 mt-3">
        {feedback.map((item, idx) => (
          <div
            key={idx}
            className="grid grid-cols-6 gap-1 font-boston text-sm py-1.5 px-2 rounded-md bg-neutral-200/80 dark:bg-[#1f2023] text-neutral-800 dark:text-neutral-200"
          >
            <div className="col-span-2 text-center font-semibold">{item.produced}°</div>
            <div className="col-span-1 text-center font-bold">
              {item.direction === 'wider' ? '⬆️' : '⬇️'}
            </div>
            <div className="col-span-3 text-center font-medium">{item.label}</div>
          </div>
        ))}

        {solved && (
          <div className="font-boston text-sm font-semibold text-center py-2 px-3 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
            🎉 Made it in {attempts.length} {attempts.length === 1 ? 'attempt' : 'attempts'}!
          </div>
        )}

        {finished && !solved && (
          <div className="font-boston text-sm font-semibold text-center py-2 px-3 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
            Out of attempts! The target was {target}° (green ray).
          </div>
        )}

        {finished && (
          <button
            type="button"
            onClick={() => onFinish({ attempts, solved, done: true })}
            className="mt-2 w-full py-2 rounded-xl font-boston text-sm font-semibold text-[#df6247] bg-[#df6247]/10 hover:bg-[#df6247]/20 transition-all cursor-pointer"
          >
            See Results &amp; Share →
          </button>
        )}
      </div>
    </div>
  );
};
