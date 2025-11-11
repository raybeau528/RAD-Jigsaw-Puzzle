import { PuzzlePiece, PieceSide, Difficulty, SegmentParams } from '../types';

// --- Constants for shape generation ---
const SHAPE_S = 0.60; // Tab Shape (width)
const SHAPE_D = 0.60; // Tab Depth
const RIP_R = 0.05;  // Edge Rip (jitter amount)
const RIP_S = 0.05;  // Rip Scale (jitter scale)

// --- Seedable pseudo-random number generator ---
class SeededRandom {
  private seed: number;
  constructor(seed: number) {
    this.seed = seed;
  }
  next(): number {
    this.seed |= 0;
    this.seed = (this.seed + 0x6d2b79f5) | 0;
    let t = Math.imul(this.seed ^ (this.seed >>> 15), 1 | this.seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}

function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function uniform(rng: SeededRandom, min: number, max: number): number {
  return min + (max - min) * rng.next();
}

// --- Jigsaw Cut Generation Logic ---
function genRowSegments(cols: number, seed: number, jitter: number, ripScale: number): SegmentParams[] {
  const rng = new SeededRandom(seed);
  let e = uniform(rng, -jitter, jitter) * ripScale;
  let flipPrev: 1 | -1 = 1;
  const out: SegmentParams[] = [];
  for (let xi = 0; xi < cols; xi++) {
    const flip: 1 | -1 = rng.next() > 0.5 ? 1 : -1;
    const a = (flip === flipPrev ? -e : e);
    const b = uniform(rng, -jitter, jitter) * ripScale;
    const c = uniform(rng, -jitter, jitter) * ripScale;
    const d = uniform(rng, -jitter, jitter) * ripScale;
    e = uniform(rng, -jitter, jitter) * ripScale;
    out.push({ a, b, c, d, e, flip });
    flipPrev = flip;
  }
  return out;
}

function genColSegments(rows: number, seed: number, jitter: number, ripScale: number): SegmentParams[] {
  const rng = new SeededRandom(seed);
  let e = uniform(rng, -jitter, jitter) * ripScale;
  let flipPrev: 1 | -1 = 1;
  const out: SegmentParams[] = [];
  for (let yi = 0; yi < rows; yi++) {
    const flip: 1 | -1 = rng.next() > 0.5 ? 1 : -1;
    const a = (flip === flipPrev ? -e : e);
    const b = uniform(rng, -jitter, jitter) * ripScale;
    const c = uniform(rng, -jitter, jitter) * ripScale;
    const d = uniform(rng, -jitter, jitter) * ripScale;
    e = uniform(rng, -jitter, jitter) * ripScale;
    out.push({ a, b, c, d, e, flip });
    flipPrev = flip;
  }
  return out;
}

interface PuzzleCuts {
  horizontal: SegmentParams[][];
  vertical: SegmentParams[][];
}

export function generateCuts(difficulty: Difficulty, seed: number): PuzzleCuts {
    const { rows, cols } = difficulty;
    const jitter = RIP_R;
    const ripScale = RIP_S;
    
    const horizontal: SegmentParams[][] = [];
    for (let r = 0; r < rows - 1; r++) {
      const rowSeed = (seed ^ hashString(`H_${r}_${cols}_${rows}`)) >>> 0;
      horizontal[r] = genRowSegments(cols, rowSeed, jitter, ripScale);
    }

    const vertical: SegmentParams[][] = [];
    for (let c = 0; c < cols - 1; c++) {
      const colSeed = (seed ^ hashString(`V_${c}_${cols}_${rows}`)) >>> 0;
      vertical[c] = genColSegments(rows, colSeed, jitter, ripScale);
    }
    
    return { horizontal, vertical };
}

export function generatePuzzlePieces(difficulty: Difficulty, seed: number): PuzzlePiece[] {
  const { rows, cols } = difficulty;
  const pieces: PuzzlePiece[] = [];
  const { horizontal: horizontalCuts, vertical: verticalCuts } = generateCuts(difficulty, seed);
  
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const id = r * cols + c;

      const top: PieceSide = r > 0 ? { ...horizontalCuts[r - 1][c], flip: horizontalCuts[r - 1][c].flip * -1 as (1 | -1) } : { type: 'flat' };
      const right: PieceSide = c < cols - 1 ? verticalCuts[c][r] : { type: 'flat' };
      const bottom: PieceSide = r < rows - 1 ? horizontalCuts[r][c] : { type: 'flat' };
      const left: PieceSide = c > 0 ? { ...verticalCuts[c - 1][r], flip: verticalCuts[c - 1][r].flip * -1 as (1 | -1) } : { type: 'flat' };

      pieces.push({
        id,
        row: r,
        col: c,
        x: 0,
        y: 0,
        finalX: 0, // will be set later
        finalY: 0,
        top,
        right,
        bottom,
        left,
        groupId: id,
        isLocked: false,
      });
    }
  }

  return pieces;
}

// --- Path and Drawing Logic ---
interface Point { x: number; y: number; }

export function drawCut(
  path: Path2D | CanvasRenderingContext2D,
  p1: Point,
  p2: Point,
  side: PieceSide,
  pieceWidth: number,
  pieceHeight: number
): void {
  // Fix: Use `in` operator to safely check for 'type' property and narrow the union type.
  if ('type' in side) {
    path.lineTo(p2.x, p2.y);
    return;
  }
  
  const tabDirection = side.flip;
  const _tabShape = SHAPE_S * 2;
  const _tabDepth = SHAPE_D * 0.2;

  const len = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  const ang = Math.atan2(p2.y - p1.y, p2.x - p1.x);

  const rotate = (p: Point, angle: number) => ({
    x: p.x * Math.cos(angle) - p.y * Math.sin(angle),
    y: p.x * Math.sin(angle) + p.y * Math.cos(angle)
  });
  const add = (p1: Point, p2: Point) => ({ x: p1.x + p2.x, y: p1.y + p2.y });

  const { a, b, c, d, e } = side;
  const t = _tabDepth;

  const pts = [
    { l: 0.0, w: 0.0 }, { l: 0.2, w: a },
    { l: 0.5 + b + d, w: -t + c }, { l: 0.5 - t * _tabShape + b, w: t + c },
    { l: 0.5 - 2 * t * _tabShape + b - d, w: 3 * t + c }, { l: 0.5 + 2 * t * _tabShape + b - d, w: 3 * t + c },
    { l: 0.5 + t * _tabShape + b, w: t + c }, { l: 0.5 + b + d, w: -t + c },
    { l: 0.8, w: e }, { l: 1.0, w: 0.0 },
  ];

  const curvePoints = pts.map(p => {
    const l = Math.max(0, Math.min(1, p.l));
    const s = tabDirection * p.w;
    const influence = Math.min(pieceWidth, pieceHeight); // Use shorter side for consistent knob depth
    const localP = { x: l * len, y: s * influence };
    return add(rotate(localP, ang), p1);
  });

  const c1 = curvePoints[1], c2 = curvePoints[2], p3 = curvePoints[3];
  const c3 = curvePoints[4], c4 = curvePoints[5], p6 = curvePoints[6];
  const c5 = curvePoints[7], c6 = curvePoints[8], p9 = curvePoints[9];

  path.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, p3.x, p3.y);
  path.bezierCurveTo(c3.x, c3.y, c4.x, c4.y, p6.x, p6.y);
  path.bezierCurveTo(c5.x, c5.y, c6.x, c6.y, p9.x, p9.y);
}


export function createPiecePath(piece: PuzzlePiece, pieceWidth: number, pieceHeight: number): Path2D {
  const path = new Path2D();
  const { x, y } = piece;

  const pTopLeft = { x: x, y: y };
  const pTopRight = { x: x + pieceWidth, y: y };
  const pBottomRight = { x: x + pieceWidth, y: y + pieceHeight };
  const pBottomLeft = { x: x, y: y + pieceHeight };

  path.moveTo(pTopLeft.x, pTopLeft.y);
  
  // Top
  drawCut(path, pTopLeft, pTopRight, piece.top, pieceWidth, pieceHeight);
  // Right
  drawCut(path, pTopRight, pBottomRight, piece.right, pieceWidth, pieceHeight);
  // Bottom
  drawCut(path, pBottomRight, pBottomLeft, piece.bottom, pieceWidth, pieceHeight);
  // Left
  drawCut(path, pBottomLeft, pTopLeft, piece.left, pieceWidth, pieceHeight);

  path.closePath();
  return path;
}