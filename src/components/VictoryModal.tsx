import React, { useEffect } from 'react';
import { Star, Trophy, ArrowRight, RotateCcw } from 'lucide-react';
import { SoundEngine } from '../utils/audio';

interface VictoryModalProps {
  isOpen: boolean;
  level: number;
  totalLevels: number;
  moves: number;
  par: number;
  onNextLevel: () => void;
  onReplay: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  level,
  totalLevels,
  moves,
  par,
  onNextLevel,
  onReplay,
}) => {
  const starsEarned = moves <= par ? 3 : moves <= par + 3 ? 2 : 1;
  const isFinalLevel = level >= totalLevels;

  useEffect(() => {
    if (isOpen) {
      SoundEngine.win();
      // Play star chimes sequentially
      for (let i = 0; i < starsEarned; i++) {
        setTimeout(() => {
          SoundEngine.star(i);
        }, 250 + i * 180);
      }
    }
  }, [isOpen, starsEarned]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#1e222b] border border-amber-500/40 rounded-3xl w-full max-w-sm p-6 text-center shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(245,158,11,0.2)] animate-pop relative overflow-hidden">
        {/* Glow Accent Header Backdrop */}
        <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-amber-500/20 to-transparent pointer-events-none" />

        {/* Level Banner */}
        <div className="relative mb-2 flex flex-col items-center">
          <img
            src="/assets/aistudio/SEEMA_Parking_Puzzle_Icon__1__2505aaee.png"
            alt="Seema Logo"
            className="w-14 h-14 object-contain rounded-2xl shadow-lg border border-amber-400/40 mb-2 drop-shadow-[0_0_12px_rgba(245,158,11,0.3)]"
          />
          <span className="text-[11px] font-mono tracking-widest text-amber-400 uppercase font-semibold">
            {isFinalLevel ? 'CHAMPIONSHIP COMPLETE' : `LEVEL ${level} COMPLETED`}
          </span>
          <h2 className="font-heading font-black text-4xl text-white tracking-tight uppercase mt-0.5">
            {isFinalLevel ? 'ALL LEVELS CLEARED!' : 'PARKED!'}
          </h2>
        </div>

        {/* 3 Stars with Pop Animation */}
        <div className="flex items-center justify-center gap-3 my-4">
          {[1, 2, 3].map((starNum, idx) => {
            const hasStar = starNum <= starsEarned;
            return (
              <div
                key={starNum}
                style={{ animationDelay: `${250 + idx * 180}ms` }}
                className={`transform transition-all ${hasStar ? 'animate-star' : 'opacity-25'}`}
              >
                <Star
                  className={`w-12 h-12 ${
                    hasStar
                      ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.7)]'
                      : 'text-zinc-600'
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Performance Description */}
        <div className="bg-zinc-900/80 rounded-2xl p-4 my-4 border border-zinc-800 text-center">
          <div className="flex items-center justify-around">
            <div>
              <div className="text-[10px] uppercase font-mono text-zinc-400 font-medium">Your Moves</div>
              <div
                className={`font-heading text-3xl font-bold ${
                  moves <= par ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {moves}
              </div>
            </div>

            <div className="w-[1px] h-8 bg-zinc-800" />

            <div>
              <div className="text-[10px] uppercase font-mono text-zinc-400 font-medium">Best Par</div>
              <div className="font-heading text-3xl font-bold text-zinc-200">{par}</div>
            </div>
          </div>

          <p className="text-xs text-zinc-400 mt-2">
            {moves <= par
              ? '✨ Perfect score! Optimal path achieved.'
              : moves <= par + 3
              ? 'Great run! Only a few moves from perfection.'
              : 'Cleared! Replay to find the optimal par solution.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 mt-4">
          <button
            onClick={() => {
              SoundEngine.click();
              onNextLevel();
            }}
            className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-heading text-xl font-bold tracking-wide uppercase shadow-lg shadow-amber-500/25 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <span>{isFinalLevel ? 'Play From Level 1' : 'Next Level'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          {starsEarned < 3 && (
            <button
              onClick={() => {
                SoundEngine.click();
                onReplay();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 hover:text-white font-medium text-xs transition-colors flex items-center justify-center gap-1.5 border border-zinc-700/50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Replay for 3 Stars</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
