"use client";

import React from 'react';
import type { DialMode, TipStyle, UserSettings } from '@/lib/angle/types';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  open,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!open) return null;

  const setTipStyle = (style: TipStyle) => {
    onUpdateSettings({ ...settings, tipStyle: style });
  };

  const setDialMode = (mode: DialMode) => {
    onUpdateSettings({ ...settings, dialMode: mode });
  };

  const toggleHaptics = () => {
    onUpdateSettings({ ...settings, haptics: !settings.haptics });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#16171a] border border-neutral-200 dark:border-neutral-800 p-5 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3 mb-4">
          <h2 className="font-boston text-xl font-bold text-neutral-900 dark:text-neutral-100">
            Settings
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-5">
          {/* Arc Tip Guide Option */}
          <div>
            <div className="font-boston text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Arc Tip Guide
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Visual boundary line tracing the sweep between arm tips
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2.5 font-boston text-xs">
              {(['blurred', 'dashed', 'off'] as const).map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setTipStyle(style)}
                  className={`py-2 px-1 rounded-xl capitalize font-semibold transition-all cursor-pointer ${
                    settings.tipStyle === style
                      ? 'bg-[#df6247] text-white shadow-sm'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Rotary Dial Keyboard Option */}
          <div>
            <div className="font-boston text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Rotary Dial Keyboard
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Two concentric dials (tens and units) for intuitive rotary input
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2.5 font-boston text-xs">
              {(['auto', 'always', 'off'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setDialMode(mode)}
                  className={`py-2 px-1 rounded-xl capitalize font-semibold transition-all cursor-pointer ${
                    settings.dialMode === mode
                      ? 'bg-[#df6247] text-white shadow-sm'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
                >
                  {mode === 'auto' ? 'Auto (Mobile)' : mode}
                </button>
              ))}
            </div>
          </div>

          {/* Haptics Vibration Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <div>
              <div className="font-boston text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Haptic Feedback
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                Subtle vibration for dials and wrong guesses
              </div>
            </div>
            <button
              type="button"
              onClick={toggleHaptics}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.haptics ? 'bg-[#df6247]' : 'bg-neutral-300 dark:bg-neutral-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5 transition-transform ${
                  settings.haptics ? 'left-6.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
