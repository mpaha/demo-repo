import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLeaderboard } from '../hooks/useLeaderboard';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

describe('useLeaderboard', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('loads empty leaderboard initially', () => {
    const { result } = renderHook(() => useLeaderboard());
    expect(result.current.entries).toEqual([]);
  });

  it('adds an entry', () => {
    const { result } = renderHook(() => useLeaderboard());
    act(() => {
      result.current.addEntry('Player1', 1000, 2, 15);
    });
    expect(result.current.entries.length).toBe(1);
    expect(result.current.entries[0].name).toBe('Player1');
    expect(result.current.entries[0].score).toBe(1000);
  });

  it('sorts entries by score descending', () => {
    const { result } = renderHook(() => useLeaderboard());
    act(() => {
      result.current.addEntry('Low', 100, 0, 1);
    });
    act(() => {
      result.current.addEntry('High', 5000, 5, 50);
    });
    act(() => {
      result.current.addEntry('Mid', 2000, 3, 20);
    });
    expect(result.current.entries[0].name).toBe('High');
    expect(result.current.entries[1].name).toBe('Mid');
    expect(result.current.entries[2].name).toBe('Low');
  });

  it('limits to top 10 entries', () => {
    const { result } = renderHook(() => useLeaderboard());
    for (let i = 0; i < 12; i++) {
      act(() => {
        result.current.addEntry(`Player${i}`, i * 100, 1, 10);
      });
    }
    expect(result.current.entries.length).toBe(10);
    // Lowest score should be dropped
    expect(result.current.entries[9].score).toBe(200);
  });

  it('isHighScore returns true when leaderboard is not full', () => {
    const { result } = renderHook(() => useLeaderboard());
    expect(result.current.isHighScore(0)).toBe(true);
  });

  it('isHighScore returns true when score beats lowest entry', () => {
    const { result } = renderHook(() => useLeaderboard());
    for (let i = 0; i < 10; i++) {
      act(() => {
        result.current.addEntry(`Player${i}`, (i + 1) * 100, 1, 10);
      });
    }
    // Lowest score is 100
    expect(result.current.isHighScore(200)).toBe(true);
  });

  it('isHighScore returns false when score does not beat lowest', () => {
    const { result } = renderHook(() => useLeaderboard());
    for (let i = 0; i < 10; i++) {
      act(() => {
        result.current.addEntry(`Player${i}`, (i + 1) * 1000, 1, 10);
      });
    }
    // Lowest is 1000
    expect(result.current.isHighScore(500)).toBe(false);
  });

  it('entry includes date string', () => {
    const { result } = renderHook(() => useLeaderboard());
    act(() => {
      result.current.addEntry('Test', 100, 1, 5);
    });
    expect(typeof result.current.entries[0].date).toBe('string');
    expect(result.current.entries[0].date.length).toBeGreaterThan(0);
  });

  it('saves to localStorage when entries change', () => {
    const { result } = renderHook(() => useLeaderboard());
    act(() => {
      result.current.addEntry('Test', 100, 1, 5);
    });
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'tetris-leaderboard',
      expect.any(String)
    );
  });
});
