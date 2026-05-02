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
const DEBUG = false; // Disabled to prevent performance issues

const log = (...args: unknown[]) => {
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
    
    // Check if user can move this piece (when auto-play is enabled)
    if (boardViewModel.autoPlayEnabled) {
      const piece = boardViewModel.getPieceAt(square);
      if (piece) {
        const pieceColor = piece.color; // 'w' or 'b'
        // User can only move pieces of the side that engine is NOT playing for
        if (pieceColor === boardViewModel.enginePlaysFor) {
          log('[ChessBoard] Cannot move engine\'s pieces when auto-play is enabled');
          setOptionSquares({});
          return false;
        }
      }
    }
    
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

    // Square clicked to move to, check if valid move (exactly like the example)
    if (moveFrom) {
      const moves = boardViewModel.getLegalMoves(moveFrom as Square);
      const foundMove = moves.find(m => m.from === moveFrom && m.to === square);
      log('[ChessBoard] Looking for move from', moveFrom, 'to', square, 'Found:', foundMove);

      // If it's a valid move, make it (this allows capturing engine pieces)
      if (foundMove) {
        const moveSuccess = boardViewModel.makeMove(moveFrom as Square, square);
        if (moveSuccess) {
          setMoveFrom(null);
          setOptionSquares({});
          log('[ChessBoard] Move successful, cleared selection');
        } else {
          log('[ChessBoard] Move failed');
        }
        return;
      }

      // Not a valid move - check if clicked on new piece
      log('[ChessBoard] Not a valid move, checking for new piece');
      
      // If clicked on an engine piece when auto-play is enabled, don't allow selecting it
      if (boardViewModel.autoPlayEnabled && piece) {
        const pieceAtSquare = boardViewModel.getPieceAt(square);
        if (pieceAtSquare && pieceAtSquare.color === boardViewModel.enginePlaysFor) {
          log('[ChessBoard] Cannot select engine\'s pieces to move');
          setMoveFrom(null);
          setOptionSquares({});
          return;
        }
      }
      
      // Check if clicked on new piece (user's piece)
      const hasMoveOptions = getMoveOptions(square as Square);

      // If new piece, setMoveFrom, otherwise clear moveFrom (exactly like example)
      setMoveFrom(hasMoveOptions ? square : null);
      if (!hasMoveOptions) {
        setOptionSquares({});
      }

      // Return early
      return;
    }

    // Piece clicked to move (exactly like the example)
    if (!moveFrom && piece) {
      log('[ChessBoard] Piece clicked, getting move options');
      
      // Check if this is an engine piece (when auto-play is enabled)
      // If so, don't allow selecting it to move
      if (boardViewModel.autoPlayEnabled) {
        const pieceAtSquare = boardViewModel.getPieceAt(square);
        if (pieceAtSquare && pieceAtSquare.color === boardViewModel.enginePlaysFor) {
          log('[ChessBoard] Cannot select engine\'s pieces to move');
          setOptionSquares({});
          setMoveFrom(null);
          return;
        }
      }
      
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

    // Check if user can move this piece (when auto-play is enabled)
    if (boardViewModel.autoPlayEnabled) {
      const piece = boardViewModel.getPieceAt(sourceSquare);
      if (piece && piece.color === boardViewModel.enginePlaysFor) {
        log('[ChessBoard] Cannot drag engine\'s pieces when auto-play is enabled');
        return false;
      }
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
    const feedback = boardViewModel.recentMoveFeedback;
    
    // Highlight last move (if not already highlighted by option squares)
    if (boardViewModel.lastMove && !moveFrom) {
      if (!styles[boardViewModel.lastMove.from]) {
        styles[boardViewModel.lastMove.from] = {
          background:
            'radial-gradient(circle at center, color-mix(in srgb, var(--pc-accent) 20%, transparent), color-mix(in srgb, var(--pc-accent) 8%, transparent))',
          boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--pc-accent) 22%, transparent)',
        };
      }
      if (!styles[boardViewModel.lastMove.to]) {
        styles[boardViewModel.lastMove.to] = {
          background: feedback?.isBrilliant
            ? 'radial-gradient(circle at center, color-mix(in srgb, var(--pc-accent) 38%, transparent), color-mix(in srgb, var(--pc-accent) 16%, transparent))'
            : 'radial-gradient(circle at center, color-mix(in srgb, var(--pc-accent) 24%, transparent), color-mix(in srgb, var(--pc-accent) 10%, transparent))',
          boxShadow: feedback?.isBrilliant
            ? 'inset 0 0 0 1px color-mix(in srgb, var(--pc-accent) 34%, transparent), 0 0 20px color-mix(in srgb, var(--pc-accent) 14%, transparent)'
            : 'inset 0 0 0 1px color-mix(in srgb, var(--pc-accent) 24%, transparent)',
        };
      }
    }

    return styles;
  }, [optionSquares, boardViewModel.lastMove, boardViewModel.recentMoveFeedback, moveFrom]);

  // Get move arrows from ViewModel (memoized to prevent excessive re-renders)
  const moveArrows = useMemo(() => {
    if (!boardViewModel.showMoveArrows) {
      return [];
    }
    
    const arrows = boardViewModel.moveArrows;
    if (!arrows || arrows.length === 0) {
      return [];
    }
    
    // Validate arrows format - ensure all entries are valid Arrow objects
    const validArrows = arrows.filter(arrow => {
      if (!arrow || typeof arrow !== 'object') {
        return false;
      }
      if (!arrow.startSquare || !arrow.endSquare || !arrow.color) {
        return false;
      }
      const { startSquare, endSquare, color } = arrow;
      if (typeof startSquare !== 'string' || typeof endSquare !== 'string' || typeof color !== 'string') {
        return false;
      }
      // Validate square format (a-h, 1-8)
      if (!/^[a-h][1-8]$/.test(startSquare) || !/^[a-h][1-8]$/.test(endSquare)) {
        return false;
      }
      return true;
    });
    
    return validArrows;
  }, [boardViewModel.showMoveArrows, boardViewModel.analyzedLegalMovesCount, boardViewModel.fen]);

  // Try using options prop first (like example), fallback to direct props
  const chessboardOptions = {
    onPieceDrop: handlePieceDrop,
    onSquareClick: handleSquareClick,
    position: boardViewModel.fen,
    squareStyles: squareStyles,
    arrows: moveArrows.length > 0 ? moveArrows : undefined, // Only pass arrows if we have valid ones
    id: 'click-or-drag-to-move',
    boardWidth: boardWidth,
    boardOrientation: boardViewModel.boardFlipped ? 'black' : 'white',
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
      <div className={`board-wrapper ${boardViewModel.recentMoveFeedback?.isBrilliant ? 'board-wrapper-brilliant' : ''}`}>
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
