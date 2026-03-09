import { useState } from 'react';

type Props = {
  score: number;
  level: number;
  lines: number;
  isHighScore: boolean;
  onSaveScore: (name: string) => void;
  onRestart: () => void;
};

export const GameOver = ({ score, level, lines, isHighScore, onSaveScore, onRestart }: Props) => {
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (name.trim()) {
      onSaveScore(name.trim());
      setSaved(true);
    }
  };

  return (
    <div className="overlay">
      <div className="game-over-panel">
        <h2>GAME OVER</h2>
        <div className="final-stats">
          <p>Score: {score.toLocaleString()}</p>
          <p>Level: {level}</p>
          <p>Lines: {lines}</p>
        </div>
        {isHighScore && !saved && (
          <div className="high-score-form">
            <p className="high-score-msg">NEW HIGH SCORE!</p>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              maxLength={15}
              autoFocus
            />
            <button onClick={handleSave}>SAVE</button>
          </div>
        )}
        {saved && <p className="high-score-msg">Score saved!</p>}
        <button className="restart-btn" onClick={onRestart}>
          PLAY AGAIN
        </button>
      </div>
    </div>
  );
};
