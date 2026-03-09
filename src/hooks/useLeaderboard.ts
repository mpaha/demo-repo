import { useState, useCallback, useEffect } from 'react';
import type { LeaderboardEntry } from '../types';

const STORAGE_KEY = 'tetris-leaderboard';
const MAX_ENTRIES = 10;

const loadLeaderboard = (): LeaderboardEntry[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveLeaderboard = (entries: LeaderboardEntry[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

export const useLeaderboard = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>(loadLeaderboard);

  useEffect(() => {
    saveLeaderboard(entries);
  }, [entries]);

  const addEntry = useCallback(
    (name: string, score: number, level: number, lines: number) => {
      const entry: LeaderboardEntry = {
        name,
        score,
        level,
        lines,
        date: new Date().toLocaleDateString(),
      };
      setEntries((prev) => {
        const updated = [...prev, entry].sort((a, b) => b.score - a.score).slice(0, MAX_ENTRIES);
        return updated;
      });
    },
    []
  );

  const isHighScore = useCallback(
    (score: number) => {
      if (entries.length < MAX_ENTRIES) return true;
      return score > entries[entries.length - 1].score;
    },
    [entries]
  );

  return { entries, addEntry, isHighScore };
};
