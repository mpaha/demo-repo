import type { TetrominoType } from '../types';
import { COLORS, SHAPES } from '../constants';

type Props = {
  type: TetrominoType | null;
  label: string;
};

const PREVIEW_CELL = 22;

export const PiecePreview = ({ type, label }: Props) => {
  const shape = type ? SHAPES[type] : null;
  const color = type ? COLORS[type] : null;

  return (
    <div className="panel piece-preview">
      <h3>{label}</h3>
      <div
        className="preview-grid"
        style={{
          gridTemplateColumns: `repeat(${shape ? shape[0].length : 4}, ${PREVIEW_CELL}px)`,
        }}
      >
        {shape
          ? shape.map((row, r) =>
              row.map((cell, c) => (
                <div
                  key={`${r}-${c}`}
                  className={`cell ${cell ? 'filled' : ''}`}
                  style={{
                    width: PREVIEW_CELL,
                    height: PREVIEW_CELL,
                    backgroundColor: cell && color ? color : undefined,
                  }}
                />
              ))
            )
          : Array.from({ length: 16 }, (_, i) => (
              <div
                key={i}
                className="cell"
                style={{ width: PREVIEW_CELL, height: PREVIEW_CELL }}
              />
            ))}
      </div>
    </div>
  );
};
