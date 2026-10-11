"use client";

import Image from "next/image";
import type React from "react";
import { ModeToggle } from "@/components/mode-toggle";
import type { GameMode } from "@/lib/angle/types";

interface AngleNavbarProps {
  gameMode: GameMode;
  onOpenHowTo: () => void;
  onOpenSettings: () => void;
  onOpenStats: () => void;
  onSetGameMode: (mode: GameMode) => void;
  puzzleNumber: number;
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
    <header className="sticky top-0 z-30 w-full select-none border-neutral-200 border-b bg-white/90 backdrop-blur dark:border-neutral-800 dark:bg-[#121212]/90">
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between gap-2 px-3">
        {/* Left: How-to & Mode switcher */}
        <div className="flex flex-1 items-center justify-start gap-1.5">
          <button
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full font-boston text-base text-neutral-600 transition-colors hover:bg-[#df6247]/10 hover:text-[#df6247] dark:text-neutral-400"
            onClick={onOpenHowTo}
            title="How to play"
            type="button"
          >
            ?
          </button>

          {/* Mode Pill Toggle */}
          <div className="flex items-center rounded-full bg-neutral-100 p-0.5 font-boston font-semibold text-[11px] dark:bg-neutral-800">
            <button
              className={`cursor-pointer rounded-full px-2.5 py-1 transition-all ${
                gameMode === "daily"
                  ? "bg-white text-[#df6247] shadow-sm dark:bg-[#1f2024]"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
              }`}
              onClick={() => onSetGameMode("daily")}
              type="button"
            >
              Daily #{puzzleNumber}
            </button>
            <button
              className={`cursor-pointer rounded-full px-2.5 py-1 transition-all ${
                gameMode === "practice"
                  ? "bg-white text-[#df6247] shadow-sm dark:bg-[#1f2024]"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
              }`}
              onClick={() => onSetGameMode("practice")}
              type="button"
            >
              Practice
            </button>
          </div>
        </div>

        {/* Center: Brand */}
        <div className="flex cursor-pointer select-none items-center gap-2">
          <div className="relative h-6 w-6 sm:h-7 sm:w-7">
            <Image
              alt="Angle Logo"
              className="object-contain"
              fill
              priority
              src="/images/angle.svg"
            />
          </div>
          <span className="font-bold font-boston text-2xl text-[#df6247] leading-none tracking-wider sm:text-[26px]">
            ANGLE
          </span>
        </div>

        {/* Right: Stats, Settings, Theme */}
        <div className="flex flex-1 items-center justify-end gap-1.5">
          {/* Stats Button */}
          <button
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[#df6247] transition-colors hover:bg-[#df6247]/10"
            onClick={onOpenStats}
            title="Statistics"
            type="button"
          >
            <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
              <path d="M16 11V3H8v6H2v12h20V11h-6zm-6-6h4v14h-4V5zm-6 8h4v6H4v-6zm16 6h-4v-8h4v8z" />
            </svg>
          </button>

          {/* Settings Button */}
          <button
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-[#df6247]/10 hover:text-[#df6247] dark:text-neutral-400"
            onClick={onOpenSettings}
            title="Settings"
            type="button"
          >
            <svg
              className="h-4.5 w-4.5 fill-none stroke-2 stroke-current"
              viewBox="0 0 24 24"
            >
              <path
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Theme Mode Toggle */}
          <div className="scale-85">
            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};
