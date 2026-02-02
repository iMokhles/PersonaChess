/**
 * ChessBoard Component
 * View layer - React component for displaying the chess board
 * Uses react-chessboard and observes BoardViewModel
 */

import React, { useCallback, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Chessboard } from 'react-chessboard';
import { Square } from 'chess.js';
import { boardViewModel } from '../../viewmodels';
import './ChessBoard.css';

interface ChessBoardProps {
  boardWidth?: number;
}

export const ChessBoardComponent: React.FC<ChessBoardProps> = observer(({ 
  boardWidth = 480 
}) => {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);

  const handlePieceDrop = useCallback((
    sourceSquare: Square,
    targetSquare: Square
  ): boolean => {
    console.log('[ChessBoard] handlePieceDrop called', { sourceSquare, targetSquare });
    
    // Try to make the move
    const result = boardViewModel.makeMove(sourceSquare, targetSquare);
    
    console.log('[ChessBoard] makeMove result:', result);
    
    if (result) {
      setSelectedSquare(null);
      console.log('[ChessBoard] Move successful, cleared selection');
    } else {
      console.log('[ChessBoard] Move failed - invalid move');
    }
    
    return result;
  }, []);

  const handleSquareClick = useCallback((square: Square) => {
    console.log('[ChessBoard] handleSquareClick called', { square, selectedSquare });
    
    if (selectedSquare) {
      // If we have a selected square, try to make a move
      const result = boardViewModel.makeMove(selectedSquare, square);
      console.log('[ChessBoard] Click move result:', result);
      
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
      console.log('[ChessBoard] Legal moves for square:', square, legalMoves.length);
      
      if (legalMoves.length > 0) {
        setSelectedSquare(square);
      }
    }
  }, [selectedSquare]);

  // Custom square styles for last move highlighting and selected square
  const customSquareStyles: Record<string, React.CSSProperties> = {};
  
  if (boardViewModel.lastMove) {
    customSquareStyles[boardViewModel.lastMove.from] = {
      backgroundColor: 'rgba(255, 255, 0, 0.4)',
    };
    customSquareStyles[boardViewModel.lastMove.to] = {
      backgroundColor: 'rgba(255, 255, 0, 0.4)',
    };
  }

  // Highlight selected square
  if (selectedSquare) {
    customSquareStyles[selectedSquare] = {
      backgroundColor: 'rgba(74, 158, 255, 0.4)',
    };
    
    // Highlight legal moves from selected square
    const legalMoves = boardViewModel.getLegalMoves(selectedSquare);
    legalMoves.forEach(move => {
      customSquareStyles[move.to] = {
        backgroundColor: 'rgba(74, 158, 255, 0.2)',
      };
    });
  }

  console.log('[ChessBoard] Rendering with FEN:', boardViewModel.fen, 'Turn:', boardViewModel.turn);

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
