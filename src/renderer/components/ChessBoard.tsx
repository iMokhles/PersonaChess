/**
 * ChessBoard Component
 * View layer - React component for displaying the chess board
 * Uses react-chessboard and observes BoardViewModel
 */

import React, { useCallback } from 'react';
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
  const handlePieceDrop = useCallback((
    sourceSquare: Square,
    targetSquare: Square
  ): boolean => {
    return boardViewModel.makeMove(sourceSquare, targetSquare);
  }, []);

  const handlePromotionCheck = useCallback((
    sourceSquare: Square,
    targetSquare: Square,
    piece: string
  ): boolean => {
    // Check if this is a pawn reaching the last rank
    const isPawn = piece.toLowerCase().includes('p');
    const isLastRank = targetSquare[1] === '8' || targetSquare[1] === '1';
    return isPawn && isLastRank;
  }, []);

  // Custom square styles for last move highlighting
  const customSquareStyles: Record<string, React.CSSProperties> = {};
  
  if (boardViewModel.lastMove) {
    customSquareStyles[boardViewModel.lastMove.from] = {
      backgroundColor: 'rgba(255, 255, 0, 0.4)',
    };
    customSquareStyles[boardViewModel.lastMove.to] = {
      backgroundColor: 'rgba(255, 255, 0, 0.4)',
    };
  }

  return (
    <div className="chessboard-container">
      <div className="board-wrapper">
        <Chessboard
          position={boardViewModel.fen}
          onPieceDrop={handlePieceDrop}
          onPromotionCheck={handlePromotionCheck}
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
