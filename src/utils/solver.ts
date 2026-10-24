import { Vehicle, HintStep } from '../types/game';

export function getCellIndex(vehicle: Vehicle, pos: number): number {
  return vehicle.h ? vehicle.fy * 6 + pos : pos * 6 + vehicle.fx;
}

export function getOccupiedGrid(vehicles: Vehicle[], positions: number[], skipIndex = -1): number[] {
  const grid = new Array(36).fill(-1);
  for (let i = 0; i < vehicles.length; i++) {
    if (i === skipIndex) continue;
    const v = vehicles[i];
    const p = positions[i];
    for (let k = 0; k < v.len; k++) {
      const idx = getCellIndex(v, p + k);
      if (idx >= 0 && idx < 36) {
        grid[idx] = i;
      }
    }
  }
  return grid;
}

export function getValidRange(
  vehicles: Vehicle[],
  positions: number[],
  vehicleIndex: number
): { lo: number; hi: number } {
  const v = vehicles[vehicleIndex];
  const grid = getOccupiedGrid(vehicles, positions, vehicleIndex);
  let lo = positions[vehicleIndex];
  let hi = positions[vehicleIndex];

  while (lo > 0 && grid[getCellIndex(v, lo - 1)] === -1) {
    lo--;
  }
  while (hi + v.len < 6 && grid[getCellIndex(v, hi + v.len)] === -1) {
    hi++;
  }

  return { lo, hi };
}

export function solvePuzzle(
  vehicles: Vehicle[],
  startPositions: number[],
  capacity = 50000
): [number, number][] | null {
  const startKey = startPositions.join(',');
  const seen = new Map<string, [string, number, number] | null>();
  seen.set(startKey, null);

  const queue: number[][] = [startPositions];
  let queueHead = 0;

  while (queueHead < queue.length) {
    const current = queue[queueHead++];

    // Red car is vehicle 0, horizontal on row 2. Exit is at col 4 (occupying cols 4 & 5)
    if (current[0] === 4) {
      const path: [number, number][] = [];
      let key: string | null = current.join(',');
      while (key) {
        const step = seen.get(key);
        if (!step) break;
        path.push([step[1], step[2]]);
        key = step[0];
      }
      return path.reverse();
    }

    if (seen.size > capacity) {
      return null;
    }

    const grid = getOccupiedGrid(vehicles, current, -1);
    const parentKey = current.join(',');

    for (let i = 0; i < vehicles.length; i++) {
      const v = vehicles[i];
      for (const d of [-1, 1]) {
        let n = current[i] + d;
        while (n >= 0 && n + v.len <= 6) {
          const edge = d > 0 ? n + v.len - 1 : n;
          if (grid[getCellIndex(v, edge)] !== -1) {
            break;
          }
          const nextPositions = current.slice();
          nextPositions[i] = n;
          const nextKey = nextPositions.join(',');

          if (!seen.has(nextKey)) {
            seen.set(nextKey, [parentKey, i, n]);
            queue.push(nextPositions);
          }
          n += d;
        }
      }
    }
  }

  return null;
}

export function getNextHint(vehicles: Vehicle[], currentPositions: number[]): HintStep | null {
  const solution = solvePuzzle(vehicles, currentPositions, 60000);
  if (!solution || solution.length === 0) return null;

  const [vIdx, targetPos] = solution[0];
  const v = vehicles[vIdx];
  const curPos = currentPositions[vIdx];

  let direction: 'left' | 'right' | 'up' | 'down';
  if (v.h) {
    direction = targetPos > curPos ? 'right' : 'left';
  } else {
    direction = targetPos > curPos ? 'down' : 'up';
  }

  return {
    vehicleIndex: vIdx,
    targetPos,
    direction,
    steps: Math.abs(targetPos - curPos),
  };
}

// Deterministic PRNG for procedural levels
function createPrng(seed: number) {
  let s = seed | 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateProceduralLevel(seed: number, targetMinMoves = 10): { vehicles: Vehicle[]; startPos: number[]; par: number } | null {
  const rng = createPrng(seed * 7919 + 13);
  const minMoves = Math.min(3 + Math.floor(targetMinMoves), 24);
  const nCars = Math.min(6 + Math.floor(targetMinMoves / 2), 12);

  let bestSol = -1;
  let bestRes: { vehicles: Vehicle[]; startPos: number[]; par: number } | null = null;
  const t0 = performance.now();

  while (performance.now() - t0 < 450 || !bestRes) {
    const cars_: Vehicle[] = [{
      id: 0,
      h: true,
      len: 2,
      fx: 0,
      fy: 2,
      color: '#e5383b',
      secondaryColor: '#b91c1c',
      type: 'player',
      name: 'Red Stallion GT'
    }];
    const p = [Math.floor(rng() * 2)];
    let tries = 0;

    while (cars_.length < nCars && tries++ < 120) {
      const h = rng() < 0.5;
      const len = rng() < 0.72 ? 2 : 3;
      const v = Math.floor(rng() * (7 - len));
      const f = Math.floor(rng() * 6);
      if (h && f === 2) continue; // cannot block row 2 with another horizontal

      const c: Vehicle = {
        id: cars_.length,
        h,
        len,
        fx: h ? 0 : f,
        fy: h ? f : 0,
        color: '#2563eb',
        type: len === 3 ? 'truck' : 'car',
        name: `Vehicle ${cars_.length}`
      };

      const g = getOccupiedGrid(cars_, p, -1);
      let ok = true;
      for (let k = 0; k < len; k++) {
        if (g[getCellIndex(c, v + k)] !== -1) {
          ok = false;
          break;
        }
      }
      if (ok) {
        cars_.push(c);
        p.push(v);
      }
    }

    const sol = solvePuzzle(cars_, p, 25000);
    if (sol && sol.length > bestSol) {
      bestSol = sol.length;
      bestRes = { vehicles: cars_, startPos: p, par: sol.length };
      if (bestSol >= minMoves) break;
    }
  }

  return bestRes;
}
