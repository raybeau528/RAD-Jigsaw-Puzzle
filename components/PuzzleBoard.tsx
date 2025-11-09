import React, { useRef, useEffect, useCallback } from 'react';
import { Difficulty, PuzzlePiece, GameState, SegmentParams } from '../types';
import { generatePuzzlePieces, createPiecePath, generateCuts, drawCut } from '../utils/puzzleLogic';

interface PuzzleBoardProps {
  imageUrl: string;
  difficulty: Difficulty;
  onComplete: () => void;
  puzzleSeed: number;
  showPreview: boolean;
  setPiecesForSaving: (pieces: PuzzlePiece[]) => void;
  loadedPieces: PuzzlePiece[] | null;
  gameState: GameState;
  boardRect: { x: number; y: number; width: number; height: number; };
}

const PuzzleBoard: React.FC<PuzzleBoardProps> = ({
  imageUrl,
  difficulty,
  onComplete,
  puzzleSeed,
  showPreview,
  setPiecesForSaving,
  loadedPieces,
  gameState,
  boardRect
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(new Image());
  const piecesRef = useRef<PuzzlePiece[]>([]);
  const piecePathsRef = useRef<Map<number, Path2D>>(new Map());
  const cutsRef = useRef<{ horizontal: SegmentParams[][], vertical: SegmentParams[][] } | null>(null);
  const selectedPieceRef = useRef<{ piece: PuzzlePiece, offsetX: number, offsetY: number } | null>(null);
  const boardSize = useRef({ width: 0, height: 0, top: 0, left: 0 });
  const pieceSize = useRef({ width: 0, height: 0 });
  const imageCrop = useRef({ x: 0, y: 0, w: 0, h: 0 });

  const initPuzzle = useCallback(() => {
    if (!containerRef.current || !imageRef.current.complete || imageRef.current.naturalWidth === 0 || boardRect.width === 0) return;
    
    const container = containerRef.current;
    const { width: canvasW, height: canvasH } = container.getBoundingClientRect();
    
    boardSize.current = {
      width: boardRect.width,
      height: boardRect.height,
      top: boardRect.y,
      left: boardRect.x,
    };
    pieceSize.current = { width: boardRect.width / difficulty.cols, height: boardRect.height / difficulty.rows };

    cutsRef.current = generateCuts(difficulty, puzzleSeed);

    if (loadedPieces) {
      piecesRef.current = loadedPieces;
    } else {
      piecesRef.current = generatePuzzlePieces(difficulty, puzzleSeed);
      piecesRef.current.forEach(p => {
        p.finalX = boardSize.current.left + p.col * pieceSize.current.width;
        p.finalY = boardSize.current.top + p.row * pieceSize.current.height;
        if (gameState === GameState.PLAYING) {
            p.x = Math.random() * (canvasW - pieceSize.current.width);
            p.y = Math.random() * (canvasH - pieceSize.current.height);
        } else { // complete state
            p.x = p.finalX;
            p.y = p.finalY;
            p.isLocked = true;
        }
      });
    }

    setPiecesForSaving(piecesRef.current);

    const img = imageRef.current;
    const boardAspectRatio = difficulty.cols / difficulty.rows;
    const imgAspectRatio = img.naturalWidth / img.naturalHeight;
    let sX = 0, sY = 0, sW = img.naturalWidth, sH = img.naturalHeight;
    if (imgAspectRatio > boardAspectRatio) {
        sW = img.naturalHeight * boardAspectRatio;
        sX = (img.naturalWidth - sW) / 2;
    } else {
        sH = img.naturalWidth / boardAspectRatio;
        sY = (img.naturalHeight - sH) / 2;
    }
    imageCrop.current = { x: sX, y: sY, w: sW, h: sH };

    const canvas = canvasRef.current;
    const previewCanvas = previewCanvasRef.current;
    if (canvas) {
      canvas.width = canvasW;
      canvas.height = canvasH;
    }
    if (previewCanvas) {
      previewCanvas.width = canvasW;
      previewCanvas.height = canvasH;
    }

    requestAnimationFrame(() => {
      draw();
      drawPreview();
    });
  }, [difficulty, puzzleSeed, loadedPieces, setPiecesForSaving, gameState, boardRect]);

  useEffect(() => {
    const img = imageRef.current;
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    img.onload = initPuzzle;
    
    const handleResize = () => requestAnimationFrame(initPuzzle);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [imageUrl, initPuzzle]);
  
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw unlocked pieces first, then locked
    const unlocked = piecesRef.current.filter(p => !p.isLocked);
    const locked = piecesRef.current.filter(p => p.isLocked);
    
    const drawPiece = (piece: PuzzlePiece) => {
        const path = createPiecePath(piece, pieceSize.current.width, pieceSize.current.height);
        piecePathsRef.current.set(piece.id, path);
        
        ctx.save();
        if (!piece.isLocked) {
          ctx.shadowColor = 'rgba(0,0,0,0.5)';
          ctx.shadowBlur = 8;
          ctx.shadowOffsetX = 4;
          ctx.shadowOffsetY = 4;
        }
        
        ctx.clip(path);
        
        // Correctly calculate the destination coordinates for the full image.
        // This shifts the entire puzzle image so that the correct portion
        // for this specific piece appears within the clipped path.
        const dx = piece.x - (piece.col * pieceSize.current.width);
        const dy = piece.y - (piece.row * pieceSize.current.height);

        ctx.drawImage(
            imageRef.current,
            imageCrop.current.x, imageCrop.current.y,
            imageCrop.current.w, imageCrop.current.h,
            dx,
            dy,
            boardSize.current.width, boardSize.current.height
        );
        
        ctx.restore();
        
        ctx.save();
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 1;
        ctx.stroke(path);
        ctx.restore();
    };
    
    locked.forEach(drawPiece);
    unlocked.forEach(drawPiece);
  }, []);

  const drawPreview = useCallback(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas || !cutsRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (showPreview) {
        ctx.save();
        
        // Draw semi-transparent image first
        ctx.globalAlpha = 0.9;
        ctx.drawImage(
            imageRef.current,
            imageCrop.current.x, imageCrop.current.y,
            imageCrop.current.w, imageCrop.current.h,
            boardSize.current.left,
            boardSize.current.top,
            boardSize.current.width, boardSize.current.height
        );

        // Draw cut lines on top
        ctx.globalAlpha = 1.0;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 2;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 4;
        
        const { rows, cols } = difficulty;
        const { left: destX, top: destY } = boardSize.current;
        const { width: pieceWidth, height: pieceHeight } = pieceSize.current;
        const { horizontal, vertical } = cutsRef.current;

        for (let r = 0; r < rows - 1; r++) {
            for (let c = 0; c < cols; c++) {
              const p1 = { x: destX + c * pieceWidth, y: destY + (r + 1) * pieceHeight };
              const p2 = { x: destX + (c + 1) * pieceWidth, y: destY + (r + 1) * pieceHeight };
              const side = { ...horizontal[r][c], flip: horizontal[r][c].flip * -1 as (1 | -1) };
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              drawCut(ctx, p1, p2, side, pieceWidth, pieceHeight);
              ctx.stroke();
            }
        }
      
        for (let c = 0; c < cols - 1; c++) {
            for (let r = 0; r < rows; r++) {
              const p1 = { x: destX + (c + 1) * pieceWidth, y: destY + r * pieceHeight };
              const p2 = { x: destX + (c + 1) * pieceWidth, y: destY + (r + 1) * pieceHeight };
              const side = vertical[c][r];
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              drawCut(ctx, p1, p2, side, pieceWidth, pieceHeight);
              ctx.stroke();
            }
        }
        ctx.restore();
    }
  }, [showPreview, difficulty]);

  useEffect(() => {
    drawPreview();
  }, [showPreview, drawPreview]);
  
  const checkWin = useCallback(() => {
    const allLocked = piecesRef.current.every(p => p.isLocked);
    if (allLocked) {
      onComplete();
    }
  }, [onComplete]);

  const snapAndGroup = useCallback((movedPiece: PuzzlePiece): boolean => {
    const neighbors = [
      { dx: 0, dy: -1 }, // Top
      { dx: 1, dy: 0 },  // Right
      { dx: 0, dy: 1 }, // Bottom
      { dx: -1, dy: 0 }, // Left
    ];
    
    const tolerance = pieceSize.current.width * 0.25;

    for (const { dx, dy } of neighbors) {
      const neighbor = piecesRef.current.find(p => p.row === movedPiece.row + dy && p.col === movedPiece.col + dx);
      if (neighbor && neighbor.groupId !== movedPiece.groupId) {
        const snapX = neighbor.x - dx * pieceSize.current.width;
        const snapY = neighbor.y - dy * pieceSize.current.height;

        if (Math.abs(movedPiece.x - snapX) < tolerance && Math.abs(movedPiece.y - snapY) < tolerance) {
          const oldGroupId = movedPiece.groupId;
          const newGroupId = neighbor.groupId;
          const deltaX = snapX - movedPiece.x;
          const deltaY = snapY - movedPiece.y;

          piecesRef.current.forEach(p => {
            if (p.groupId === oldGroupId) {
              p.x += deltaX;
              p.y += deltaY;
              p.groupId = newGroupId;
            }
          });

          if (neighbor.isLocked) {
            piecesRef.current.forEach(p => {
              if (p.groupId === newGroupId) {
                p.isLocked = true;
                p.x = p.finalX;
                p.y = p.finalY;
              }
            });
            checkWin();
          }

          setPiecesForSaving(piecesRef.current);
          requestAnimationFrame(draw);
          return true;
        }
      }
    }
    
    // Check for snapping to final board position
    if (Math.abs(movedPiece.x - movedPiece.finalX) < tolerance && Math.abs(movedPiece.y - movedPiece.finalY) < tolerance) {
      const groupId = movedPiece.groupId;
      const deltaX = movedPiece.finalX - movedPiece.x;
      const deltaY = movedPiece.finalY - movedPiece.y;

      piecesRef.current.forEach(p => {
        if (p.groupId === groupId) {
          p.isLocked = true;
          p.x += deltaX; // Snap precisely
          p.y += deltaY;
        }
      });
      checkWin();
      setPiecesForSaving(piecesRef.current);
      requestAnimationFrame(draw);
      return true;
    }

    return false;
  }, [checkWin, draw, setPiecesForSaving]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (gameState !== GameState.PLAYING) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const clickedPieces = piecesRef.current
        .filter(p => !p.isLocked)
        .sort((a,b) => piecesRef.current.indexOf(b) - piecesRef.current.indexOf(a));

    for (const piece of clickedPieces) {
        const path = piecePathsRef.current.get(piece.id);
        const ctx = canvasRef.current?.getContext('2d');
        if (path && ctx && ctx.isPointInPath(path, x, y)) {
            selectedPieceRef.current = { piece, offsetX: x - piece.x, offsetY: y - piece.y };
            
            // Bring group to front
            const group = piecesRef.current.filter(p => p.groupId === piece.groupId);
            const others = piecesRef.current.filter(p => p.groupId !== piece.groupId);
            piecesRef.current = [...others, ...group];
            
            requestAnimationFrame(draw);
            break;
        }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!selectedPieceRef.current || gameState !== GameState.PLAYING) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const { piece, offsetX, offsetY } = selectedPieceRef.current;
    const newX = x - offsetX;
    const newY = y - offsetY;
    const deltaX = newX - piece.x;
    const deltaY = newY - piece.y;

    piecesRef.current.forEach(p => {
        if (p.groupId === piece.groupId) {
            p.x += deltaX;
            p.y += deltaY;
        }
    });

    if (snapAndGroup(piece)) {
      selectedPieceRef.current = null;
    }
    
    requestAnimationFrame(draw);
  };
  
  const handlePointerUp = () => {
    if (selectedPieceRef.current) {
        snapAndGroup(selectedPieceRef.current.piece);
    }
    selectedPieceRef.current = null;
  };
  
  return (
    <div ref={containerRef} className="w-full h-full touch-none">
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="absolute top-0 left-0"
      />
      <canvas
        ref={previewCanvasRef}
        className="absolute top-0 left-0 pointer-events-none"
      />
    </div>
  );
};

export default PuzzleBoard;