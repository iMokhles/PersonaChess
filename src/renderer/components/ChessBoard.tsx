/**
 * ChessBoard Component
 * View layer - React component for displaying the chess board
 * Uses react-chessboard and observes BoardViewModel
 * 
 * Supports both drag-and-drop and click-to-move with visual indicators
 * Pattern matches the example exactly, but adapted to MVVM architecture
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
  // Track square clicked to move from (UI state) - exactly like example
  const [moveFrom, setMoveFrom] = useState<Square | string | null>(null);
  // Track option squares to show valid moves (UI state) - exactly like example
  const [optionSquares, setOptionSquares] = useState<Record<string, React.CSSProperties>>({});

  /**
   * Get the move options for a square to show valid moves
   * Exactly like the example pattern
   */
  const getMoveOptions = useCallback((square: Square): boolean => {
    log('[ChessBoard] getMoveOptions called for square:', square);
    
    // Get the moves for the square (from ViewModel instead of chessGame)
    const moves = boardViewModel.getLegalMoves(square);
    log('[ChessBoard] Found', moves.length, 'legal moves for', square);

    // If no moves, clear the option squares
    if (moves.length === 0) {
      setOptionSquares({});
      return false;
    }

    // Create a new object to store the option squares
    const newSquares: Record<string, React.CSSProperties> = {};

    // Loop through the moves and set the option squares (exactly like example)
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

    // Set the square clicked to move from to yellow (exactly like example)
    newSquares[square] = {
      background: 'rgba(255, 255, 0, 0.4)'
    };

    // Set the option squares
    setOptionSquares(newSquares);
    log('[ChessBoard] Set option squares:', Object.keys(newSquares));

    // Return true to indicate that there are move options
    return true;
  }, []);

  /**
   * Handle square click - exactly like the example pattern
   * react-chessboard v5.8.6 passes { square, piece } object
   */
  const handleSquareClick = useCallback(({ square, piece }: { square: Square; piece?: string }) => {
    log('[ChessBoard] onSquareClick called', { square, piece, moveFrom });

    // Piece clicked to move (exactly like the example)
    if (!moveFrom && piece) {
      log('[ChessBoard] Piece clicked, getting move options');
      // Get the move options for the square
      const hasMoveOptions = getMoveOptions(square as Square);

      // If move options, set the moveFrom to the square
      if (hasMoveOptions) {
        setMoveFrom(square);
        log('[ChessBoard] Set moveFrom to:', square);
      }

      // Return early
      return;
    }

    // Square clicked to move to, check if valid move (exactly like the example)
    if (moveFrom) {
      const moves = boardViewModel.getLegalMoves(moveFrom as Square);
      const foundMove = moves.find(m => m.from === moveFrom && m.to === square);
      log('[ChessBoard] Looking for move from', moveFrom, 'to', square, 'Found:', foundMove);

      // Not a valid move
      if (!foundMove) {
        log('[ChessBoard] Not a valid move, checking for new piece');
        // Check if clicked on new piece
        const hasMoveOptions = getMoveOptions(square as Square);

        // If new piece, setMoveFrom, otherwise clear moveFrom (exactly like example)
        setMoveFrom(hasMoveOptions ? square : null);
        if (!hasMoveOptions) {
          setOptionSquares({});
        }

        // Return early
        return;
      }

      // Is normal move (exactly like the example)
      const moveSuccess = boardViewModel.makeMove(moveFrom as Square, square);
      
      if (moveSuccess) {
        // Clear moveFrom and optionSquares (exactly like example)
        setMoveFrom(null);
        setOptionSquares({});
        log('[ChessBoard] Move successful, cleared selection');
        // Note: Auto-play happens automatically in ViewModel
      } else {
        log('[ChessBoard] Move failed, checking for new piece');
        // If invalid, setMoveFrom and getMoveOptions (exactly like example)
        const pieceAtSquare = boardViewModel.getPieceAt(square);
        if (pieceAtSquare) {
          const hasMoveOptions = getMoveOptions(square as Square);
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
    }
  }, [moveFrom, getMoveOptions]);

  /**
   * Handle piece drop - exactly like the example pattern
   * react-chessboard v5.8.6 passes { sourceSquare, targetSquare } object
   */
  const handlePieceDrop = useCallback(({ sourceSquare, targetSquare }: { sourceSquare: Square; targetSquare: Square | null }): boolean => {
    log('[ChessBoard] onPieceDrop called', { sourceSquare, targetSquare });

    // Type narrow targetSquare potentially being null (e.g. if dropped off board)
    if (!targetSquare) {
      return false;
    }

    // Try to make the move according to chess.js logic (via ViewModel)
    const moveSuccess = boardViewModel.makeMove(sourceSquare, targetSquare);

    if (moveSuccess) {
      // Clear moveFrom and optionSquares (exactly like example)
      setMoveFrom(null);
      setOptionSquares({});
      log('[ChessBoard] Move successful, cleared selection');
      // Note: Auto-play happens automatically in ViewModel
      return true;
    } else {
      // Return false as the move was not successful
      return false;
    }
  }, []);

  // Use optionSquares directly (exactly like example uses squareStyles)
  const squareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = { ...optionSquares };
    
    log('[ChessBoard] Computing squareStyles, optionSquares keys:', Object.keys(optionSquares));
    
    // Highlight last move (if not already highlighted by option squares)
    if (boardViewModel.lastMove && !moveFrom) {
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

    log('[ChessBoard] Final square styles:', Object.keys(styles));
    return styles;
  }, [optionSquares, boardViewModel.lastMove, moveFrom]);

  log('[ChessBoard] Rendering with FEN:', boardViewModel.fen, 'MoveFrom:', moveFrom, 'OptionSquares:', Object.keys(optionSquares));

  // Try using options prop first (like example), fallback to direct props
  const chessboardOptions = {
    onPieceDrop: handlePieceDrop,
    onSquareClick: handleSquareClick,
    position: boardViewModel.fen,
    squareStyles: squareStyles,
    id: 'click-or-drag-to-move',
    boardWidth: boardWidth,
    arePiecesDraggable: true,
    customBoardStyle: {
      borderRadius: '8px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    },
    customDarkSquareStyle: {
      backgroundColor: '#769656',
    },
    customLightSquareStyle: {
      backgroundColor: '#eeeed2',
    },
    animationDuration: 200,
  };

  // Render the chessboard - try options prop first
  return (
    <div className="chessboard-container">
      <div className="board-wrapper">
        <Chessboard options={chessboardOptions} />
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
