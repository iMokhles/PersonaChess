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
const DEBUG = true;

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
    log('[ChessBoard] getMoveOptions called for square:', square);
    
    // Get the moves for the square (from ViewModel)
    const moves = boardViewModel.getLegalMoves(square);
    log('[ChessBoard] Found', moves.length, 'legal moves for', square);

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
      
      if (pieceAtTarget && pieceAtTarget.color !== pieceAtSource?.color) {
        // Larger circle for capturing (more visible)
        newSquares[move.to] = {
          background: 'radial-gradient(circle, rgba(0,0,0,.3) 85%, transparent 85%)',
          borderRadius: '50%'
        };
      } else {
        // Smaller circle for moving (more visible)
        newSquares[move.to] = {
          background: 'radial-gradient(circle, rgba(0,0,0,.2) 25%, transparent 25%)',
          borderRadius: '50%'
        };
      }
    }

    // Set the square clicked to move from to yellow
    newSquares[square] = {
      backgroundColor: 'rgba(255, 255, 0, 0.4)'
    };

    // Set the option squares
    setOptionSquares(newSquares);
    log('[ChessBoard] Set option squares:', Object.keys(newSquares));

    // Return true to indicate that there are move options
    return true;
  }, []);

  /**
   * Handle square click - similar to the example pattern
   */
  const handleSquareClick = useCallback((square: Square) => {
    log('[ChessBoard] handleSquareClick called', { square, moveFrom });
    
    // Get piece at clicked square
    const piece = boardViewModel.getPieceAt(square);
    const currentTurn = boardViewModel.turn;
    
    log('[ChessBoard] Piece at square:', piece, 'Current turn:', currentTurn);

    // Piece clicked to move (must be piece of current turn)
    if (!moveFrom) {
      // Only show moves if there's a piece and it's the correct turn
      if (piece && piece.color === currentTurn) {
        // Get the move options for the square
        const hasMoveOptions = getMoveOptions(square);

        // If move options, set the moveFrom to the square
        if (hasMoveOptions) {
          setMoveFrom(square);
          log('[ChessBoard] Set moveFrom to:', square);
        }
      } else {
        log('[ChessBoard] No piece or wrong turn, clearing options');
        setOptionSquares({});
      }

      // Return early
      return;
    }

    // Square clicked to move to, check if valid move
    const moves = boardViewModel.getLegalMoves(moveFrom);
    const foundMove = moves.find(m => m.from === moveFrom && m.to === square);
    log('[ChessBoard] Looking for move from', moveFrom, 'to', square, 'Found:', foundMove);

    // Not a valid move
    if (!foundMove) {
      // Check if clicked on new piece of current turn
      if (piece && piece.color === currentTurn) {
        const hasMoveOptions = getMoveOptions(square);
        setMoveFrom(hasMoveOptions ? square : null);
        if (!hasMoveOptions) {
          setOptionSquares({});
        }
      } else {
        // Clear selection if clicked on empty square or wrong piece
        setMoveFrom(null);
        setOptionSquares({});
      }

      // Return early
      return;
    }

    // Is normal move - try to make it
    log('[ChessBoard] Making move from', moveFrom, 'to', square);
    const moveSuccess = boardViewModel.makeMove(moveFrom, square);

    if (moveSuccess) {
      // Clear moveFrom and optionSquares
      setMoveFrom(null);
      setOptionSquares({});
      log('[ChessBoard] Move successful, cleared selection');
      // Note: Auto-play happens automatically in ViewModel
    } else {
      log('[ChessBoard] Move failed');
      // If invalid, setMoveFrom and getMoveOptions
      if (piece && piece.color === currentTurn) {
        const hasMoveOptions = getMoveOptions(square);
        if (hasMoveOptions) {
          setMoveFrom(square);
        } else {
          setMoveFrom(null);
          setOptionSquares({});
        }
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
    if (boardViewModel.lastMove && !moveFrom) {
      // Only show last move highlight if no piece is selected
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

    log('[ChessBoard] Custom square styles:', Object.keys(styles));
    return styles;
  }, [optionSquares, boardViewModel.lastMove, moveFrom]);

  log('[ChessBoard] Rendering with FEN:', boardViewModel.fen, 'Turn:', boardViewModel.turn, 'MoveFrom:', moveFrom);

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
