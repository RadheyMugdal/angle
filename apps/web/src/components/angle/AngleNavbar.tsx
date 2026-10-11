"use client";

import React from 'react';
import Image from 'next/image';
import { ModeToggle } from '@/components/mode-toggle';
import UserMenu from '@/components/user-menu';
import type { GameMode } from '@/lib/angle/types';

interface AngleNavbarProps {
  puzzleNumber: number;
  gameMode: GameMode;
  onSetGameMode: (mode: GameMode) => void;
  onOpenHowTo: () => void;
  onOpenStats: () => void;
  onOpenSettings: () => void;
}

export const AngleNavbar: React.FC<AngleNavbarProps> = ({
  puzzleNumber,
  gameMode,
  onSetGameMode,
  onOpenHowTo,
  onOpenStats,
  onOpenSettings,
}) => {
  return (
    <header className="w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-[#121212]/90 backdrop-blur sticky top-0 z-30 select-none">
      <div className="max-w-2xl mx-auto px-3 h-14 flex items-center justify-between gap-2">
        {/* Left: How-to & Mode switcher */}
        <div className="flex items-center gap-1.5 flex-1 justify-start">
          <button
            type="button"
            onClick={onOpenHowTo}
            title="How to play"
            className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-600 dark:text-neutral-400 hover:text-[#df6247] hover:bg-[#df6247]/10 transition-colors font-boston text-base cursor-pointer"
          >
            ?
          </button>

          {/* Mode Pill Toggle */}
          <div className="flex items-center p-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-[11px] font-boston font-semibold">
            <button
              type="button"
              onClick={() => onSetGameMode('daily')}
              className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                gameMode === 'daily'
                  ? 'bg-white dark:bg-[#1f2024] text-[#df6247] shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              Daily #{puzzleNumber}
            </button>
            <button
              type="button"
              onClick={() => onSetGameMode('practice')}
              className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                gameMode === 'practice'
                  ? 'bg-white dark:bg-[#1f2024] text-[#df6247] shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              Practice
            </button>
          </div>
        </div>

        {/* Center: Brand */}
        <div className="flex items-center gap-2 cursor-pointer select-none">
          <div className="relative w-6 h-6 sm:w-7 sm:h-7">
            <Image
              src="/images/angle.svg"
              alt="Angle Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="font-boston text-2xl sm:text-[26px] font-bold text-[#df6247] tracking-wider leading-none">
            ANGLE
          </span>
        </div>

        {/* Right: Stats, Settings, Theme, UserMenu */}
        <div className="flex items-center gap-1.5 flex-1 justify-end">
          {/* Stats Button */}
          <button
            type="button"
            onClick={onOpenStats}
            title="Statistics"
            className="w-8 h-8 flex items-center justify-center rounded-full text-[#df6247] hover:bg-[#df6247]/10 transition-colors cursor-pointer"
          >
            <svg
              className="w-5 h-5 fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M16 11V3H8v6H2v12h20V11h-6zm-6-6h4v14h-4V5zm-6 8h4v6H4v-6zm16 6h-4v-8h4v8z" />
            </svg>
          </button>

          {/* Settings Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            title="Settings"
            className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-600 dark:text-neutral-400 hover:text-[#df6247] hover:bg-[#df6247]/10 transition-colors cursor-pointer"
          >
            <svg
              className="w-4.5 h-4.5 fill-none stroke-current stroke-2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* Theme Mode Toggle */}
          <div className="scale-85">
            <ModeToggle />
          </div>

          {/* User Menu */}
          <div className="scale-85 origin-right">
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
};
