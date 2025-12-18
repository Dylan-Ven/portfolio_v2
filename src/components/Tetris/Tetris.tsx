'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import './Tetris.css';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const EMPTY_CELL = 0;

const SHAPES = {
  I: [[1, 1, 1, 1]],
  O: [[1, 1], [1, 1]],
  T: [[0, 1, 0], [1, 1, 1]],
  S: [[0, 1, 1], [1, 1, 0]],
  Z: [[1, 1, 0], [0, 1, 1]],
  J: [[1, 0, 0], [1, 1, 1]],
  L: [[0, 0, 1], [1, 1, 1]]
};

const COLORS = {
  I: '#00f0f0',
  O: '#f0f000',
  T: '#a000f0',
  S: '#00f000',
  Z: '#f00000',
  J: '#0000f0',
  L: '#f0a000'
};

type ShapeType = keyof typeof SHAPES;
type Piece = {
  shape: number[][];
  type: ShapeType;
  x: number;
  y: number;
};

interface TetrisProps {
  onClose: () => void;
}

export default function Tetris({ onClose }: TetrisProps) {
  const [board, setBoard] = useState<number[][]>(() => 
    Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(EMPTY_CELL))
  );
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null);
  const [heldPiece, setHeldPiece] = useState<ShapeType | null>(null);
  const [canHold, setCanHold] = useState(true);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [lastRotationWasKick, setLastRotationWasKick] = useState(false);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  const createPiece = useCallback((): Piece => {
    const types = Object.keys(SHAPES) as ShapeType[];
    const type = types[Math.floor(Math.random() * types.length)];
    return {
      shape: SHAPES[type],
      type,
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(SHAPES[type][0].length / 2),
      y: 0
    };
  }, []);

  const resetGame = useCallback(() => {
    setBoard(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(EMPTY_CELL)));
    setCurrentPiece(null);
    setHeldPiece(null);
    setCanHold(true);
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    setLastRotationWasKick(false);
  }, []);

  const rotatePiece = (piece: Piece, clockwise: boolean): number[][] => {
    // For I-piece, use a 4x4 rotation grid for proper center rotation
    if (piece.type === 'I') {
      const isHorizontal = piece.shape.length === 1;
      if (isHorizontal) {
        // Horizontal [1,1,1,1] -> Vertical
        return [[1], [1], [1], [1]];
      } else {
        // Vertical -> Horizontal
        return [[1, 1, 1, 1]];
      }
    }
    
    // Standard rotation for other pieces
    const rotated = piece.shape[0].map((_, i) =>
      piece.shape.map(row => row[i])
    );
    return clockwise ? rotated.map(row => row.reverse()) : rotated.reverse();
  };

  const isValidMove = (piece: Piece, newX: number, newY: number, newShape?: number[][]): boolean => {
    const shape = newShape || piece.shape;
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const boardX = newX + x;
          const boardY = newY + y;
          if (
            boardX < 0 || 
            boardX >= BOARD_WIDTH || 
            boardY >= BOARD_HEIGHT ||
            (boardY >= 0 && board[boardY][boardX])
          ) {
            return false;
          }
        }
      }
    }
    return true;
  };

  const mergePiece = useCallback(() => {
    if (!currentPiece) return;
    
    const newBoard = board.map(row => [...row]);
    currentPiece.shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          const boardY = currentPiece.y + y;
          const boardX = currentPiece.x + x;
          if (boardY >= 0) {
            newBoard[boardY][boardX] = Object.keys(SHAPES).indexOf(currentPiece.type) + 1;
          }
        }
      });
    });

    // Check for completed lines
    let linesCleared = 0;
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      if (newBoard[y].every(cell => cell !== EMPTY_CELL)) {
        newBoard.splice(y, 1);
        newBoard.unshift(Array(BOARD_WIDTH).fill(EMPTY_CELL));
        linesCleared++;
        y++; // Check this line again
      }
    }

    if (linesCleared > 0) {
      // Check if it was a T-spin (T piece placed with wall kick that cleared lines)
      const isTSpin = currentPiece.type === 'T' && lastRotationWasKick;
      const basePoints = linesCleared * 100;
      const points = isTSpin ? Math.floor(basePoints * 1.2) : basePoints;
      setScore(prev => prev + points);
      
      // Reset T-spin flag after scoring
      setLastRotationWasKick(false);
    }

    setBoard(newBoard);
    setCanHold(true);

    // Spawn new piece
    const newPiece = createPiece();
    if (!isValidMove(newPiece, newPiece.x, newPiece.y)) {
      setGameOver(true);
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    } else {
      setCurrentPiece(newPiece);
    }
  }, [currentPiece, board, createPiece]);

  const movePiece = useCallback((dx: number, dy: number) => {
    if (!currentPiece || gameOver || isPaused) return;

    const newX = currentPiece.x + dx;
    const newY = currentPiece.y + dy;

    if (isValidMove(currentPiece, newX, newY)) {
      setCurrentPiece({ ...currentPiece, x: newX, y: newY });
      // Reset kick flag when moving horizontally or down
      if (dx !== 0 || dy > 0) {
        setLastRotationWasKick(false);
      }
    } else if (dy > 0) {
      mergePiece();
    }
  }, [currentPiece, gameOver, isPaused, mergePiece]);

  const rotate = useCallback((clockwise: boolean) => {
    if (!currentPiece || gameOver || isPaused) return;

    const rotated = rotatePiece(currentPiece, clockwise);
    
    // Different wall kick offsets for I-piece vs other pieces
    const isIPiece = currentPiece.type === 'I';
    
    // I-piece specific kicks (needs more horizontal space)
    const iPieceKicks = [
      { x: 0, y: 0 },   // No kick
      { x: -1, y: 0 },  // Left
      { x: 1, y: 0 },   // Right
      { x: -2, y: 0 },  // Far left
      { x: 2, y: 0 },   // Far right
      { x: 0, y: -1 },  // Up
    ];
    
    // Standard pieces kicks
    const standardKicks = [
      { x: 0, y: 0 },   // No kick
      { x: -1, y: 0 },  // Left
      { x: 1, y: 0 },   // Right
      { x: 0, y: -1 },  // Up
      { x: -1, y: -1 }, // Left + Up
      { x: 1, y: -1 },  // Right + Up
      { x: 0, y: 1 },   // Down
    ];
    
    const wallKickOffsets = isIPiece ? iPieceKicks : standardKicks;

    // Try each offset until we find one that works
    for (let i = 0; i < wallKickOffsets.length; i++) {
      const offset = wallKickOffsets[i];
      const newX = currentPiece.x + offset.x;
      const newY = currentPiece.y + offset.y;
      
      if (isValidMove(currentPiece, newX, newY, rotated)) {
        setCurrentPiece({ ...currentPiece, shape: rotated, x: newX, y: newY });
        // Mark if we used a wall kick (not the first normal rotation)
        setLastRotationWasKick(i > 0);
        return;
      }
    }
  }, [currentPiece, gameOver, isPaused]);

  const holdPiece = useCallback(() => {
    if (!currentPiece || !canHold || gameOver || isPaused) return;

    if (heldPiece === null) {
      setHeldPiece(currentPiece.type);
      setCurrentPiece(createPiece());
    } else {
      const newPiece: Piece = {
        shape: SHAPES[heldPiece],
        type: heldPiece,
        x: Math.floor(BOARD_WIDTH / 2) - Math.floor(SHAPES[heldPiece][0].length / 2),
        y: 0
      };
      setHeldPiece(currentPiece.type);
      setCurrentPiece(newPiece);
    }
    setCanHold(false);
  }, [currentPiece, heldPiece, canHold, gameOver, isPaused, createPiece]);

  const hardDrop = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return;

    let newY = currentPiece.y;
    while (isValidMove(currentPiece, currentPiece.x, newY + 1)) {
      newY++;
    }
    
    // Update the piece position immediately
    const droppedPiece = { ...currentPiece, y: newY };
    setCurrentPiece(droppedPiece);
    
    // Merge immediately on next frame
    setTimeout(() => {
      const newBoard = board.map(row => [...row]);
      droppedPiece.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell) {
            const boardY = droppedPiece.y + y;
            const boardX = droppedPiece.x + x;
            if (boardY >= 0) {
              newBoard[boardY][boardX] = Object.keys(SHAPES).indexOf(droppedPiece.type) + 1;
            }
          }
        });
      });

      // Check for completed lines
      let linesCleared = 0;
      for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
        if (newBoard[y].every(cell => cell !== EMPTY_CELL)) {
          newBoard.splice(y, 1);
          newBoard.unshift(Array(BOARD_WIDTH).fill(EMPTY_CELL));
          linesCleared++;
          y++;
        }
      }

      if (linesCleared > 0) {
        setScore(prev => prev + linesCleared * 100);
      }

      setBoard(newBoard);
      setCanHold(true);

      // Spawn new piece
      const newPiece = createPiece();
      if (!isValidMove(newPiece, newPiece.x, newPiece.y)) {
        setGameOver(true);
        if (gameLoopRef.current) {
          clearInterval(gameLoopRef.current);
        }
      } else {
        setCurrentPiece(newPiece);
      }
    }, 50);
  }, [currentPiece, board, gameOver, isPaused, createPiece]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver) return;

      // Prevent default for game control keys
      if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', ' ', 'p', 'c', 'x', 'z'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
      }

      switch (e.key) {
        case 'ArrowLeft':
          movePiece(-1, 0);
          break;
        case 'ArrowRight':
          movePiece(1, 0);
          break;
        case 'ArrowDown':
          movePiece(0, 1);
          break;
        case 'ArrowUp':
        case 'x':
          rotate(true);
          break;
        case 'z':
          rotate(false);
          break;
        case 'c':
        case 'Shift':
          holdPiece();
          break;
        case ' ':
          hardDrop();
          break;
        case 'p':
          setIsPaused(prev => !prev);
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [movePiece, rotate, holdPiece, hardDrop, gameOver, onClose]);

  useEffect(() => {
    if (!currentPiece) {
      setCurrentPiece(createPiece());
    }
  }, [currentPiece, createPiece]);

  useEffect(() => {
    if (gameOver || isPaused) return;

    gameLoopRef.current = setInterval(() => {
      movePiece(0, 1);
    }, 1000);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [movePiece, gameOver, isPaused]);

  const renderBoard = () => {
    const displayBoard = board.map(row => [...row]);
    
    if (currentPiece) {
      currentPiece.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell) {
            const boardY = currentPiece.y + y;
            const boardX = currentPiece.x + x;
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              displayBoard[boardY][boardX] = Object.keys(SHAPES).indexOf(currentPiece.type) + 1;
            }
          }
        });
      });
    }

    return displayBoard.map((row, y) => (
      <div key={y} className="tetris-row">
        {row.map((cell, x) => {
          const shapeTypes = Object.keys(SHAPES) as ShapeType[];
          const cellType = cell > 0 ? shapeTypes[cell - 1] : null;
          return (
            <div
              key={x}
              className={`tetris-cell ${cellType ? `tetris-cell-${cellType}` : ''} ${cell ? 'tetris-cell-filled' : 'tetris-cell-empty'}`}
            />
          );
        })}
      </div>
    ));
  };

  const renderHeldPiece = () => {
    if (!heldPiece) return <div className="tetris-preview-empty">-</div>;
    
    return (
      <div className="tetris-preview">
        {SHAPES[heldPiece].map((row, y) => (
          <div key={y} className="tetris-preview-row">
            {row.map((cell, x) => (
              <div
                key={x}
                className={`tetris-preview-cell ${cell ? `tetris-cell-${heldPiece}` : ''}`}
              />
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="tetris-overlay">
      <div className="tetris-container">
        <div className="tetris-header">
          <h2>TETRIS</h2>
          <button className="tetris-close" onClick={onClose}>×</button>
        </div>
        
        <div className="tetris-game">
          <div className="tetris-sidebar">
            <div className="tetris-info">
              <h3>HOLD [C]</h3>
              {renderHeldPiece()}
            </div>
            <div className="tetris-info">
              <h3>SCORE</h3>
              <div className="tetris-score">{score}</div>
            </div>
          </div>

          <div className="tetris-board">
            {renderBoard()}
            {gameOver && (
              <div className="tetris-game-over">
                <h2>GAME OVER</h2>
                <p>Score: {score}</p>
                <button onClick={resetGame}>Restart</button>
              </div>
            )}
            {isPaused && (
              <div className="tetris-paused">
                <h2>PAUSED</h2>
                <p>Press P to resume</p>
              </div>
            )}
          </div>

          <div className="tetris-controls">
            <h3>CONTROLS</h3>
            <div className="tetris-control-list">
              <div>← → Move</div>
              <div>↓ Drop</div>
              <div>SPACE Hard</div>
              <div>↑/X Rotate</div>
              <div>Z Rotate L</div>
              <div>C Hold</div>
              <div>P Pause</div>
              <div>ESC Close</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
