export enum GameState {
  IDLE = 'idle',
  IMAGE_LOADED = 'imageLoaded',
  PLAYING = 'playing',
  COMPLETE = 'complete',
}

export interface Difficulty {
  name: string;
  rows: number;
  cols: number;
}

export interface SegmentParams {
  a: number; b: number; c: number; d: number; e: number;
  flip: 1 | -1;
}

export type PieceSide = SegmentParams | { type: 'flat' };

export interface PuzzlePiece {
  id: number;
  row: number;
  col: number;
  x: number;
  y: number;
  // Final correct position
  finalX: number;
  finalY: number;
  // Shape of each side
  top: PieceSide;
  right: PieceSide;
  bottom: PieceSide;
  left: PieceSide;
  groupId: number;
  isLocked: boolean;
}

export interface SavedGame {
  puzzleImageUrl: string;
  difficulty: Difficulty;
  puzzleSeed: number;
  pieces: PuzzlePiece[];
}
