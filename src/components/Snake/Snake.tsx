'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import './Snake.css';

const BOARD_WIDTH = 20;
const BOARD_HEIGHT = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 1, y: 0 };
const GAME_SPEED = 150;

type Position = { x: number; y: number };
type Direction = { x: number; y: number };

interface SnakeProps {
  onClose: () => void;
}

export default function Snake({ onClose }: SnakeProps) {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const directionRef = useRef<Direction>(INITIAL_DIRECTION);

  const generateFood = useCallback((snakeBody: Position[]): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * BOARD_WIDTH),
        y: Math.floor(Math.random() * BOARD_HEIGHT)
      };
    } while (snakeBody.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, []);

  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    directionRef.current = INITIAL_DIRECTION;
    setFood({ x: 15, y: 15 });
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
  }, []);

  const checkCollision = (head: Position, body: Position[]): boolean => {
    // Check wall collision
    if (head.x < 0 || head.x >= BOARD_WIDTH || head.y < 0 || head.y >= BOARD_HEIGHT) {
      return true;
    }
    // Check self collision
    return body.some(segment => segment.x === head.x && segment.y === head.y);
  };

  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return;

    setSnake(prevSnake => {
      const newHead = {
        x: prevSnake[0].x + directionRef.current.x,
        y: prevSnake[0].y + directionRef.current.y
      };

      // Check collision
      if (checkCollision(newHead, prevSnake)) {
        setGameOver(true);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check if food is eaten
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(prev => prev + 10);
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop(); // Remove tail if no food eaten
      }

      return newSnake;
    });
  }, [gameOver, isPaused, food, generateFood]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver) return;

      const key = e.key.toLowerCase();

      // Prevent default for game control keys
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', 'p'].includes(key)) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (key === 'p') {
        setIsPaused(prev => !prev);
        return;
      }

      if (isPaused) return;

      const newDirection = { ...directionRef.current };

      switch (key) {
        case 'arrowup':
        case 'w':
          if (directionRef.current.y === 0) {
            newDirection.x = 0;
            newDirection.y = -1;
          }
          break;
        case 'arrowdown':
        case 's':
          if (directionRef.current.y === 0) {
            newDirection.x = 0;
            newDirection.y = 1;
          }
          break;
        case 'arrowleft':
        case 'a':
          if (directionRef.current.x === 0) {
            newDirection.x = -1;
            newDirection.y = 0;
          }
          break;
        case 'arrowright':
        case 'd':
          if (directionRef.current.x === 0) {
            newDirection.x = 1;
            newDirection.y = 0;
          }
          break;
      }

      directionRef.current = newDirection;
      setDirection(newDirection);
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameOver, isPaused]);

  useEffect(() => {
    if (gameOver || isPaused) {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
      return;
    }

    gameLoopRef.current = setInterval(moveSnake, GAME_SPEED);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [moveSnake, gameOver, isPaused]);

  const renderBoard = () => {
    const cells = [];
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        const isSnakeHead = snake[0].x === x && snake[0].y === y;
        const isSnakeBody = snake.slice(1).some(segment => segment.x === x && segment.y === y);
        const isFood = food.x === x && food.y === y;

        let cellClass = 'snake-cell';
        if (isSnakeHead) cellClass += ' snake-head';
        else if (isSnakeBody) cellClass += ' snake-body';
        else if (isFood) cellClass += ' snake-food';

        cells.push(<div key={`${x}-${y}`} className={cellClass} />);
      }
    }
    return cells;
  };

  return (
    <div className="snake-overlay">
      <div className="snake-container">
        <div className="snake-header">
          <h2>SNAKE</h2>
          <button className="snake-close" onClick={onClose}>×</button>
        </div>

        <div className="snake-game">
          <div className="snake-sidebar">
            <div className="snake-info">
              <h3>SCORE</h3>
              <div className="snake-score">{score}</div>
            </div>
            <div className="snake-info">
              <h3>LENGTH</h3>
              <div className="snake-score">{snake.length}</div>
            </div>
          </div>

          <div className="snake-board">
            {renderBoard()}
            {gameOver && (
              <div className="snake-game-over">
                <h2>GAME OVER</h2>
                <p>Score: {score}</p>
                <p>Length: {snake.length}</p>
                <button onClick={resetGame}>Restart</button>
              </div>
            )}
            {isPaused && (
              <div className="snake-paused">
                <h2>PAUSED</h2>
                <p>Press P to resume</p>
              </div>
            )}
          </div>

          <div className="snake-controls">
            <h3>CONTROLS</h3>
            <div className="snake-control-list">
              <div>↑ / W Up</div>
              <div>↓ / S Down</div>
              <div>← / A Left</div>
              <div>→ / D Right</div>
              <div>P Pause</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
