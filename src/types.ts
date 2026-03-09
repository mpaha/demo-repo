export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export type CellValue = TetrominoType | null;

export type Board = CellValue[][];

export type Position = { row: number; col: number };

export type Tetromino = {
  type: TetrominoType;
  shape: number[][];
  position: Position;
};

export type GameState = {
  board: Board;
  currentPiece: Tetromino | null;
  nextPiece: Tetromino;
  holdPiece: TetrominoType | null;
  canHold: boolean;
  score: number;
  level: number;
  lines: number;
  gameOver: boolean;
  paused: boolean;
  started: boolean;
};

export type LeaderboardEntry = {
  name: string;
  score: number;
  level: number;
  lines: number;
  date: string;
};
