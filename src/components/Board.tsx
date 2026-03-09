import type { Board as BoardType, Tetromino } from '../types';
import { BOARD_HEIGHT, BOARD_WIDTH, CELL_SIZE, COLORS, GHOST_COLORS } from '../constants';
import { getGhostPosition } from '../hooks/useGameState';

type Props = {
  board: BoardType;
  currentPiece: Tetromino | null;
};

export const Board = ({ board, currentPiece }: Props) => {
  const renderBoard = () => {
    // Create display board with ghost and current piece
    const display: (string | null)[][] = board.map((row) =>
      row.map((cell) => (cell ? COLORS[cell] : null))
    );

    if (currentPiece) {
      // Draw ghost piece
      const ghostRow = getGhostPosition(board, currentPiece);
      currentPiece.shape.forEach((row, r) => {
        row.forEach((cell, c) => {
          if (cell) {
            const boardRow = ghostRow + r;
            const boardCol = currentPiece.position.col + c;
            if (boardRow >= 0 && boardRow < BOARD_HEIGHT && boardCol >= 0 && boardCol < BOARD_WIDTH) {
              if (!display[boardRow][boardCol]) {
                display[boardRow][boardCol] = GHOST_COLORS[currentPiece.type];
              }
            }
          }
        });
      });

      // Draw current piece
      currentPiece.shape.forEach((row, r) => {
        row.forEach((cell, c) => {
          if (cell) {
            const boardRow = currentPiece.position.row + r;
            const boardCol = currentPiece.position.col + c;
            if (boardRow >= 0 && boardRow < BOARD_HEIGHT && boardCol >= 0 && boardCol < BOARD_WIDTH) {
              display[boardRow][boardCol] = COLORS[currentPiece.type];
            }
          }
        });
      });
    }

    return display;
  };

  const display = renderBoard();

  return (
    <div
      className="board"
      style={{
        width: BOARD_WIDTH * CELL_SIZE,
        height: BOARD_HEIGHT * CELL_SIZE,
      }}
    >
      {display.map((row, r) =>
        row.map((color, c) => (
          <div
            key={`${r}-${c}`}
            className={`cell ${color ? 'filled' : ''}`}
            style={{
              width: CELL_SIZE,
              height: CELL_SIZE,
              backgroundColor: color || undefined,
            }}
          />
        ))
      )}
    </div>
  );
};
