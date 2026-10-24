import React from 'react';
import { Volume2, VolumeX, Grid, HelpCircle, ChevronLeft, ChevronRight, Trophy } from 'lucide-react';
import { SoundEngine } from '../utils/audio';

interface GameHeaderProps {
  currentLevel: number;
  totalLevels: number;
  unlockedLevel: number;
  moves: number;
  par: number;
  starsCount: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenLevelSelect: () => void;
  onOpenRules: () => void;
  onPrevLevel: () => void;
  onNextLevel: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  currentLevel,
  totalLevels,
  unlockedLevel,
  moves,
  par,
  starsCount,
  isMuted,
  onToggleMute,
  onOpenLevelSelect,
  onOpenRules,
  onPrevLevel,
  onNextLevel,
}) => {
  return (
    <header className="w-full max-w-xl mx-auto px-4 pt-3 pb-2 flex flex-col gap-3">
      {/* Top 3-Zone Bar */}
      <div className="flex items-center justify-between gap-4 border-b border-zinc-800/80 pb-3">
        {/* Zone 1: Wordmark & Game Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <img
            src="/assets/aistudio/SEEMA_Parking_Puzzle_Icon__1__2505aaee.png"
            alt="Seema Game Logo"
            className="w-10 h-10 object-contain rounded-xl shadow-[0_2px_12px_rgba(245,158,11,0.35)] border border-amber-400/30"
          />
          <div className="flex flex-col">
            <span className="font-heading font-black text-2xl sm:text-3xl tracking-wide uppercase leading-none bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-400 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(245,158,11,0.25)]">
              SEEMA
            </span>
            <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase leading-tight">
              Parking Puzzle
            </span>
          </div>
        </div>

        {/* Zone 2: Star Career & Stats */}
        <div className="flex items-center gap-4 text-xs font-medium text-zinc-400">
          <div className="flex items-center gap-1.5 text-amber-400 font-mono">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="font-bold text-sm text-white tabular-nums">{starsCount}</span>
            <span className="text-[10px] text-zinc-500">/ {totalLevels * 3} ★</span>
          </div>
        </div>

        {/* Zone 3: Functional Utility Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onToggleMute}
            aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            className="p-2 rounded-lg bg-zinc-800/70 hover:bg-zinc-700/80 text-zinc-300 hover:text-white transition-colors border border-zinc-700/50"
            title={isMuted ? 'Sound Muted' : 'Sound On'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-zinc-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>

          <button
            onClick={onOpenRules}
            aria-label="How to Play"
            className="p-2 rounded-lg bg-zinc-800/70 hover:bg-zinc-700/80 text-zinc-300 hover:text-white transition-colors border border-zinc-700/50"
            title="How to Play"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenLevelSelect}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700/60 shadow-sm transition-all"
          >
            <Grid className="w-3.5 h-3.5 text-amber-400" />
            <span>Levels</span>
          </button>
        </div>
      </div>

      {/* Level Navigation & Live HUD Stats */}
      <div className="flex items-center justify-between gap-3 pt-1">
        {/* Level Switcher */}
        <div className="flex items-center gap-1.5 bg-zinc-900/80 px-2 py-1 rounded-xl border border-zinc-800 shadow-inner">
          <button
            onClick={() => {
              SoundEngine.click();
              onPrevLevel();
            }}
            disabled={currentLevel <= 1}
            aria-label="Previous level"
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="px-3 text-center min-w-[100px]">
            <span className="font-heading text-lg font-bold text-white tracking-wide block leading-tight">
              LEVEL {currentLevel}
            </span>
            <span className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase">
              of {totalLevels}
            </span>
          </div>

          <button
            onClick={() => {
              SoundEngine.click();
              onNextLevel();
            }}
            disabled={currentLevel >= unlockedLevel}
            aria-label="Next level"
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Moves & Par Meter */}
        <div className="flex items-center gap-4 bg-zinc-900/80 px-4 py-1.5 rounded-xl border border-zinc-800 shadow-inner">
          <div className="text-right">
            <div className="text-[10px] tracking-wider uppercase text-zinc-400 font-semibold">Moves</div>
            <div
              className={`font-heading text-2xl font-bold leading-tight tabular-nums transition-transform ${
                moves > par ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {moves}
            </div>
          </div>

          <div className="w-[1px] h-7 bg-zinc-800" />

          <div className="text-left">
            <div className="text-[10px] tracking-wider uppercase text-zinc-400 font-semibold">Best Par</div>
            <div className="font-heading text-2xl font-bold leading-tight text-zinc-200 tabular-nums">
              {par}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
