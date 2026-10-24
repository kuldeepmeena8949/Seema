import React, { useState, useEffect, useRef } from 'react';
import { X, Lock, Star, Search, Sparkles } from 'lucide-react';
import { SoundEngine } from '../utils/audio';

interface LevelSelectModalProps {
  isOpen: boolean;
  currentLevel: number;
  unlockedLevel: number;
  totalLevels: number;
  starsMap: Record<number, number>;
  onSelectLevel: (lvl: number) => void;
  onClose: () => void;
}

const TIERS = [
  { name: 'Novice', start: 1, end: 30, color: 'text-emerald-400' },
  { name: 'Commuter', start: 31, end: 70, color: 'text-sky-400' },
  { name: 'Rush Hour', start: 71, end: 110, color: 'text-amber-400' },
  { name: 'Master', start: 111, end: 150, color: 'text-rose-400' },
];

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  isOpen,
  currentLevel,
  unlockedLevel,
  totalLevels,
  starsMap,
  onSelectLevel,
  onClose,
}) => {
  const [selectedTier, setSelectedTier] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const currentButtonRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll to current level on open
  useEffect(() => {
    if (isOpen) {
      // Find tier of current level
      const tierIdx = TIERS.findIndex((t) => currentLevel >= t.start && currentLevel <= t.end);
      if (tierIdx !== -1) {
        setSelectedTier(tierIdx);
      }
      setTimeout(() => {
        if (currentButtonRef.current) {
          currentButtonRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
      }, 100);
    }
  }, [isOpen, currentLevel]);

  if (!isOpen) return null;

  const currentTier = TIERS[selectedTier];
  let filteredLevels: number[] = [];

  if (searchQuery.trim()) {
    const q = parseInt(searchQuery.trim(), 10);
    if (!isNaN(q) && q >= 1 && q <= totalLevels) {
      filteredLevels = [q];
    } else {
      // Show matching levels
      for (let i = 1; i <= totalLevels; i++) {
        if (i.toString().includes(searchQuery.trim())) {
          filteredLevels.push(i);
        }
      }
    }
  } else {
    for (let i = currentTier.start; i <= currentTier.end; i++) {
      filteredLevels.push(i);
    }
  }

  // Calculate total stars
  const totalStarsEarned = Object.values(starsMap).reduce((a, b) => a + b, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#1c1f26] border border-zinc-700/60 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[88vh] animate-pop">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/assets/aistudio/SEEMA_Parking_Puzzle_Icon__1__2505aaee.png"
              alt="Seema Logo"
              className="w-10 h-10 object-contain rounded-xl shadow-md border border-amber-400/30"
            />
            <div>
              <h2 className="font-heading text-2xl font-bold text-white tracking-wide uppercase flex items-center gap-2">
                <span>SEEMA LEVELS</span>
                <span className="text-xs font-mono font-normal text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  {totalStarsEarned} / {totalLevels * 3} ★
                </span>
              </h2>
              <p className="text-xs text-zinc-400">Choose from 150 parking puzzles</p>
            </div>
          </div>

          <button
            onClick={() => {
              SoundEngine.click();
              onClose();
            }}
            aria-label="Close Level Select"
            className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tier Tabs & Search */}
        <div className="p-3 bg-zinc-900/60 border-b border-zinc-800 flex flex-col gap-2">
          {/* Tier Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
            {TIERS.map((tier, idx) => (
              <button
                key={tier.name}
                onClick={() => {
                  SoundEngine.click();
                  setSelectedTier(idx);
                  setSearchQuery('');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedTier === idx && !searchQuery
                    ? 'bg-zinc-700 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                }`}
              >
                <span className={tier.color}>{tier.name}</span>
                <span className="text-[10px] text-zinc-500 ml-1">
                  ({tier.start}-{tier.end})
                </span>
              </button>
            ))}
          </div>

          {/* Search / Direct Jump */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search or jump to level (1-150)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-800/70 border border-zinc-700/60 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Levels Grid */}
        <div className="p-4 overflow-y-auto flex-1 grid grid-cols-5 gap-2.5">
          {filteredLevels.map((lvl) => {
            const isUnlocked = lvl <= unlockedLevel;
            const isCurrent = lvl === currentLevel;
            const stars = starsMap[lvl] || 0;

            return (
              <button
                key={lvl}
                ref={isCurrent ? currentButtonRef : null}
                onClick={() => {
                  if (isUnlocked) {
                    SoundEngine.click();
                    onSelectLevel(lvl);
                    onClose();
                  }
                }}
                disabled={!isUnlocked}
                className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl border transition-all relative ${
                  isCurrent
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-400/40 shadow-lg'
                    : isUnlocked
                    ? 'bg-zinc-800/80 hover:bg-zinc-700 border-zinc-700/60 text-white hover:scale-105 active:scale-95'
                    : 'bg-zinc-900/50 border-zinc-800/40 text-zinc-600 cursor-not-allowed opacity-50'
                }`}
              >
                {/* Level Number */}
                <span className="font-heading font-bold text-lg leading-none">{lvl}</span>

                {/* Stars or Lock Icon */}
                <div className="mt-1 h-3 flex items-center justify-center gap-0.5">
                  {!isUnlocked ? (
                    <Lock className="w-3 h-3 text-zinc-600" />
                  ) : stars > 0 ? (
                    <div className="flex items-center text-[10px] text-amber-400">
                      {[1, 2, 3].map((starIdx) => (
                        <Star
                          key={starIdx}
                          className={`w-2.5 h-2.5 ${
                            starIdx <= stars ? 'fill-amber-400 text-amber-400' : 'text-zinc-600'
                          }`}
                        />
                      ))}
                    </div>
                  ) : (
                    <span className="text-[9px] text-zinc-500 font-mono">NEW</span>
                  )}
                </div>

                {isCurrent && (
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-zinc-900/80 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
          <span>Unlocked: Level {unlockedLevel} / {totalLevels}</span>
          <button
            onClick={() => {
              SoundEngine.click();
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
