/**
 * ChessBoard Component
 * View layer - React component for displaying the chess board
 * Uses react-chessboard and observes BoardViewModel
 * 
 * Supports both drag-and-drop and click-to-move with visual indicators
 */

import React, { useCallback, useState, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { Chessboard } from 'react-chessboard';
import { Square } from 'chess.js';
import { boardViewModel } from '../../viewmodels';
import './ChessBoard.css';

interface ChessBoardProps {
  boardWidth?: number;
}

// Set to true for debugging, false for production
const DEBUG = false;

const log = (...args: any[]) => {
  if (DEBUG) console.log(...args);
};

export const ChessBoardComponent: React.FC<ChessBoardProps> = observer(({ 
  boardWidth = 480 
}) => {
  // Track square clicked to move from (UI state)
  const [moveFrom, setMoveFrom] = useState<Square | null>(null);
  // Track option squares to show valid moves (UI state)
  const [optionSquares, setOptionSquares] = useState<Record<string, React.CSSProperties>>({});

  /**
   * Get the move options for a square to show valid moves
   * Similar to the example pattern
   */
  const getMoveOptions = useCallback((square: Square): boolean => {
    // Get the moves for the square (from ViewModel)
    const moves = boardViewModel.getLegalMoves(square);

    // If no moves, clear the option squares
    if (moves.length === 0) {
      setOptionSquares({});
      return false;
    }

    // Create a new object to store the option squares
    const newSquares: Record<string, React.CSSProperties> = {};

    // Loop through the moves and set the option squares
    for (const move of moves) {
      const pieceAtTarget = boardViewModel.getPieceAt(move.to);
      const pieceAtSource = boardViewModel.getPieceAt(square);
      
      newSquares[move.to] = {
        background: pieceAtTarget && pieceAtTarget.color !== pieceAtSource?.color
          ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)' // larger circle for capturing
          : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)', // smaller circle for moving
        borderRadius: '50%'
      };
    }

    // Set the square clicked to move from to yellow
    newSquares[square] = {
      background: 'rgba(255, 255, 0, 0.4)'
    };

    // Set the option squares
    setOptionSquares(newSquares);

    // Return true to indicate that there are move options
    return true;
  }, []);

  /**
   * Handle square click - similar to the example pattern
   */
  const handleSquareClick = useCallback((square: Square) => {
    log('[ChessBoard] handleSquareClick called', { square, moveFrom });

    // Piece clicked to move
    if (!moveFrom) {
      // Get the move options for the square
      const hasMoveOptions = getMoveOptions(square);

      // If move options, set the moveFrom to the square
      if (hasMoveOptions) {
        setMoveFrom(square);
      }

      // Return early
      return;
    }

    // Square clicked to move to, check if valid move
    const moves = boardViewModel.getLegalMoves(moveFrom);
    const foundMove = moves.find(m => m.from === moveFrom && m.to === square);

    // Not a valid move
    if (!foundMove) {
      // Check if clicked on new piece
      const hasMoveOptions = getMoveOptions(square);

      // If new piece, setMoveFrom, otherwise clear moveFrom
      setMoveFrom(hasMoveOptions ? square : null);
      if (!hasMoveOptions) {
        setOptionSquares({});
      }

      // Return early
      return;
    }

    // Is normal move - try to make it
    const moveSuccess = boardViewModel.makeMove(moveFrom, square);

    if (moveSuccess) {
      // Clear moveFrom and optionSquares
      setMoveFrom(null);
      setOptionSquares({});
      // Note: Auto-play happens automatically in ViewModel
    } else {
      // If invalid, setMoveFrom and getMoveOptions
      const hasMoveOptions = getMoveOptions(square);

      // If new piece, setMoveFrom, otherwise clear moveFrom
      if (hasMoveOptions) {
        setMoveFrom(square);
      } else {
        setMoveFrom(null);
        setOptionSquares({});
      }
    }
  }, [moveFrom, getMoveOptions]);

  /**
   * Handle piece drop - similar to the example pattern
   */
  const handlePieceDrop = useCallback((
    sourceSquare: Square,
    targetSquare: Square
  ): boolean => {
    log('[ChessBoard] handlePieceDrop called', { sourceSquare, targetSquare });

    // Type narrow targetSquare potentially being null (e.g. if dropped off board)
    if (!targetSquare) {
      return false;
    }

    // Try to make the move according to chess.js logic (via ViewModel)
    const moveSuccess = boardViewModel.makeMove(sourceSquare, targetSquare);

    if (moveSuccess) {
      // Clear moveFrom and optionSquares
      setMoveFrom(null);
      setOptionSquares({});
      // Note: Auto-play happens automatically in ViewModel
      return true;
    } else {
      return false;
    }
  }, []);

  // Combine option squares with last move highlighting
  const customSquareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = { ...optionSquares };
    
    // Highlight last move (if not already highlighted by option squares)
    if (boardViewModel.lastMove) {
      if (!styles[boardViewModel.lastMove.from]) {
        styles[boardViewModel.lastMove.from] = {
          backgroundColor: 'rgba(255, 255, 0, 0.4)',
        };
      }
      if (!styles[boardViewModel.lastMove.to]) {
        styles[boardViewModel.lastMove.to] = {
          backgroundColor: 'rgba(255, 255, 0, 0.4)',
        };
      }
    }

    return styles;
  }, [optionSquares, boardViewModel.lastMove]);

  log('[ChessBoard] Rendering with FEN:', boardViewModel.fen, 'Turn:', boardViewModel.turn);

  // Set the chessboard options (similar to the example)
  return (
    <div className="chessboard-container">
      <div className="board-wrapper">
        <Chessboard
          position={boardViewModel.fen} // Position from ViewModel (like chessPosition in example)
          onPieceDrop={handlePieceDrop} // Handler for drag and drop
          onSquareClick={handleSquareClick} // Handler for click to move
          arePiecesDraggable={true}
          boardWidth={boardWidth}
          customSquareStyles={customSquareStyles} // Show valid moves and highlights
          customBoardStyle={{
            borderRadius: '8px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          }}
          customDarkSquareStyle={{
            backgroundColor: '#769656',
          }}
          customLightSquareStyle={{
            backgroundColor: '#eeeed2',
          }}
          animationDuration={200}
        />
      </div>
      
      <div className="board-info">
        <div className="turn-indicator">
          <span className={`turn-dot ${boardViewModel.turn}`}></span>
          <span>{boardViewModel.gameStatus}</span>
        </div>
        
        <div className="move-count">
          Move: {boardViewModel.moveCount}
        </div>
      </div>
    </div>
  );
});

ChessBoardComponent.displayName = 'ChessBoard';
