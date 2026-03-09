import { describe, it, expect } from 'vitest';
import {
  createEmptyBoard,
  rotateMatrix,
  isValidPosition,
  placePiece,
  clearLines,
  getGhostPosition,
  createPiece,
  randomTetromino,
  getRotationState,
} from '../hooks/useGameState';
import { BOARD_WIDTH, BOARD_HEIGHT, SHAPES } from '../constants';
import type { Board, Tetromino, TetrominoType } from '../types';

describe('createEmptyBoard', () => {
  it('creates a board with correct height', () => {
    const board = createEmptyBoard();
    expect(board.length).toBe(BOARD_HEIGHT);
  });

  it('creates a board with correct width', () => {
    const board = createEmptyBoard();
    board.forEach((row) => expect(row.length).toBe(BOARD_WIDTH));
  });

  it('all cells are null', () => {
    const board = createEmptyBoard();
    board.forEach((row) => {
      row.forEach((cell) => expect(cell).toBeNull());
    });
  });

  it('rows are independent (not shared references)', () => {
    const board = createEmptyBoard();
    board[0][0] = 'I';
    expect(board[1][0]).toBeNull();
  });
});

describe('rotateMatrix', () => {
  it('rotates a 3x3 T-piece clockwise', () => {
    const t = [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ];
    const rotated = rotateMatrix(t);
    expect(rotated).toEqual([
      [0, 1, 0],
      [0, 1, 1],
      [0, 1, 0],
    ]);
  });

  it('4 rotations return to original', () => {
    const original = SHAPES.T.map((r) => [...r]);
    let m = original.map((r) => [...r]);
    for (let i = 0; i < 4; i++) {
      m = rotateMatrix(m);
    }
    expect(m).toEqual(original);
  });

  it('rotates a 2x2 O-piece (stays the same)', () => {
    const o = [
      [1, 1],
      [1, 1],
    ];
    expect(rotateMatrix(o)).toEqual(o);
  });

  it('rotates a 4x4 I-piece correctly', () => {
    const i = SHAPES.I.map((r) => [...r]);
    const rotated = rotateMatrix(i);
    // After rotation, the I piece should be vertical
    expect(rotated[0][2]).toBe(1);
    expect(rotated[1][2]).toBe(1);
    expect(rotated[2][2]).toBe(1);
    expect(rotated[3][2]).toBe(1);
  });
});

describe('getRotationState', () => {
  it('returns 0 for original shape', () => {
    const shape = SHAPES.T.map((r) => [...r]);
    expect(getRotationState(shape, 'T')).toBe(0);
  });

  it('returns 1 after one rotation', () => {
    const shape = rotateMatrix(SHAPES.T.map((r) => [...r]));
    expect(getRotationState(shape, 'T')).toBe(1);
  });

  it('returns 2 after two rotations', () => {
    let shape = SHAPES.T.map((r) => [...r]);
    shape = rotateMatrix(shape);
    shape = rotateMatrix(shape);
    expect(getRotationState(shape, 'T')).toBe(2);
  });
});

describe('isValidPosition', () => {
  it('returns true for valid position on empty board', () => {
    const board = createEmptyBoard();
    const shape = SHAPES.T.map((r) => [...r]);
    expect(isValidPosition(board, shape, 0, 3)).toBe(true);
  });

  it('returns false when piece is out of bounds left', () => {
    const board = createEmptyBoard();
    const shape = SHAPES.T.map((r) => [...r]);
    expect(isValidPosition(board, shape, 0, -1)).toBe(false);
  });

  it('returns false when piece is out of bounds right', () => {
    const board = createEmptyBoard();
    const shape = SHAPES.T.map((r) => [...r]);
    expect(isValidPosition(board, shape, 0, BOARD_WIDTH - 1)).toBe(false);
  });

  it('returns false when piece is below bottom', () => {
    const board = createEmptyBoard();
    const shape = SHAPES.T.map((r) => [...r]);
    expect(isValidPosition(board, shape, BOARD_HEIGHT - 1, 3)).toBe(false);
  });

  it('returns false when collision with existing piece', () => {
    const board = createEmptyBoard();
    board[1][4] = 'I';
    const shape = SHAPES.T.map((r) => [...r]);
    expect(isValidPosition(board, shape, 0, 3)).toBe(false);
  });

  it('returns true when piece fits above existing blocks', () => {
    const board = createEmptyBoard();
    board[5][4] = 'I';
    const shape = SHAPES.T.map((r) => [...r]);
    expect(isValidPosition(board, shape, 0, 3)).toBe(true);
  });
});

describe('placePiece', () => {
  it('places T piece on the board', () => {
    const board = createEmptyBoard();
    const piece: Tetromino = {
      type: 'T',
      shape: SHAPES.T.map((r) => [...r]),
      position: { row: 0, col: 3 },
    };
    const newBoard = placePiece(board, piece);
    expect(newBoard[0][4]).toBe('T');
    expect(newBoard[1][3]).toBe('T');
    expect(newBoard[1][4]).toBe('T');
    expect(newBoard[1][5]).toBe('T');
  });

  it('does not modify the original board', () => {
    const board = createEmptyBoard();
    const piece: Tetromino = {
      type: 'T',
      shape: SHAPES.T.map((r) => [...r]),
      position: { row: 0, col: 3 },
    };
    placePiece(board, piece);
    expect(board[0][4]).toBeNull();
  });

  it('places I piece horizontally', () => {
    const board = createEmptyBoard();
    const piece: Tetromino = {
      type: 'I',
      shape: SHAPES.I.map((r) => [...r]),
      position: { row: 0, col: 3 },
    };
    const newBoard = placePiece(board, piece);
    expect(newBoard[1][3]).toBe('I');
    expect(newBoard[1][4]).toBe('I');
    expect(newBoard[1][5]).toBe('I');
    expect(newBoard[1][6]).toBe('I');
  });
});

describe('clearLines', () => {
  it('clears a full line', () => {
    const board = createEmptyBoard();
    // Fill the bottom row
    for (let c = 0; c < BOARD_WIDTH; c++) {
      board[BOARD_HEIGHT - 1][c] = 'I';
    }
    const { newBoard, linesCleared } = clearLines(board);
    expect(linesCleared).toBe(1);
    expect(newBoard[BOARD_HEIGHT - 1].every((c) => c === null)).toBe(true);
  });

  it('does not clear incomplete lines', () => {
    const board = createEmptyBoard();
    for (let c = 0; c < BOARD_WIDTH - 1; c++) {
      board[BOARD_HEIGHT - 1][c] = 'I';
    }
    const { linesCleared } = clearLines(board);
    expect(linesCleared).toBe(0);
  });

  it('clears multiple full lines', () => {
    const board = createEmptyBoard();
    for (let r = BOARD_HEIGHT - 2; r < BOARD_HEIGHT; r++) {
      for (let c = 0; c < BOARD_WIDTH; c++) {
        board[r][c] = 'I';
      }
    }
    const { linesCleared } = clearLines(board);
    expect(linesCleared).toBe(2);
  });

  it('shifts rows down after clearing', () => {
    const board = createEmptyBoard();
    // Put a block on row 18
    board[BOARD_HEIGHT - 2][0] = 'T';
    // Fill row 19 completely
    for (let c = 0; c < BOARD_WIDTH; c++) {
      board[BOARD_HEIGHT - 1][c] = 'I';
    }
    const { newBoard } = clearLines(board);
    // The T block should have shifted down to row 19
    expect(newBoard[BOARD_HEIGHT - 1][0]).toBe('T');
  });

  it('clears 4 lines (tetris)', () => {
    const board = createEmptyBoard();
    for (let r = BOARD_HEIGHT - 4; r < BOARD_HEIGHT; r++) {
      for (let c = 0; c < BOARD_WIDTH; c++) {
        board[r][c] = 'I';
      }
    }
    const { linesCleared } = clearLines(board);
    expect(linesCleared).toBe(4);
  });

  it('preserves board dimensions after clearing', () => {
    const board = createEmptyBoard();
    for (let c = 0; c < BOARD_WIDTH; c++) {
      board[BOARD_HEIGHT - 1][c] = 'I';
    }
    const { newBoard } = clearLines(board);
    expect(newBoard.length).toBe(BOARD_HEIGHT);
    newBoard.forEach((row) => expect(row.length).toBe(BOARD_WIDTH));
  });
});

describe('getGhostPosition', () => {
  it('drops piece to the bottom on empty board', () => {
    const board = createEmptyBoard();
    const piece: Tetromino = {
      type: 'T',
      shape: SHAPES.T.map((r) => [...r]),
      position: { row: 0, col: 3 },
    };
    const ghostRow = getGhostPosition(board, piece);
    // T piece is 3 rows tall, bottom filled row is index 1
    // So ghost should land at row BOARD_HEIGHT - 2 (row 18, since row 19 has the bottom of the 3x3)
    expect(ghostRow).toBe(BOARD_HEIGHT - 2);
  });

  it('stops above existing blocks', () => {
    const board = createEmptyBoard();
    // Place a block at row 10
    for (let c = 0; c < BOARD_WIDTH; c++) {
      board[10][c] = 'I';
    }
    const piece: Tetromino = {
      type: 'T',
      shape: SHAPES.T.map((r) => [...r]),
      position: { row: 0, col: 3 },
    };
    const ghostRow = getGhostPosition(board, piece);
    expect(ghostRow).toBe(8);
  });

  it('returns current row if piece cannot move down', () => {
    const board = createEmptyBoard();
    // Fill row 1
    for (let c = 0; c < BOARD_WIDTH; c++) {
      board[2][c] = 'I';
    }
    const piece: Tetromino = {
      type: 'T',
      shape: SHAPES.T.map((r) => [...r]),
      position: { row: 0, col: 3 },
    };
    const ghostRow = getGhostPosition(board, piece);
    expect(ghostRow).toBe(0);
  });
});

describe('createPiece', () => {
  it('creates a piece with correct type', () => {
    const piece = createPiece('T');
    expect(piece.type).toBe('T');
  });

  it('creates a piece with correct shape', () => {
    const piece = createPiece('T');
    expect(piece.shape).toEqual(SHAPES.T);
  });

  it('positions piece centered horizontally', () => {
    const piece = createPiece('T');
    const expectedCol = Math.floor((BOARD_WIDTH - SHAPES.T[0].length) / 2);
    expect(piece.position.col).toBe(expectedCol);
    expect(piece.position.row).toBe(0);
  });

  it('shape is a deep copy (not reference)', () => {
    const piece = createPiece('T');
    piece.shape[0][0] = 9;
    expect(SHAPES.T[0][0]).toBe(0);
  });
});

describe('randomTetromino', () => {
  it('returns a valid tetromino type', () => {
    const validTypes: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    for (let i = 0; i < 50; i++) {
      expect(validTypes).toContain(randomTetromino());
    }
  });
});
