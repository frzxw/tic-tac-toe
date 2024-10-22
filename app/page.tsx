'use client'

import { useState, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"

type Player = '✕' | '◯' | null
type GameMode = 'vsCPU' | 'vsPlayer'

interface GameState {
  board: Player[][],
  currentPlayer: Player,
  winner: Player | 'draw' | null,
  selectedMarker: Player,
  gameMode: GameMode | null,
  winningCells: [number, number][] | null,
}

const initialState: GameState = {
  board: Array(3).fill(null).map(() => Array(3).fill(null)),
  currentPlayer: '✕',
  winner: null,
  selectedMarker: '✕',
  gameMode: null,
  winningCells: null,
}

function WelcomeUI({ onStart, toggleDarkMode, isDarkMode }: { onStart: (marker: Player, mode: GameMode) => void, toggleDarkMode: () => void, isDarkMode: boolean }) {
  const [selectedMarker, setSelectedMarker] = useState<Player>('✕')
  const [gameMode, setGameMode] = useState<GameMode | null>(null)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md transition-all duration-300 fade-in">
      <h1 className="text-4xl font-extrabold mb-8 tracking-wide text-center text-primary font-poppins">
        Tic Tac Toe
      </h1>

      <div className="mb-6">
        <p className="text-lg font-medium mb-4 text-center text-gray-800 dark:text-gray-200 font-lato">Choose your marker</p>
        <div className="flex justify-center p-4 rounded-lg bg-gray-100 dark:bg-gray-700 shadow-inner space-x-4">
          <ToggleButton 
            onClick={() => setSelectedMarker('✕')} 
            isActive={selectedMarker === '✕'}
            label="✕"
          />
          <ToggleButton 
            onClick={() => setSelectedMarker('◯')} 
            isActive={selectedMarker === '◯'}
            label="◯"
          />
        </div>
      </div>

      <div className="mb-6">
        <p className="text-lg font-medium mb-4 text-center text-gray-800 dark:text-gray-200 font-lato">Choose your opponent</p>
        <div className="flex justify-center p-4 rounded-lg bg-gray-100 dark:bg-gray-700 shadow-inner space-x-4">
          <ToggleButton 
            onClick={() => setGameMode('vsCPU')} 
            isActive={gameMode === 'vsCPU'}
            label="Computer"
          />
          <ToggleButton 
            onClick={() => setGameMode('vsPlayer')} 
            isActive={gameMode === 'vsPlayer'}
            label="Player"
          />
        </div>
      </div>

      <Button 
        onClick={() => gameMode && onStart(selectedMarker, gameMode)} 
        className="w-full bg-primary text-primary-foreground font-bold py-3 px-8 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-200 mb-4 font-lato"
      >
        Start Game
      </Button>

      <Button 
        onClick={toggleDarkMode} 
        className="w-full py-3 px-6 rounded-lg font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80 font-lato"
      >
        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </Button>
    </div>
  )
}

const ToggleButton = ({ onClick, isActive, label }: { onClick: () => void, isActive: boolean, label: string }) => (
  <Button 
    onClick={onClick} 
    className={`w-full py-3 rounded-lg font-semibold transition-colors duration-300 ${isActive ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'} font-lato`}
  >
    {label}
  </Button>
);

export default function TicTacToe() {
  const [gameState, setGameState] = useState<GameState>(initialState)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [shake, setShake] = useState(false)

  const handleStart = (marker: Player, mode: GameMode) => {
    setGameState({
      ...initialState,
      selectedMarker: marker,
      currentPlayer: marker,
      gameMode: mode,
    })
  }

  const makeAIMove = (board: Player[][]) => {
    const [row, col] = findBestMove(board)
    const newBoard = board.map(r => [...r])
    newBoard[row][col] = '◯'

    const [winner, winningCells] = checkWinner(newBoard)

    setGameState({
      ...gameState,
      board: newBoard,
      currentPlayer: '✕',
      winner: winner,
      winningCells: winningCells,
    })
  }

  const handleCellClick = useCallback((row: number, col: number) => {
    if (gameState.board[row][col] || gameState.winner) return

    const newBoard = gameState.board.map(r => [...r])
    newBoard[row][col] = gameState.currentPlayer

    const [winner, winningCells] = checkWinner(newBoard)
    const nextPlayer = gameState.currentPlayer === '✕' ? '◯' : '✕'

    setGameState({
      ...gameState,
      board: newBoard,
      currentPlayer: nextPlayer,
      winner: winner,
      winningCells: winningCells,
    })

    if (nextPlayer === '◯' && !winner && gameState.gameMode === 'vsCPU') {
      setTimeout(() => makeAIMove(newBoard), 500)
    }

    if (nextPlayer === '✕' && !winner) {
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }, [gameState, makeAIMove])

  const resetGame = () => {
    setGameState(initialState)
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  return (
    <div className={`flex flex-col min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className="flex-grow flex items-center justify-center p-4">
        {!gameState.gameMode ? (
          <WelcomeUI onStart={handleStart} toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />
        ) : (
          <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md transition-all duration-300 ${shake ? 'shake' : ''}`}>
            <h1 className="text-4xl font-bold mb-8 text-primary text-center font-poppins">Tic Tac Toe</h1>
            <div className="flex justify-center mb-8">
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                {gameState.board.map((row, rowIndex) =>
                  row.map((cell, colIndex) => (
                    <Button
                      key={`${rowIndex}-${colIndex}`}
                      className={`w-16 h-16 sm:w-24 sm:h-24 text-2xl sm:text-4xl font-bold font-lato
                        ${cell ? 'bg-primary text-primary-foreground hover:bg-primary/80' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}
                        ${gameState.winningCells?.some(([r, c]) => r === rowIndex && c === colIndex) ? 'bg-green-500 hover:bg-green-600' : ''}
                      `}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                    >
                      {cell}
                    </Button>
                  ))
                )}
              </div>
            </div>
            {gameState.winner ? (
              <div className="text-2xl font-bold mb-4 text-primary text-center font-poppins">
                {gameState.winner === 'draw' ? "It's a draw!" : `${gameState.winner} wins!`}
              </div>
            ) : (
              <div className="text-2xl font-bold mb-4 text-primary text-center font-poppins">
                {`It's ${gameState.currentPlayer} turn`}
              </div>
            )}
            <div className="flex flex-col space-y-4">
              <Button 
                onClick={resetGame} 
                className="w-full bg-primary text-primary-foreground hover:bg-primary/80 font-bold py-2 px-4 rounded-lg font-lato transform hover:scale-105 transition-transform duration-200"
              >
                Reset Game
              </Button>
              <Button 
                onClick={toggleDarkMode} 
                className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 font-bold py-2 px-4 rounded-lg font-lato"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        )}
      </div>
      <footer className="m-4 text-center text-gray-600 dark:text-gray-400 font-lato text-sm sm:text-base">
        © {new Date().getFullYear()} Fariz Wibisono. All rights reserved.
      </footer>
    </div>
  )
}

// AI logic using minimax algorithm

function checkWinner(board: Player[][]): [Player | 'draw' | null, [number, number][] | null] {
  const lines: [number, number][][] = [
    [[0, 0], [0, 1], [0, 2]],
    [[1, 0], [1, 1], [1, 2]],
    [[2, 0], [2, 1], [2, 2]],
    [[0, 0], [1, 0], [2, 0]],
    [[0, 1], [1, 1], [2, 1]],
    [[0, 2], [1, 2], [2, 2]],
    [[0, 0], [1, 1], [2, 2]],
    [[0, 2], [1, 1], [2, 0]]
  ];

  for (const line of lines) {
    const [[a, b], [c, d], [e, f]] = line;
    if (board[a][b] && board[a][b] === board[c][d] && board[a][b] === board[e][f]) {
      return [board[a][b], line];
    }
  }

  if (board.every(row => row.every(cell => cell !== null))) {
    return ['draw', null];
  }

  return [null, null];
}

function findBestMove(board: Player[][]): [number, number] {
  let bestScore = -Infinity;
  let bestMove: [number, number] = [-1, -1];

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      if (board[row][col] === null) {
        board[row][col] = '◯';
        const score = minimax(board, 0, false);
        board[row][col] = null;
        if (score > bestScore) {
          bestScore = score;
          bestMove = [row, col];
        }
      }
    }
  }

  return bestMove;
}

function minimax(board: Player[][], depth: number, isMaximizing: boolean): number {
  const [winner] = checkWinner(board);
  if (winner === '◯') return 1;
  if (winner === '✕') return -1;
  if (winner === 'draw') return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (board[row][col] === null) {
          board[row][col] = '◯';
          const score = minimax(board, depth + 1, false);
          board[row][col] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (board[row][col] === null) {
          board[row][col] = '✕';
          const score = minimax(board, depth + 1, true);
          board[row][col] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
    }
    return bestScore;
  }
}