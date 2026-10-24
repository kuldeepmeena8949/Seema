import React from 'react';
import { Vehicle } from '../types/game';

interface VehiclePieceProps {
  vehicle: Vehicle;
  pos: number;
  cellSize: number;
  isDragging: boolean;
  isHinted: boolean;
  isSelected: boolean;
  isEscaping: boolean;
  isRevving: boolean;
  dragPos?: number;
  hintDirection?: 'left' | 'right' | 'up' | 'down' | null;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>, index: number) => void;
}

export const VehiclePiece: React.FC<VehiclePieceProps> = ({
  vehicle,
  pos,
  cellSize,
  isDragging,
  isHinted,
  isSelected,
  isEscaping,
  isRevving,
  dragPos,
  hintDirection,
  onPointerDown,
}) => {
  const currentPos = isDragging && dragPos !== undefined ? dragPos : pos;
  const isHorizontal = vehicle.h;
  const isPlayer = vehicle.type === 'player';
  const isTruck = vehicle.len === 3;

  // Exact geometric positioning
  const gap = 6;
  const width = isHorizontal ? vehicle.len * cellSize - gap : cellSize - gap;
  const height = isHorizontal ? cellSize - gap : vehicle.len * cellSize - gap;

  // If escaping, move far out to the right off board
  const left = isEscaping
    ? 6.8 * cellSize
    : (isHorizontal ? currentPos * cellSize : vehicle.fx * cellSize) + gap / 2;

  const top = (isHorizontal ? vehicle.fy * cellSize : currentPos * cellSize) + gap / 2;

  return (
    <div
      onPointerDown={(e) => onPointerDown(e, vehicle.id)}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        left: `${left}px`,
        top: `${top}px`,
        touchAction: 'none',
        transition: isDragging
          ? 'none'
          : isEscaping
          ? 'left 0.75s cubic-bezier(0.5, 0, 0.9, 0.4)'
          : 'left 0.22s cubic-bezier(0.2, 0.9, 0.3, 1), top 0.22s cubic-bezier(0.2, 0.9, 0.3, 1), transform 0.15s ease',
      }}
      className={`absolute select-none rounded-xl cursor-grab active:cursor-grabbing ${
        isDragging ? 'z-30 cursor-grabbing scale-[1.02]' : 'z-10'
      } ${isHinted ? 'ring-4 ring-yellow-400 ring-offset-2 ring-offset-zinc-900 animate-pulse' : ''} ${
        isSelected ? 'ring-2 ring-white/80' : ''
      } ${isRevving ? 'animate-rev' : ''}`}
      role="button"
      tabIndex={0}
      aria-label={`${isPlayer ? 'Player Red Car' : vehicle.name}, length ${vehicle.len}, ${
        isHorizontal ? 'horizontal' : 'vertical'
      }`}
    >
      {/* Vehicle Body Chassis with realistic automotive gradient */}
      <div
        className="w-full h-full rounded-xl relative overflow-hidden flex items-center justify-center border border-white/20 shadow-md"
        style={{
          background: isPlayer
            ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #991b1b 100%)'
            : `linear-gradient(135deg, ${vehicle.color} 0%, ${vehicle.secondaryColor || vehicle.color} 100%)`,
          boxShadow: isDragging
            ? '0 12px 28px -4px rgba(0, 0, 0, 0.65), 0 4px 8px -2px rgba(0, 0, 0, 0.4)'
            : '0 4px 8px -1px rgba(0, 0, 0, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.45)',
        }}
      >
        {/* Subtle Metallic Highlight on Top Edge */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-white/40 pointer-events-none" />

        {/* Player Racing Stripes */}
        {isPlayer && isHorizontal && (
          <div className="absolute inset-y-0 left-0 right-0 flex flex-col justify-center gap-1 opacity-25 pointer-events-none">
            <div className="w-full h-[3px] bg-white" />
            <div className="w-full h-[3px] bg-white" />
          </div>
        )}

        {/* Cabin Glass / Roof styling */}
        <div
          className={`absolute rounded-lg bg-zinc-900/60 border border-white/10 shadow-inner flex items-center justify-center pointer-events-none ${
            isHorizontal
              ? 'inset-y-[18%] left-[22%] right-[18%]'
              : 'inset-x-[18%] top-[22%] bottom-[18%]'
          }`}
        >
          {/* Truck Cargo Ribs or Car Interior Reflection */}
          {isTruck ? (
            <div
              className={`w-full h-full opacity-30 flex ${
                isHorizontal ? 'flex-row justify-around py-1' : 'flex-col justify-around px-1'
              }`}
            >
              <div className={isHorizontal ? 'w-[2px] h-full bg-white/60' : 'h-[2px] w-full bg-white/60'} />
              <div className={isHorizontal ? 'w-[2px] h-full bg-white/60' : 'h-[2px] w-full bg-white/60'} />
              <div className={isHorizontal ? 'w-[2px] h-full bg-white/60' : 'h-[2px] w-full bg-white/60'} />
            </div>
          ) : (
            <div className="w-3/4 h-3/4 rounded-md bg-zinc-800/80 border border-white/5 opacity-60 flex items-center justify-center">
              <span className="text-[9px] font-mono tracking-tighter text-white/50 uppercase select-none">
                {isPlayer ? 'GT' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Headlights / Taillights */}
        {isHorizontal ? (
          <>
            {/* Front Headlights (Facing Right towards Exit) */}
            <div className="absolute right-1 top-2 w-2 h-2 rounded-full bg-yellow-200 shadow-[0_0_8px_#fde047] border border-yellow-300" />
            <div className="absolute right-1 bottom-2 w-2 h-2 rounded-full bg-yellow-200 shadow-[0_0_8px_#fde047] border border-yellow-300" />
            {/* Rear Taillights */}
            <div className="absolute left-1 top-2 w-1.5 h-2 rounded-sm bg-red-700 border border-red-500" />
            <div className="absolute left-1 bottom-2 w-1.5 h-2 rounded-sm bg-red-700 border border-red-500" />
          </>
        ) : (
          <>
            {/* Front Headlights (Facing Downward) */}
            <div className="absolute bottom-1 left-2 w-2 h-2 rounded-full bg-yellow-200 shadow-[0_0_8px_#fde047] border border-yellow-300" />
            <div className="absolute bottom-1 right-2 w-2 h-2 rounded-full bg-yellow-200 shadow-[0_0_8px_#fde047] border border-yellow-300" />
            {/* Rear Taillights */}
            <div className="absolute top-1 left-2 w-2 h-1.5 rounded-sm bg-red-700 border border-red-500" />
            <div className="absolute top-1 right-2 w-2 h-1.5 rounded-sm bg-red-700 border border-red-500" />
          </>
        )}

        {/* Wheels / Tires peering from wheel wells */}
        {isHorizontal ? (
          <>
            <div className="absolute -top-[2px] left-[18%] w-4 h-[3px] bg-zinc-950 rounded-sm" />
            <div className="absolute -top-[2px] right-[18%] w-4 h-[3px] bg-zinc-950 rounded-sm" />
            <div className="absolute -bottom-[2px] left-[18%] w-4 h-[3px] bg-zinc-950 rounded-sm" />
            <div className="absolute -bottom-[2px] right-[18%] w-4 h-[3px] bg-zinc-950 rounded-sm" />
          </>
        ) : (
          <>
            <div className="absolute top-[18%] -left-[2px] h-4 w-[3px] bg-zinc-950 rounded-sm" />
            <div className="absolute bottom-[18%] -left-[2px] h-4 w-[3px] bg-zinc-950 rounded-sm" />
            <div className="absolute top-[18%] -right-[2px] h-4 w-[3px] bg-zinc-950 rounded-sm" />
            <div className="absolute bottom-[18%] -right-[2px] h-4 w-[3px] bg-zinc-950 rounded-sm" />
          </>
        )}

        {/* Direction Hint Overlay Arrow */}
        {isHinted && hintDirection && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div className="bg-amber-400 text-zinc-950 px-2 py-0.5 rounded shadow-lg font-bold text-xs tracking-wider uppercase animate-bounce flex items-center gap-1">
              <span>MOVE</span>
              <span>
                {hintDirection === 'left' && '←'}
                {hintDirection === 'right' && '→'}
                {hintDirection === 'up' && '↑'}
                {hintDirection === 'down' && '↓'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
