type Props = {
  score: number;
  level: number;
  lines: number;
};

export const ScoreBoard = ({ score, level, lines }: Props) => (
  <div className="panel scoreboard">
    <div className="stat">
      <span className="stat-label">SCORE</span>
      <span className="stat-value">{score.toLocaleString()}</span>
    </div>
    <div className="stat">
      <span className="stat-label">LEVEL</span>
      <span className="stat-value">{level}</span>
    </div>
    <div className="stat">
      <span className="stat-label">LINES</span>
      <span className="stat-value">{lines}</span>
    </div>
  </div>
);
