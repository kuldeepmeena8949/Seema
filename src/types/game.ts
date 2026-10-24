export interface Vehicle {
  id: number;
  h: boolean; // true = horizontal, false = vertical
  len: number; // 2 = car, 3 = truck
  fx: number; // column index if vertical, unused (0) if horizontal
  fy: number; // row index if horizontal, unused (0) if vertical
  color: string;
  secondaryColor?: string;
  type: 'player' | 'car' | 'truck';
  name: string;
}

export interface LevelRawData {
  par: number;
  code: string;
}

export interface ParsedLevel {
  id: number;
  par: number;
  vehicles: Vehicle[];
  startPos: number[];
}

export type ThemeMode = 'asphalt' | 'night' | 'arcade' | 'daylight';

export interface DragState {
  index: number;
  lo: number;
  hi: number;
  startX: number;
  startY: number;
  initialPos: number;
  currentPos: number;
  hitBumper?: boolean;
}

export interface HintStep {
  vehicleIndex: number;
  targetPos: number;
  direction: 'left' | 'right' | 'up' | 'down';
  steps: number;
}
