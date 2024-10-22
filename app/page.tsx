'use client'

import { useState, useCallback } from 'react'
import { Button } from "@/components/ui/button"

type Player = 'X' | 'O' | null

interface GameState {
  board: Player[][]
  currentPlayer: Player
  winner: Player | 'draw' | null
}

const initialState: GameState = {
  board: Array(3).fill(null).map(() => Array(3).fill(null)),
  currentPlayer: 'X',
  winner: null,
}

export default function TicTacToe() {
  const [gameState, setGameState] = useState<GameState>(initialState)

  const handleCellClick = useCallback((row: number, col: number) => {
    if (gameState.board[row][col] || gameState.winner) return

    const newBoard = gameState.board.map(r => [...r])
    newBoard[row][col] = gameState.currentPlayer

    const winner = checkWinner(newBoard)
    const nextPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X'

    setGameState({
      board: newBoard,
      currentPlayer: nextPlayer,
      winner: winner,
    })

    if (nextPlayer === 'O' && !winner) {
      setTimeout(() => makeAIMove(newBoard), 500)
    }
  }, [gameState])

  const makeAIMove = (board: Player[][]) => {
    const [row, col] = findBestMove(board)
    const newBoard = board.map(r => [...r])
    newBoard[row][col] = 'O'

    const winner = checkWinner(newBoard)

    setGameState({
      board: newBoard,
      currentPlayer: 'X',
      winner: winner,
    })
  }

  const resetGame = () => {
    setGameState(initialState)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Tic Tac Toe</h1>
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-8">
        {gameState.board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <Button
              key={`${rowIndex}-${colIndex}`}
              className={`w-16 h-16 sm:w-24 sm:h-24 text-2xl sm:text-4xl font-bold ${
              cell ? 'bg-black hover:bg-gray-800 text-white' : 'bg-white hover:bg-gray-100'
              }`}
              onClick={() => handleCellClick(rowIndex, colIndex)}
            >
              {cell}
            </Button>
          ))
        )}
      </div>
      {gameState.winner && (
        <div className="text-2xl font-bold mb-4 text-gray-800">
          {gameState.winner === 'draw' ? "It's a draw!" : `${gameState.winner} wins!`}
        </div>
      )}
      <Button 
        onClick={resetGame} 
        className="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
      >
        Reset Game
      </Button>
    </div>
  )
}

function checkWinner(board: Player[][]): Player | 'draw' | null {
  // Check rows, columns, and diagonals
  for (let i = 0; i < 3; i++) {
    if (board[i][0] && board[i][0] === board[i][1] && board[i][0] === board[i][2]) {
      return board[i][0]
    }
    if (board[0][i] && board[0][i] === board[1][i] && board[0][i] === board[2][i]) {
      return board[0][i]
    }
  }
  if (board[0][0] && board[0][0] === board[1][1] && board[0][0] === board[2][2]) {
    return board[0][0]
  }
  if (board[0][2] && board[0][2] === board[1][1] && board[0][2] === board[2][0]) {
    return board[0][2]
  }

  // Check for draw
  if (board.every(row => row.every(cell => cell !== null))) {
    return 'draw'
  }

  return null
}

function findBestMove(board: Player[][]): [number, number] {
  let bestScore = -Infinity
  let bestMove: [number, number] = [-1, -1]

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      if (board[row][col] === null) {
        board[row][col] = 'O'
        const score = minimax(board, 0, false)
        board[row][col] = null
        if (score > bestScore) {
          bestScore = score
          bestMove = [row, col]
        }
      }
    }
  }

  return bestMove
}

function minimax(board: Player[][], depth: number, isMaximizing: boolean): number {
  const winner = checkWinner(board)
  if (winner === 'O') return 1
  if (winner === 'X') return -1
  if (winner === 'draw') return 0

  if (isMaximizing) {
    let bestScore = -Infinity
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (board[row][col] === null) {
          board[row][col] = 'O'
          const score = minimax(board, depth + 1, false)
          board[row][col] = null
          bestScore = Math.max(score, bestScore)
        }
      }
    }
    return bestScore
  } else {
    let bestScore = Infinity
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (board[row][col] === null) {
          board[row][col] = 'X'
          const score = minimax(board, depth + 1, true)
          board[row][col] = null
          bestScore = Math.min(score, bestScore)
        }
      }
    }
    return bestScore
  }
}