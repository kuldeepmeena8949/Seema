import React, { useState, useEffect, useCallback, useRef } from 'react';
import { parseLevel, TOTAL_LEVELS } from './data/levels';
import { Vehicle, HintStep } from './types/game';
import { GameHeader } from './components/GameHeader';
import { GameBoard } from './components/GameBoard';
import { GameControls } from './components/GameControls';
import { LevelSelectModal } from './components/LevelSelectModal';
import { VictoryModal } from './components/VictoryModal';
import { RulesModal } from './components/RulesModal';
import { solvePuzzle, getNextHint, getValidRange } from './utils/solver';
import { SoundEngine } from './utils/audio';

export default function App() {
  // Load persistent stats from localStorage
  const [unlockedLevel, setUnlockedLevel] = useState<number>(() => {
    try {
      const saved = parseInt(localStorage.getItem('parkit-unlocked') || '1', 10);
      return Math.max(1, Math.min(TOTAL_LEVELS, saved || 1));
    } catch {
      return 1;
    }
  });

  const [starsMap, setStarsMap] = useState<Record<number, number>>(() => {
    try {
      return JSON.parse(localStorage.getItem('parkit-stars') || '{}');
    } catch {
      return {};
    }
  });

  const [currentLevel, setCurrentLevel] = useState<number>(() => {
    try {
      const saved = parseInt(localStorage.getItem('parkit-unlocked') || '1', 10);
      return Math.max(1, Math.min(TOTAL_LEVELS, saved || 1));
    } catch {
      return 1;
    }
  });

  // Current Level Game State
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [positions, setPositions] = useState<number[]>([]);
  const [startPositions, setStartPositions] = useState<number[]>([]);
  const [par, setPar] = useState<number>(2);
  const [moves, setMoves] = useState<number>(0);
  const [history, setHistory] = useState<number[][]>([]);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [hintStep, setHintStep] = useState<HintStep | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(0);
  const [isAutoSolving, setIsAutoSolving] = useState<boolean>(false);

  // Modals & UI Controls
  const [isLevelSelectOpen, setIsLevelSelectOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isVictoryModalOpen, setIsVictoryModalOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(() => SoundEngine.isMuted());

  const autoSolveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load a level
  const loadLevel = useCallback((lvl: number) => {
    if (autoSolveTimerRef.current) {
      clearTimeout(autoSolveTimerRef.current);
    }
    setIsAutoSolving(false);
    setIsWon(false);
    setIsVictoryModalOpen(false);
    setHintStep(null);
    setHistory([]);
    setMoves(0);

    const data = parseLevel(lvl);
    setCurrentLevel(lvl);
    setVehicles(data.vehicles);
    setPositions(data.startPos.slice());
    setStartPositions(data.startPos.slice());
    setPar(data.par);
    setSelectedVehicleId(0);
  }, []);

  // Initial load
  useEffect(() => {
    loadLevel(currentLevel);
  }, [loadLevel]);

  // Handle Move
  const handleMoveVehicle = useCallback(
    (vehicleIndex: number, newPos: number) => {
      if (isWon || isAutoSolving) return;

      setPositions((prevPositions) => {
        const curPos = prevPositions[vehicleIndex];
        if (curPos === newPos) return prevPositions;

        // Save history for undo
        setHistory((prevHist) => [...prevHist, prevPositions.slice()]);
        setMoves((m) => m + 1);

        const updated = prevPositions.slice();
        updated[vehicleIndex] = newPos;

        // Clear active hint on move
        setHintStep(null);

        // Check victory condition: Red car (index 0) has reached column 4 (occupying 4 & 5)
        if (vehicleIndex === 0 && newPos === 4) {
          setIsWon(true);

          // Calculate earned stars
          const finalMoves = moves + 1;
          const starsEarned = finalMoves <= par ? 3 : finalMoves <= par + 3 ? 2 : 1;

          // Persist stars
          setStarsMap((prevStars) => {
            const nextStars = {
              ...prevStars,
              [currentLevel]: Math.max(prevStars[currentLevel] || 0, starsEarned),
            };
            try {
              localStorage.setItem('parkit-stars', JSON.stringify(nextStars));
            } catch {
              // ignore
            }
            return nextStars;
          });

          // Unlock next level
          if (currentLevel >= unlockedLevel && currentLevel < TOTAL_LEVELS) {
            const nextUnlocked = currentLevel + 1;
            setUnlockedLevel(nextUnlocked);
            try {
              localStorage.setItem('parkit-unlocked', nextUnlocked.toString());
            } catch {
              // ignore
            }
          }

          // Delay opening victory modal until car escapes off-screen
          setTimeout(() => {
            setIsVictoryModalOpen(true);
          }, 1100);
        }

        return updated;
      });
    },
    [isWon, isAutoSolving, moves, par, currentLevel, unlockedLevel]
  );

  // Undo move
  const handleUndo = useCallback(() => {
    if (history.length === 0 || isWon || isAutoSolving) return;

    setHistory((prevHist) => {
      const nextHist = prevHist.slice();
      const lastState = nextHist.pop();
      if (lastState) {
        setPositions(lastState);
        setMoves((m) => Math.max(0, m - 1));
        setHintStep(null);
      }
      return nextHist;
    });
  }, [history.length, isWon, isAutoSolving]);

  // Restart level
  const handleReset = useCallback(() => {
    if (autoSolveTimerRef.current) {
      clearTimeout(autoSolveTimerRef.current);
    }
    setIsAutoSolving(false);
    setIsWon(false);
    setIsVictoryModalOpen(false);
    setPositions(startPositions.slice());
    setHistory([]);
    setMoves(0);
    setHintStep(null);
    setSelectedVehicleId(0);
  }, [startPositions]);

  // Hint
  const handleHint = useCallback(() => {
    if (isWon || isAutoSolving) return;
    const nextStep = getNextHint(vehicles, positions);
    if (nextStep) {
      setHintStep(nextStep);
      setSelectedVehicleId(nextStep.vehicleIndex);
    }
  }, [vehicles, positions, isWon, isAutoSolving]);

  // Auto-Solve step by step playback
  const handleToggleAutoSolve = useCallback(() => {
    if (isAutoSolving) {
      if (autoSolveTimerRef.current) {
        clearTimeout(autoSolveTimerRef.current);
      }
      setIsAutoSolving(false);
      return;
    }

    if (isWon) return;

    const solution = solvePuzzle(vehicles, positions, 80000);
    if (!solution || solution.length === 0) return;

    setIsAutoSolving(true);
    let stepIndex = 0;

    const playNextStep = () => {
      if (stepIndex >= solution.length) {
        setIsAutoSolving(false);
        return;
      }

      const [vIdx, targetPos] = solution[stepIndex++];
      setSelectedVehicleId(vIdx);
      SoundEngine.slide();

      setPositions((prev) => {
        const next = prev.slice();
        next[vIdx] = targetPos;
        return next;
      });
      setMoves((m) => m + 1);

      if (vIdx === 0 && targetPos === 4) {
        setIsWon(true);
        setIsAutoSolving(false);
        setTimeout(() => {
          setIsVictoryModalOpen(true);
        }, 1100);
        return;
      }

      autoSolveTimerRef.current = setTimeout(playNextStep, 450);
    };

    autoSolveTimerRef.current = setTimeout(playNextStep, 250);
  }, [isAutoSolving, isWon, vehicles, positions]);

  // Keyboard navigation & controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isVictoryModalOpen || isLevelSelectOpen || isRulesOpen) {
        if (e.key === 'Escape') {
          setIsLevelSelectOpen(false);
          setIsRulesOpen(false);
        }
        return;
      }

      // Tab or Space: Cycle selected vehicle
      if (e.key === 'Tab' || e.key === ' ') {
        e.preventDefault();
        setSelectedVehicleId((prev) => {
          const nextId = prev === null ? 0 : (prev + 1) % vehicles.length;
          return nextId;
        });
        SoundEngine.pick();
        return;
      }

      // Undo: U or Ctrl+Z
      if (e.key === 'u' || e.key === 'U' || ((e.ctrlKey || e.metaKey) && e.key === 'z')) {
        e.preventDefault();
        handleUndo();
        return;
      }

      // Restart: R
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleReset();
        return;
      }

      // Hint: H
      if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        handleHint();
        return;
      }

      // Arrow keys / WASD to move selected vehicle
      if (selectedVehicleId !== null && !isWon && !isAutoSolving) {
        const v = vehicles[selectedVehicleId];
        const curPos = positions[selectedVehicleId];
        const range = getValidRange(vehicles, positions, selectedVehicleId);

        let targetPos = curPos;

        if (v.h) {
          // Horizontal: Left / Right or A / D
          if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
            e.preventDefault();
            targetPos = Math.max(range.lo, curPos - 1);
          } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
            e.preventDefault();
            targetPos = Math.min(range.hi, curPos + 1);
          }
        } else {
          // Vertical: Up / Down or W / S
          if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
            e.preventDefault();
            targetPos = Math.max(range.lo, curPos - 1);
          } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
            e.preventDefault();
            targetPos = Math.min(range.hi, curPos + 1);
          }
        }

        if (targetPos !== curPos) {
          handleMoveVehicle(selectedVehicleId, targetPos);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isVictoryModalOpen,
    isLevelSelectOpen,
    isRulesOpen,
    selectedVehicleId,
    vehicles,
    positions,
    isWon,
    isAutoSolving,
    handleUndo,
    handleReset,
    handleHint,
    handleMoveVehicle,
  ]);

  // Clean up auto solve timer on unmount
  useEffect(() => {
    return () => {
      if (autoSolveTimerRef.current) {
        clearTimeout(autoSolveTimerRef.current);
      }
    };
  }, []);

  const totalStarsCount = Object.values(starsMap).reduce((acc, curr) => acc + curr, 0);

  return (
    <div className="min-h-screen bg-[#15181d] text-[#eceae4] flex flex-col items-center justify-between py-2 sm:py-4 px-2">
      {/* Top Header & HUD */}
      <GameHeader
        currentLevel={currentLevel}
        totalLevels={TOTAL_LEVELS}
        unlockedLevel={unlockedLevel}
        moves={moves}
        par={par}
        starsCount={totalStarsCount}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(SoundEngine.toggleMute())}
        onOpenLevelSelect={() => setIsLevelSelectOpen(true)}
        onOpenRules={() => setIsRulesOpen(true)}
        onPrevLevel={() => currentLevel > 1 && loadLevel(currentLevel - 1)}
        onNextLevel={() => currentLevel < unlockedLevel && loadLevel(currentLevel + 1)}
      />

      {/* Main Playfield Board */}
      <main className="w-full flex-1 flex flex-col items-center justify-center py-2">
        <GameBoard
          vehicles={vehicles}
          positions={positions}
          isWon={isWon}
          hintStep={hintStep}
          onMoveVehicle={handleMoveVehicle}
          selectedVehicleId={selectedVehicleId}
          onSelectVehicle={setSelectedVehicleId}
          isAutoSolving={isAutoSolving}
        />
      </main>

      {/* Controls & Toolbar */}
      <GameControls
        canUndo={history.length > 0}
        isWon={isWon}
        isAutoSolving={isAutoSolving}
        onUndo={handleUndo}
        onReset={handleReset}
        onHint={handleHint}
        onToggleAutoSolve={handleToggleAutoSolve}
      />

      {/* Modals */}
      <LevelSelectModal
        isOpen={isLevelSelectOpen}
        currentLevel={currentLevel}
        unlockedLevel={unlockedLevel}
        totalLevels={TOTAL_LEVELS}
        starsMap={starsMap}
        onSelectLevel={loadLevel}
        onClose={() => setIsLevelSelectOpen(false)}
      />

      <VictoryModal
        isOpen={isVictoryModalOpen}
        level={currentLevel}
        totalLevels={TOTAL_LEVELS}
        moves={moves}
        par={par}
        onNextLevel={() => {
          setIsVictoryModalOpen(false);
          if (currentLevel < TOTAL_LEVELS) {
            loadLevel(currentLevel + 1);
          } else {
            loadLevel(1);
          }
        }}
        onReplay={() => {
          setIsVictoryModalOpen(false);
          handleReset();
        }}
      />

      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
    </div>
  );
}
