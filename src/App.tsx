import { Board } from './components/Board';
import { PiecePreview } from './components/PiecePreview';
import { ScoreBoard } from './components/ScoreBoard';
import { GameOver } from './components/GameOver';
import { Leaderboard } from './components/Leaderboard';
import { useGameState } from './hooks/useGameState';
import { useLeaderboard } from './hooks/useLeaderboard';
import './App.css';

function App() {
  const { gameState, startGame, togglePause } = useGameState();
  const { entries, addEntry, isHighScore } = useLeaderboard();

  const handleSaveScore = (name: string) => {
    addEntry(name, gameState.score, gameState.level, gameState.lines);
  };

  return (
    <div className="app">
      <h1 className="title">TETRIS</h1>
      <div className="game-container">
        <div className="left-panel">
          <PiecePreview type={gameState.holdPiece} label="HOLD" />
          <div className="controls-info panel">
            <h3>CONTROLS</h3>
            <p><kbd>&larr;</kbd><kbd>&rarr;</kbd> Move</p>
            <p><kbd>&darr;</kbd> Soft Drop</p>
            <p><kbd>&uarr;</kbd> Rotate</p>
            <p><kbd>Space</kbd> Hard Drop</p>
            <p><kbd>C</kbd> Hold</p>
            <p><kbd>P</kbd> Pause</p>
          </div>
        </div>

        <div className="board-wrapper">
          <Board board={gameState.board} currentPiece={gameState.currentPiece} />

          {!gameState.started && !gameState.gameOver && (
            <div className="overlay">
              <div className="start-panel">
                <h2>TETRIS</h2>
                <button className="start-btn" onClick={startGame}>
                  START GAME
                </button>
              </div>
            </div>
          )}

          {gameState.paused && (
            <div className="overlay">
              <div className="pause-panel">
                <h2>PAUSED</h2>
                <button onClick={togglePause}>RESUME</button>
              </div>
            </div>
          )}

          {gameState.gameOver && (
            <GameOver
              score={gameState.score}
              level={gameState.level}
              lines={gameState.lines}
              isHighScore={isHighScore(gameState.score)}
              onSaveScore={handleSaveScore}
              onRestart={startGame}
            />
          )}
        </div>

        <div className="right-panel">
          <PiecePreview type={gameState.nextPiece.type} label="NEXT" />
          <ScoreBoard
            score={gameState.score}
            level={gameState.level}
            lines={gameState.lines}
          />
          <Leaderboard entries={entries} />
        </div>
      </div>
    </div>
  );
}

export default App;
