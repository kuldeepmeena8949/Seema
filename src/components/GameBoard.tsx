import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Vehicle, DragState, HintStep } from '../types/game';
import { VehiclePiece } from './VehiclePiece';
import { getValidRange } from '../utils/solver';
import { SoundEngine } from '../utils/audio';

interface SmokePuff {
  id: number;
  x: number;
  y: number;
}

interface GameBoardProps {
  vehicles: Vehicle[];
  positions: number[];
  isWon: boolean;
  hintStep: HintStep | null;
  onMoveVehicle: (vehicleIndex: number, newPos: number) => void;
  selectedVehicleId: number | null;
  onSelectVehicle: (id: number | null) => void;
  isAutoSolving: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  vehicles,
  positions,
  isWon,
  hintStep,
  onMoveVehicle,
  selectedVehicleId,
  onSelectVehicle,
  isAutoSolving,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [boardSize, setBoardSize] = useState<number>(360);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [isEscaping, setIsEscaping] = useState(false);
  const [isRevving, setIsRevving] = useState(false);
  const [smokePuffs, setSmokePuffs] = useState<SmokePuff[]>([]);

  // Update cell size based on container bounding client width
  const updateSize = useCallback(() => {
    if (containerRef.current) {
      const width = containerRef.current.clientWidth;
      setBoardSize(Math.max(260, Math.min(width, 480)));
    }
  }, []);

  useEffect(() => {
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [updateSize]);

  const cellSize = boardSize / 6;

  // Victory escape animation sequence
  useEffect(() => {
    if (isWon) {
      setIsRevving(true);
      SoundEngine.rev();

      // Emit exhaust smoke puffs
      const newPuffs: SmokePuff[] = [];
      for (let k = 0; k < 6; k++) {
        setTimeout(() => {
          setSmokePuffs((prev) => [
            ...prev,
            {
              id: Date.now() + k,
              x: positions[0] * cellSize + k * 8,
              y: 2 * cellSize + cellSize * (0.3 + Math.random() * 0.4),
            },
          ]);
        }, k * 90);
      }

      // Smooth drive out
      const escapeTimer = setTimeout(() => {
        setIsRevving(false);
        setIsEscaping(true);
      }, 300);

      return () => {
        clearTimeout(escapeTimer);
      };
    } else {
      setIsEscaping(false);
      setIsRevving(false);
      setSmokePuffs([]);
    }
  }, [isWon, positions, cellSize]);

  // Clean up old smoke puffs
  useEffect(() => {
    if (smokePuffs.length > 0) {
      const timer = setTimeout(() => {
        setSmokePuffs((prev) => prev.slice(1));
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [smokePuffs]);

  // Drag start
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, index: number) => {
    if (isWon || isAutoSolving) return;

    onSelectVehicle(index);
    const range = getValidRange(vehicles, positions, index);
    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);

    SoundEngine.pick();

    setDragState({
      index,
      lo: range.lo,
      hi: range.hi,
      startX: e.clientX,
      startY: e.clientY,
      initialPos: positions[index],
      currentPos: positions[index],
      hitBumper: false,
    });
  };

  // Drag move
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState) return;

    const v = vehicles[dragState.index];
    const delta = (v.h ? e.clientX - dragState.startX : e.clientY - dragState.startY) / cellSize;
    const rawPos = dragState.initialPos + delta;

    // Check boundary collision for tactile audio bump feedback
    const isOutOfBounds = rawPos < dragState.lo - 0.12 || rawPos > dragState.hi + 0.12;
    if (isOutOfBounds && !dragState.hitBumper) {
      SoundEngine.bump();
      dragState.hitBumper = true;
    } else if (!isOutOfBounds) {
      dragState.hitBumper = false;
    }

    const clampedPos = Math.max(dragState.lo, Math.min(dragState.hi, rawPos));
    setDragState({
      ...dragState,
      currentPos: clampedPos,
    });
  };

  // Drag end
  const handlePointerUp = () => {
    if (!dragState) return;

    const snapPos = Math.round(dragState.currentPos);
    const moved = snapPos !== dragState.initialPos;

    if (moved) {
      SoundEngine.slide();
      onMoveVehicle(dragState.index, snapPos);
    }

    setDragState(null);
  };

  return (
    <div
      ref={containerRef}
      className="relative mx-auto flex items-center justify-center p-3 select-none touch-none"
      style={{ maxWidth: '480px', width: '100%' }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Outer Asphalt Curb & Parking Barrier */}
      <div
        className="relative rounded-2xl p-2 bg-[#252830] border-4 border-[#333842] shadow-[0_16px_36px_-6px_rgba(0,0,0,0.65),inset_0_2px_4px_rgba(255,255,255,0.08)]"
        style={{ width: `${boardSize + 24}px`, height: `${boardSize + 24}px` }}
      >
        {/* Playable Grid Board Surface */}
        <div
          className="relative rounded-xl overflow-visible bg-[#2a2d34]"
          style={{
            width: `${boardSize}px`,
            height: `${boardSize}px`,
            backgroundImage: `
              radial-gradient(circle at 50% 50%, rgba(255,255,255,0.02) 0%, transparent 80%),
              linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: `100% 100%, ${cellSize}px ${cellSize}px, ${cellSize}px ${cellSize}px`,
            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.4)',
          }}
        >
          {/* Subtle Grid Slot Markings (T-shaped parking delimiters) */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            {Array.from({ length: 5 }).map((_, r) =>
              Array.from({ length: 5 }).map((_, c) => (
                <div
                  key={`${r}-${c}`}
                  className="absolute w-1.5 h-1.5 -ml-[3px] -mt-[3px] bg-white/20 rounded-full"
                  style={{ left: `${(c + 1) * cellSize}px`, top: `${(r + 1) * cellSize}px` }}
                />
              ))
            )}
          </div>

          {/* Target Exit Lane Marking (Row 2, highlighted path toward gap) */}
          <div
            className="absolute right-0 h-[2px] bg-yellow-400/40 pointer-events-none"
            style={{
              top: `${2 * cellSize + cellSize / 2}px`,
              width: `${2 * cellSize}px`,
              backgroundImage: 'repeating-linear-gradient(90deg, #facc15 0, #facc15 8px, transparent 8px, transparent 16px)',
            }}
          />

          {/* EXIT GATE OPENING ON RIGHT EDGE */}
          <div
            className="absolute -right-3 z-20 flex items-center justify-center transition-all duration-300"
            style={{
              top: `${2 * cellSize + 2}px`,
              height: `${cellSize - 4}px`,
              width: '18px',
            }}
          >
            {/* Opening gap in barrier */}
            <div className="w-full h-full bg-[#15181d] rounded-r-md border-y-2 border-r-2 border-yellow-400/60 shadow-[0_0_12px_rgba(250,204,21,0.25)] flex flex-col justify-between p-0.5">
              <div className="w-full h-1 bg-yellow-400 animate-pulse" />
              <div className="w-full h-1 bg-yellow-400 animate-pulse" />
            </div>

            {/* EXIT Label */}
            <div className="absolute left-full ml-2 flex items-center gap-1 text-xs font-bold font-mono tracking-widest text-yellow-400 uppercase drop-shadow-[0_0_6px_rgba(250,204,21,0.6)] whitespace-nowrap pointer-events-none animate-pulse">
              <span>EXIT</span>
              <span className="text-sm">➔</span>
            </div>
          </div>

          {/* Vehicles Layer */}
          {vehicles.map((v, idx) => (
            <VehiclePiece
              key={v.id}
              vehicle={v}
              pos={positions[idx]}
              cellSize={cellSize}
              isDragging={dragState?.index === idx}
              dragPos={dragState?.index === idx ? dragState.currentPos : undefined}
              isHinted={hintStep?.vehicleIndex === idx}
              hintDirection={hintStep?.vehicleIndex === idx ? hintStep.direction : null}
              isSelected={selectedVehicleId === idx}
              isEscaping={idx === 0 && isEscaping}
              isRevving={idx === 0 && isRevving}
              onPointerDown={handlePointerDown}
            />
          ))}

          {/* Exhaust Smoke Puffs on Win */}
          {smokePuffs.map((puff) => (
            <div
              key={puff.id}
              className="absolute pointer-events-none z-30 rounded-full bg-white/50 blur-[2px] animate-smoke"
              style={{
                left: `${puff.x}px`,
                top: `${puff.y}px`,
                width: '18px',
                height: '18px',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
