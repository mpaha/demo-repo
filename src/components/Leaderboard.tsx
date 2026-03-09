import type { LeaderboardEntry } from '../types';

type Props = {
  entries: LeaderboardEntry[];
};

export const Leaderboard = ({ entries }: Props) => {
  if (entries.length === 0) return null;

  return (
    <div className="panel leaderboard">
      <h3>LEADERBOARD</h3>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>NAME</th>
            <th>SCORE</th>
            <th>LVL</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{entry.name}</td>
              <td>{entry.score.toLocaleString()}</td>
              <td>{entry.level}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
