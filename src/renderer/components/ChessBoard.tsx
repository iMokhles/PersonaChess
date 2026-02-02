/**
 * ChessBoard Component
 * View layer - React component for displaying the chess board
 * Uses react-chessboard and observes BoardViewModel
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
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);

  // Use synchronous version for immediate UI feedback
  const handlePieceDrop = useCallback((
    sourceSquare: Square,
    targetSquare: Square
  ): boolean => {
    log('[ChessBoard] handlePieceDrop called', { sourceSquare, targetSquare });
    
    // Use sync version for immediate board update
    const result = boardViewModel.makeMoveSync(sourceSquare, targetSquare);
    
    log('[ChessBoard] makeMove result:', result);
    
    if (result) {
      setSelectedSquare(null);
      log('[ChessBoard] Move successful, cleared selection');
    } else {
      log('[ChessBoard] Move failed - invalid move');
    }
    
    return result;
  }, []);

  const handleSquareClick = useCallback((square: Square) => {
    log('[ChessBoard] handleSquareClick called', { square, selectedSquare });
    
    if (selectedSquare) {
      // If we have a selected square, try to make a move
      const result = boardViewModel.makeMoveSync(selectedSquare, square);
      log('[ChessBoard] Click move result:', result);
      
      if (result) {
        setSelectedSquare(null);
      } else {
        // If move failed, check if clicking on a piece of the current turn
        const legalMoves = boardViewModel.getLegalMoves(square);
        if (legalMoves.length > 0) {
          setSelectedSquare(square);
        } else {
          setSelectedSquare(null);
        }
      }
    } else {
      // Select a square if it has legal moves
      const legalMoves = boardViewModel.getLegalMoves(square);
      log('[ChessBoard] Legal moves for square:', square, legalMoves.length);
      
      if (legalMoves.length > 0) {
        setSelectedSquare(square);
      }
    }
  }, [selectedSquare]);

  // Memoize custom square styles to avoid recalculating on every render
  const customSquareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};
    
    // Highlight last move
    if (boardViewModel.lastMove) {
      styles[boardViewModel.lastMove.from] = {
        backgroundColor: 'rgba(255, 255, 0, 0.4)',
      };
      styles[boardViewModel.lastMove.to] = {
        backgroundColor: 'rgba(255, 255, 0, 0.4)',
      };
    }

    // Highlight selected square and legal moves
    if (selectedSquare) {
      styles[selectedSquare] = {
        backgroundColor: 'rgba(74, 158, 255, 0.4)',
      };
      
      // Highlight legal moves from selected square
      const legalMoves = boardViewModel.getLegalMoves(selectedSquare);
      legalMoves.forEach(move => {
        styles[move.to] = {
          backgroundColor: 'rgba(74, 158, 255, 0.2)',
        };
      });
    }

    return styles;
  }, [boardViewModel.lastMove, selectedSquare, boardViewModel.fen]);

  log('[ChessBoard] Rendering with FEN:', boardViewModel.fen, 'Turn:', boardViewModel.turn);

  return (
    <div className="chessboard-container">
      <div className="board-wrapper">
        <Chessboard
          position={boardViewModel.fen}
          onPieceDrop={handlePieceDrop}
          onSquareClick={handleSquareClick}
          arePiecesDraggable={true}
          boardWidth={boardWidth}
          customSquareStyles={customSquareStyles}
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
