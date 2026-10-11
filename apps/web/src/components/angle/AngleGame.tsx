"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AngleCanvas } from './AngleCanvas';
import { AngleField } from './AngleField';
import { GuessesList } from './GuessesList';
import { DialKeyboard } from './DialKeyboard';
import { ConstructRound } from './ConstructRound';
import { FinalScreen } from './FinalScreen';
import { RoundSteps } from './RoundSteps';
import { AngleNavbar } from './AngleNavbar';
import { StatsModal } from './StatsModal';
import { SettingsModal } from './SettingsModal';
import { HowToModal } from './HowToModal';
import type { DailyRoundRecord, GameMode, Guess, UserSettings } from '@/lib/angle/types';
import {
  getDayString,
  getDailyAngles,
  getRandomAngles,
  getPuzzleNumber,
  parseGuess,
} from '@/lib/angle/gameLogic';
import { MAX_GUESSES } from '@/lib/angle/constants';
import {
  DEFAULT_SETTINGS,
  DEFAULT_STATS,
  loadAllGuesses,
  loadDailyRound,
  loadSettings,
  loadStats,
  recordGameResult,
  saveGuesses,
  saveSettings,
} from '@/lib/angle/storage';
import { buzzSuccess, buzzWrongGuess } from '@/lib/angle/haptics';
import { toast } from 'sonner';

export const AngleGame: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>('daily');
  const dayString = useMemo(() => getDayString(), []);
  const puzzleNumber = useMemo(() => getPuzzleNumber(dayString), [dayString]);

  // Settings & Stats
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [stats, setStats] = useState(DEFAULT_STATS);

  // Modals
  const [howToOpen, setHowToOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Angles setup
  const dailyAngles = useMemo(() => getDailyAngles(dayString), [dayString]);
  const [practiceAngles, setPracticeAngles] = useState(() => getRandomAngles());

  const activeAngles = gameMode === 'daily' ? dailyAngles : practiceAngles;
  const { angle1, angle2, deltaAngle, answer } = activeAngles;

  // Round 1 guesses
  const [dailyGuesses, setDailyGuesses] = useState<Guess[]>([]);
  const [practiceGuesses, setPracticeGuesses] = useState<Guess[]>([]);
  const activeGuesses = gameMode === 'daily' ? dailyGuesses : practiceGuesses;

  // Round 2 record
  const [dailyRound2, setDailyRound2] = useState<DailyRoundRecord | null>(null);
  const [practiceRound2, setPracticeRound2] = useState<DailyRoundRecord | null>(null);
  const activeRound2 = gameMode === 'daily' ? dailyRound2 : practiceRound2;

  // Current view: 'game' | 'round2' | 'final'
  const [view, setView] = useState<'game' | 'round2' | 'final'>('game');
  const [guessInput, setGuessInput] = useState('');

  // Initial client load
  useEffect(() => {
    setMounted(true);
    setSettings(loadSettings());
    setStats(loadStats());

    const savedGuesses = loadAllGuesses()[dayString] ?? [];
    setDailyGuesses(savedGuesses);

    const savedRound2 = loadDailyRound(dayString);
    setDailyRound2(savedRound2);

    const round1Finished =
      savedGuesses.some((g) => g.delta === 0) || savedGuesses.length >= MAX_GUESSES;
    const round2Finished = savedRound2 ? savedRound2.done || savedRound2.solved : false;

    if (round1Finished && round2Finished) {
      setView('final');
    } else if (round1Finished && !round2Finished) {
      setView('game');
    }
  }, [dayString]);

  const isRound1Won = activeGuesses.some((g) => g.delta === 0);
  const isRound1Finished = isRound1Won || activeGuesses.length >= MAX_GUESSES;

  const handleUpdateSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleGuessSubmit = () => {
    if (isRound1Finished) return;

    const parsed = parseGuess(guessInput);
    if (!parsed.ok) {
      toast.error(parsed.reason === 'empty' ? 'Enter an angle first' : 'Valid angles: 0° - 360°');
      return;
    }

    const value = parsed.value;
    const delta = value - answer;
    const newGuess: Guess = { value, delta };
    const updated = [...activeGuesses, newGuess];

    if (gameMode === 'daily') {
      setDailyGuesses(updated);
      saveGuesses(dayString, updated);
    } else {
      setPracticeGuesses(updated);
    }

    setGuessInput('');

    if (delta === 0) {
      if (settings.haptics) buzzSuccess();
      toast.success('Spot on! 🎉', { description: `You guessed the exact angle: ${answer}°` });
      if (gameMode === 'daily') {
        const nextStats = recordGameResult(true, updated.length, false);
        setStats(nextStats);
      }
    } else {
      if (settings.haptics) buzzWrongGuess();
      if (updated.length >= MAX_GUESSES) {
        toast.info(`Round 1 finished! The angle was ${answer}°`);
        if (gameMode === 'daily') {
          const nextStats = recordGameResult(false, updated.length, false);
          setStats(nextStats);
        }
      }
    }
  };

  const handlePracticeNew = useCallback(() => {
    setPracticeAngles(getRandomAngles());
    setPracticeGuesses([]);
    setPracticeRound2(null);
    setView('game');
    setGuessInput('');
  }, []);

  const handleFinishRound2 = (record: DailyRoundRecord) => {
    if (gameMode === 'daily') {
      setDailyRound2(record);
      if (record.solved) {
        setStats(loadStats());
      }
    } else {
      setPracticeRound2(record);
    }
    setView('final');
  };

  const showDialKeyboard = useMemo(() => {
    if (settings.dialMode === 'always') return true;
    if (settings.dialMode === 'off') return false;
    // 'auto' mode: show if on mobile / small screen or touch
    return typeof window !== 'undefined' && (window.innerWidth < 640 || 'ontouchstart' in window);
  }, [settings.dialMode]);

  if (!mounted) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="font-boston text-xl text-neutral-400 animate-pulse">Loading Angle...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full w-full bg-white dark:bg-[#121212] text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* Navigation bar */}
      <AngleNavbar
        puzzleNumber={puzzleNumber}
        gameMode={gameMode}
        onSetGameMode={(mode) => {
          setGameMode(mode);
          setView('game');
        }}
        onOpenHowTo={() => setHowToOpen(true)}
        onOpenStats={() => setStatsOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center max-w-lg w-full mx-auto px-4 py-2">
        {/* Step Progression (Round 1 -> Round 2 -> Results) */}
        <RoundSteps
          round1Done={isRound1Finished}
          inRound2={view === 'round2'}
          view={view}
          onNavigate={(targetView) => setView(targetView)}
          hasRound2={Boolean(activeRound2)}
        />

        {/* View Switcher */}
        {view === 'final' ? (
          <FinalScreen
            win={isRound1Won}
            guesses={activeGuesses}
            answer={answer}
            dayString={dayString}
            round2={activeRound2}
            onStartRound2={() => setView('round2')}
            onBackToGame={() => setView('game')}
            onPracticeNew={handlePracticeNew}
            isPracticeMode={gameMode === 'practice'}
          />
        ) : view === 'round2' ? (
          <ConstructRound
            dayString={dayString}
            target={answer}
            initialRecord={activeRound2}
            onFinish={handleFinishRound2}
            hapticsEnabled={settings.haptics}
          />
        ) : (
          /* Round 1: Guess Mode */
          <div className="w-full flex flex-col items-center">
            {/* SVG Angle Canvas */}
            <AngleCanvas
              angle1={angle1}
              angle2={angle2}
              largeArc={deltaAngle > Math.PI}
              answer={isRound1Finished ? answer : null}
              tipStyle={settings.tipStyle}
            />

            {/* If Round 1 is finished, show transition actions */}
            {isRound1Finished ? (
              <div className="w-full max-w-[320px] flex flex-col items-center gap-2 my-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {!activeRound2?.done && !activeRound2?.solved ? (
                  <button
                    type="button"
                    onClick={() => setView('round2')}
                    className="w-full py-2.5 px-4 rounded-xl font-boston text-base font-bold text-white bg-[#df6247] hover:bg-[#c9533a] active:scale-[0.98] transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>📐</span>
                    <span>Round 2 · Construct {answer}°</span>
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={() => setView('final')}
                  className="w-full py-2 px-4 rounded-xl font-boston text-sm font-semibold text-[#df6247] bg-[#df6247]/10 hover:bg-[#df6247]/20 transition-all cursor-pointer"
                >
                  See Results &amp; Share →
                </button>
              </div>
            ) : (
              /* Input Area with Stepper & Guess! */
              <AngleField
                value={guessInput}
                onChange={setGuessInput}
                onEnter={handleGuessSubmit}
                onGuess={handleGuessSubmit}
                disabled={isRound1Finished}
              />
            )}

            {/* Guess Ladder & Attempt counter */}
            <GuessesList guesses={activeGuesses} answer={answer} />

            {/* Rotary Dial Keyboard for mobile / touch or if enabled */}
            {showDialKeyboard && !isRound1Finished && (
              <DialKeyboard
                value={guessInput}
                onChange={setGuessInput}
                hapticsEnabled={settings.haptics}
              />
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <HowToModal open={howToOpen} onClose={() => setHowToOpen(false)} />
      <StatsModal open={statsOpen} onClose={() => setStatsOpen(false)} stats={stats} />
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />
    </div>
  );
};
