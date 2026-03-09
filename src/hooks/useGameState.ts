import { useCallback, useEffect, useRef, useState } from 'react';
import type { Board, CellValue, GameState, Tetromino, TetrominoType } from '../types';
import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  getDropSpeed,
  I_WALL_KICKS,
  LINES_PER_LEVEL,
  POINTS,
  SHAPES,
  TETROMINO_TYPES,
  WALL_KICKS,
} from '../constants';

export const createEmptyBoard = (): Board =>
  Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(null));

export const randomTetromino = (): TetrominoType =>
  TETROMINO_TYPES[Math.floor(Math.random() * TETROMINO_TYPES.length)];

export const createPiece = (type: TetrominoType): Tetromino => ({
  type,
  shape: SHAPES[type].map((row) => [...row]),
  position: {
    row: 0,
    col: Math.floor((BOARD_WIDTH - SHAPES[type][0].length) / 2),
  },
});

export const rotateMatrix = (matrix: number[][]): number[][] => {
  const N = matrix.length;
  const rotated = matrix.map((row) => [...row]);
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      rotated[c][N - 1 - r] = matrix[r][c];
    }
  }
  return rotated;
};

export const getRotationState = (shape: number[][], type: TetrominoType): number => {
  const original = SHAPES[type];
  let test = original.map((r) => [...r]);
  for (let i = 0; i < 4; i++) {
    if (JSON.stringify(test) === JSON.stringify(shape)) return i;
    test = rotateMatrix(test);
  }
  return 0;
};

export const isValidPosition = (
  board: Board,
  shape: number[][],
  row: number,
  col: number
): boolean => {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        const newRow = row + r;
        const newCol = col + c;
        if (
          newRow < 0 ||
          newRow >= BOARD_HEIGHT ||
          newCol < 0 ||
          newCol >= BOARD_WIDTH ||
          board[newRow][newCol] !== null
        ) {
          return false;
        }
      }
    }
  }
  return true;
};

export const placePiece = (board: Board, piece: Tetromino): Board => {
  const newBoard = board.map((row) => [...row]);
  piece.shape.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (cell) {
        const boardRow = piece.position.row + r;
        const boardCol = piece.position.col + c;
        if (boardRow >= 0 && boardRow < BOARD_HEIGHT) {
          newBoard[boardRow][boardCol] = piece.type;
        }
      }
    });
  });
  return newBoard;
};

export const clearLines = (board: Board): { newBoard: Board; linesCleared: number } => {
  const newBoard = board.filter((row) => row.some((cell) => cell === null));
  const linesCleared = BOARD_HEIGHT - newBoard.length;
  while (newBoard.length < BOARD_HEIGHT) {
    newBoard.unshift(Array(BOARD_WIDTH).fill(null) as CellValue[]);
  }
  return { newBoard, linesCleared };
};

export const getGhostPosition = (board: Board, piece: Tetromino): number => {
  let ghostRow = piece.position.row;
  while (isValidPosition(board, piece.shape, ghostRow + 1, piece.position.col)) {
    ghostRow++;
  }
  return ghostRow;
};

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(() => ({
    board: createEmptyBoard(),
    currentPiece: null,
    nextPiece: createPiece(randomTetromino()),
    holdPiece: null,
    canHold: true,
    score: 0,
    level: 0,
    lines: 0,
    gameOver: false,
    paused: false,
    started: false,
  }));

  const dropIntervalRef = useRef<number | null>(null);
  const gameStateRef = useRef(gameState);
  useEffect(() => {
    gameStateRef.current = gameState;
  });

  const spawnPiece = useCallback(() => {
    setGameState((prev) => {
      const piece = prev.nextPiece;
      const next = createPiece(randomTetromino());

      if (!isValidPosition(prev.board, piece.shape, piece.position.row, piece.position.col)) {
        return { ...prev, gameOver: true, currentPiece: piece, started: true };
      }

      return { ...prev, currentPiece: piece, nextPiece: next, canHold: true, started: true };
    });
  }, []);

  const lockPiece = useCallback(() => {
    setGameState((prev) => {
      if (!prev.currentPiece) return prev;

      const boardWithPiece = placePiece(prev.board, prev.currentPiece);
      const { newBoard, linesCleared } = clearLines(boardWithPiece);

      const newLines = prev.lines + linesCleared;
      const newLevel = Math.floor(newLines / LINES_PER_LEVEL);
      const newScore = prev.score + (POINTS[linesCleared] || 0) * (prev.level + 1);

      const nextCurrent = prev.nextPiece;
      const nextNext = createPiece(randomTetromino());

      if (
        !isValidPosition(
          newBoard,
          nextCurrent.shape,
          nextCurrent.position.row,
          nextCurrent.position.col
        )
      ) {
        return {
          ...prev,
          board: newBoard,
          score: newScore,
          level: newLevel,
          lines: newLines,
          gameOver: true,
          currentPiece: null,
        };
      }

      return {
        ...prev,
        board: newBoard,
        currentPiece: nextCurrent,
        nextPiece: nextNext,
        canHold: true,
        score: newScore,
        level: newLevel,
        lines: newLines,
      };
    });
  }, []);

  const moveDown = useCallback(() => {
    setGameState((prev) => {
      if (!prev.currentPiece || prev.gameOver || prev.paused) return prev;

      const { shape, position } = prev.currentPiece;
      if (isValidPosition(prev.board, shape, position.row + 1, position.col)) {
        return {
          ...prev,
          currentPiece: {
            ...prev.currentPiece,
            position: { ...position, row: position.row + 1 },
          },
        };
      }
      return prev;
    });

    // Check if we need to lock after state update
    setTimeout(() => {
      const state = gameStateRef.current;
      if (!state.currentPiece || state.gameOver || state.paused) return;
      const { shape, position } = state.currentPiece;
      if (!isValidPosition(state.board, shape, position.row + 1, position.col)) {
        lockPiece();
      }
    }, 0);
  }, [lockPiece]);

  const moveLeft = useCallback(() => {
    setGameState((prev) => {
      if (!prev.currentPiece || prev.gameOver || prev.paused) return prev;
      const { shape, position } = prev.currentPiece;
      if (isValidPosition(prev.board, shape, position.row, position.col - 1)) {
        return {
          ...prev,
          currentPiece: {
            ...prev.currentPiece,
            position: { ...position, col: position.col - 1 },
          },
        };
      }
      return prev;
    });
  }, []);

  const moveRight = useCallback(() => {
    setGameState((prev) => {
      if (!prev.currentPiece || prev.gameOver || prev.paused) return prev;
      const { shape, position } = prev.currentPiece;
      if (isValidPosition(prev.board, shape, position.row, position.col + 1)) {
        return {
          ...prev,
          currentPiece: {
            ...prev.currentPiece,
            position: { ...position, col: position.col + 1 },
          },
        };
      }
      return prev;
    });
  }, []);

  const rotate = useCallback(() => {
    setGameState((prev) => {
      if (!prev.currentPiece || prev.gameOver || prev.paused) return prev;

      const { shape, position, type } = prev.currentPiece;
      const rotated = rotateMatrix(shape);

      const fromState = getRotationState(shape, type);
      const toState = (fromState + 1) % 4;
      const kickKey = `${fromState}>${toState}`;
      const kicks = type === 'I' ? I_WALL_KICKS[kickKey] : WALL_KICKS[kickKey];

      if (kicks) {
        for (const [dx, dy] of kicks) {
          if (isValidPosition(prev.board, rotated, position.row - dy, position.col + dx)) {
            return {
              ...prev,
              currentPiece: {
                ...prev.currentPiece,
                shape: rotated,
                position: { row: position.row - dy, col: position.col + dx },
              },
            };
          }
        }
      }

      // Fallback: try basic rotation without kicks
      if (isValidPosition(prev.board, rotated, position.row, position.col)) {
        return {
          ...prev,
          currentPiece: { ...prev.currentPiece, shape: rotated },
        };
      }

      return prev;
    });
  }, []);

  const hardDrop = useCallback(() => {
    setGameState((prev) => {
      if (!prev.currentPiece || prev.gameOver || prev.paused) return prev;

      const ghostRow = getGhostPosition(prev.board, prev.currentPiece);
      const dropDistance = ghostRow - prev.currentPiece.position.row;

      const droppedPiece: Tetromino = {
        ...prev.currentPiece,
        position: { ...prev.currentPiece.position, row: ghostRow },
      };

      const boardWithPiece = placePiece(prev.board, droppedPiece);
      const { newBoard, linesCleared } = clearLines(boardWithPiece);

      const newLines = prev.lines + linesCleared;
      const newLevel = Math.floor(newLines / LINES_PER_LEVEL);
      const newScore =
        prev.score + dropDistance * 2 + (POINTS[linesCleared] || 0) * (prev.level + 1);

      const nextCurrent = prev.nextPiece;
      const nextNext = createPiece(randomTetromino());

      if (
        !isValidPosition(
          newBoard,
          nextCurrent.shape,
          nextCurrent.position.row,
          nextCurrent.position.col
        )
      ) {
        return {
          ...prev,
          board: newBoard,
          score: newScore,
          level: newLevel,
          lines: newLines,
          gameOver: true,
          currentPiece: null,
        };
      }

      return {
        ...prev,
        board: newBoard,
        currentPiece: nextCurrent,
        nextPiece: nextNext,
        canHold: true,
        score: newScore,
        level: newLevel,
        lines: newLines,
      };
    });
  }, []);

  const holdCurrentPiece = useCallback(() => {
    setGameState((prev) => {
      if (!prev.currentPiece || prev.gameOver || prev.paused || !prev.canHold) return prev;

      const currentType = prev.currentPiece.type;

      if (prev.holdPiece) {
        const newCurrent = createPiece(prev.holdPiece);
        if (!isValidPosition(prev.board, newCurrent.shape, newCurrent.position.row, newCurrent.position.col)) {
          return prev;
        }
        return {
          ...prev,
          currentPiece: newCurrent,
          holdPiece: currentType,
          canHold: false,
        };
      }

      const newCurrent = prev.nextPiece;
      const newNext = createPiece(randomTetromino());
      return {
        ...prev,
        currentPiece: newCurrent,
        nextPiece: newNext,
        holdPiece: currentType,
        canHold: false,
      };
    });
  }, []);

  const togglePause = useCallback(() => {
    setGameState((prev) => {
      if (prev.gameOver || !prev.started) return prev;
      return { ...prev, paused: !prev.paused };
    });
  }, []);

  const startGame = useCallback(() => {
    setGameState({
      board: createEmptyBoard(),
      currentPiece: null,
      nextPiece: createPiece(randomTetromino()),
      holdPiece: null,
      canHold: true,
      score: 0,
      level: 0,
      lines: 0,
      gameOver: false,
      paused: false,
      started: false,
    });
    setTimeout(() => spawnPiece(), 0);
  }, [spawnPiece]);

  // Auto-drop
  useEffect(() => {
    if (gameState.gameOver || gameState.paused || !gameState.currentPiece) {
      if (dropIntervalRef.current) {
        clearInterval(dropIntervalRef.current);
        dropIntervalRef.current = null;
      }
      return;
    }

    const speed = getDropSpeed(gameState.level);
    dropIntervalRef.current = window.setInterval(moveDown, speed);

    return () => {
      if (dropIntervalRef.current) {
        clearInterval(dropIntervalRef.current);
      }
    };
  }, [gameState.level, gameState.gameOver, gameState.paused, gameState.currentPiece, moveDown]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameStateRef.current.gameOver) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          moveLeft();
          break;
        case 'ArrowRight':
          e.preventDefault();
          moveRight();
          break;
        case 'ArrowDown':
          e.preventDefault();
          moveDown();
          break;
        case 'ArrowUp':
          e.preventDefault();
          rotate();
          break;
        case ' ':
          e.preventDefault();
          hardDrop();
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          togglePause();
          break;
        case 'c':
        case 'C':
          e.preventDefault();
          holdCurrentPiece();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveLeft, moveRight, moveDown, rotate, hardDrop, togglePause, holdCurrentPiece]);

  return {
    gameState,
    startGame,
    togglePause,
  };
};
