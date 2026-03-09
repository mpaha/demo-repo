import { describe, it, expect } from 'vitest';
import {
  SHAPES,
  COLORS,
  GHOST_COLORS,
  TETROMINO_TYPES,
  POINTS,
  LINES_PER_LEVEL,
  getDropSpeed,
  BOARD_WIDTH,
  BOARD_HEIGHT,
  WALL_KICKS,
  I_WALL_KICKS,
} from '../constants';

describe('SHAPES', () => {
  it('contains all 7 tetromino types', () => {
    const types = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    types.forEach((type) => {
      expect(SHAPES[type as keyof typeof SHAPES]).toBeDefined();
    });
  });

  it('I piece is 4x4', () => {
    expect(SHAPES.I.length).toBe(4);
    SHAPES.I.forEach((row) => expect(row.length).toBe(4));
  });

  it('O piece is 2x2', () => {
    expect(SHAPES.O.length).toBe(2);
    SHAPES.O.forEach((row) => expect(row.length).toBe(2));
  });

  it('T, S, Z, J, L pieces are 3x3', () => {
    const types3x3: (keyof typeof SHAPES)[] = ['T', 'S', 'Z', 'J', 'L'];
    types3x3.forEach((type) => {
      expect(SHAPES[type].length).toBe(3);
      SHAPES[type].forEach((row) => expect(row.length).toBe(3));
    });
  });

  it('all shapes are square matrices', () => {
    Object.values(SHAPES).forEach((shape) => {
      const size = shape.length;
      shape.forEach((row) => expect(row.length).toBe(size));
    });
  });

  it('each shape contains only 0s and 1s', () => {
    Object.values(SHAPES).forEach((shape) => {
      shape.forEach((row) => {
        row.forEach((cell) => {
          expect(cell === 0 || cell === 1).toBe(true);
        });
      });
    });
  });

  it('each shape has exactly 4 filled cells', () => {
    Object.values(SHAPES).forEach((shape) => {
      const filledCount = shape.flat().filter((c) => c === 1).length;
      expect(filledCount).toBe(4);
    });
  });
});

describe('COLORS', () => {
  it('has a color for every tetromino type', () => {
    TETROMINO_TYPES.forEach((type) => {
      expect(COLORS[type]).toBeDefined();
      expect(typeof COLORS[type]).toBe('string');
    });
  });

  it('all colors are valid hex strings', () => {
    Object.values(COLORS).forEach((color) => {
      expect(color).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });
});

describe('GHOST_COLORS', () => {
  it('has a ghost color for every tetromino type', () => {
    TETROMINO_TYPES.forEach((type) => {
      expect(GHOST_COLORS[type]).toBeDefined();
      expect(GHOST_COLORS[type]).toContain('rgba');
    });
  });
});

describe('getDropSpeed', () => {
  it('returns 800 for level 0', () => {
    expect(getDropSpeed(0)).toBe(800);
  });

  it('returns 720 for level 1', () => {
    expect(getDropSpeed(1)).toBe(720);
  });

  it('speed decreases as level increases', () => {
    for (let i = 0; i < 10; i++) {
      expect(getDropSpeed(i + 1)).toBeLessThan(getDropSpeed(i));
    }
  });

  it('caps at minimum speed for very high levels', () => {
    expect(getDropSpeed(100)).toBe(getDropSpeed(14));
    expect(getDropSpeed(14)).toBe(40);
  });

  it('returns a positive number for any level', () => {
    for (let i = 0; i < 20; i++) {
      expect(getDropSpeed(i)).toBeGreaterThan(0);
    }
  });
});

describe('POINTS', () => {
  it('awards 100 for single line', () => {
    expect(POINTS[1]).toBe(100);
  });

  it('awards 300 for double', () => {
    expect(POINTS[2]).toBe(300);
  });

  it('awards 500 for triple', () => {
    expect(POINTS[3]).toBe(500);
  });

  it('awards 800 for tetris (4 lines)', () => {
    expect(POINTS[4]).toBe(800);
  });

  it('has increasing points for more lines', () => {
    expect(POINTS[2]).toBeGreaterThan(POINTS[1]);
    expect(POINTS[3]).toBeGreaterThan(POINTS[2]);
    expect(POINTS[4]).toBeGreaterThan(POINTS[3]);
  });
});

describe('Board constants', () => {
  it('board is 10 columns wide', () => {
    expect(BOARD_WIDTH).toBe(10);
  });

  it('board is 20 rows tall', () => {
    expect(BOARD_HEIGHT).toBe(20);
  });

  it('LINES_PER_LEVEL is 10', () => {
    expect(LINES_PER_LEVEL).toBe(10);
  });
});

describe('Wall kick tables', () => {
  it('WALL_KICKS has entries for all 8 rotation transitions', () => {
    const keys = ['0>1', '1>0', '1>2', '2>1', '2>3', '3>2', '3>0', '0>3'];
    keys.forEach((key) => {
      expect(WALL_KICKS[key]).toBeDefined();
      expect(WALL_KICKS[key].length).toBe(5);
    });
  });

  it('I_WALL_KICKS has entries for all 8 rotation transitions', () => {
    const keys = ['0>1', '1>0', '1>2', '2>1', '2>3', '3>2', '3>0', '0>3'];
    keys.forEach((key) => {
      expect(I_WALL_KICKS[key]).toBeDefined();
      expect(I_WALL_KICKS[key].length).toBe(5);
    });
  });

  it('first kick offset is always [0,0]', () => {
    Object.values(WALL_KICKS).forEach((kicks) => {
      expect(kicks[0]).toEqual([0, 0]);
    });
    Object.values(I_WALL_KICKS).forEach((kicks) => {
      expect(kicks[0]).toEqual([0, 0]);
    });
  });
});
