import React from 'react';
import { RotateCcw, Undo2, Lightbulb, Play, Square } from 'lucide-react';
import { SoundEngine } from '../utils/audio';

interface GameControlsProps {
  canUndo: boolean;
  isWon: boolean;
  isAutoSolving: boolean;
  onUndo: () => void;
  onReset: () => void;
  onHint: () => void;
  onToggleAutoSolve: () => void;
}

export const GameControls: React.FC<GameControlsProps> = ({
  canUndo,
  isWon,
  isAutoSolving,
  onUndo,
  onReset,
  onHint,
  onToggleAutoSolve,
}) => {
  return (
    <div className="w-full max-w-xl mx-auto px-4 py-2 flex flex-col items-center gap-3">
      {/* Action Buttons Toolbar */}
      <div className="flex items-center justify-center gap-2 flex-wrap w-full">
        {/* Undo */}
        <button
          onClick={() => {
            SoundEngine.undo();
            onUndo();
          }}
          disabled={!canUndo || isWon || isAutoSolving}
          className="flex-1 min-w-[76px] py-2.5 px-3 rounded-xl bg-zinc-800/90 hover:bg-zinc-700/90 active:scale-95 text-zinc-200 hover:text-white font-semibold text-sm border border-zinc-700/50 shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-30 disabled:pointer-events-none"
          title="Undo last move (Key: U or Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4 text-sky-400" />
          <span>Undo</span>
        </button>

        {/* Restart */}
        <button
          onClick={() => {
            SoundEngine.click();
            onReset();
          }}
          disabled={isAutoSolving}
          className="flex-1 min-w-[76px] py-2.5 px-3 rounded-xl bg-zinc-800/90 hover:bg-zinc-700/90 active:scale-95 text-zinc-200 hover:text-white font-semibold text-sm border border-zinc-700/50 shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-30"
          title="Restart current level (Key: R)"
        >
          <RotateCcw className="w-4 h-4 text-emerald-400" />
          <span>Restart</span>
        </button>

        {/* Hint */}
        <button
          onClick={() => {
            SoundEngine.hint();
            onHint();
          }}
          disabled={isWon || isAutoSolving}
          className="flex-1 min-w-[76px] py-2.5 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 active:scale-95 text-amber-300 font-semibold text-sm border border-amber-500/30 shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-30 disabled:pointer-events-none"
          title="Show next optimal move (Key: H)"
        >
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <span>Hint</span>
        </button>

        {/* Auto Solve */}
        <button
          onClick={() => {
            SoundEngine.click();
            onToggleAutoSolve();
          }}
          disabled={isWon}
          className={`flex-1 min-w-[96px] py-2.5 px-3 rounded-xl font-semibold text-sm border shadow-md transition-all flex items-center justify-center gap-1.5 ${
            isAutoSolving
              ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border-red-500/40 animate-pulse'
              : 'bg-zinc-800/90 hover:bg-zinc-700/90 text-zinc-200 hover:text-white border-zinc-700/50'
          }`}
          title={isAutoSolving ? 'Stop Auto-Solve' : 'Watch AI Solver play step-by-step'}
        >
          {isAutoSolving ? (
            <>
              <Square className="w-4 h-4 text-red-400 fill-current" />
              <span>Stop</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 text-violet-400" />
              <span>Solve</span>
            </>
          )}
        </button>
      </div>

      {/* Helpful Subtle Gameplay Prompt */}
      <p className="text-xs text-zinc-400/90 text-center max-w-sm px-2 leading-relaxed">
        Slide blocking vehicles to open a direct lane, then drive the{' '}
        <span className="text-red-400 font-semibold">Red GT car</span> out through the exit on the right.
      </p>
    </div>
  );
};
