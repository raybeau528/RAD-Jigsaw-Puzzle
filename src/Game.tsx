import React, { useState, useCallback, useEffect, useRef, useLayoutEffect } from 'react';
import { GameState, Difficulty, PuzzlePiece, SavedGame } from './types';
import { DIFFICULTIES, PREDEFINED_PROMPTS } from './constants';
import { generateImage } from './services/geminiService';
import { saveGame, loadGame } from './utils/fileUtils';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import PuzzleBoard from './components/PuzzleBoard';
import Toast from './components/Toast';
import CompletionMessage from './components/CompletionMessage';

export default function Game() {
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [puzzleImageUrl, setPuzzleImageUrl] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>(DIFFICULTIES[1]); // Medium default
  const [puzzleSeed, setPuzzleSeed] = useState<number>(Date.now());
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [loadedPieces, setLoadedPieces] = useState<PuzzlePiece[] | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [puzzleSize, setPuzzleSize] = useState({ width: 0, height: 0 });
  const [boardRect, setBoardRect] = useState({ x: 0, y: 0, width: 0, height: 0 });
  
  const imagePreviewRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadInputRef = useRef<HTMLInputElement>(null);
  const puzzleAreaRef = useRef<HTMLDivElement>(null);
  const boardInnerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isPlayingOrComplete = gameState === GameState.PLAYING || gameState === GameState.COMPLETE;
    document.body.classList.toggle('animation-paused', isPlayingOrComplete);
  }, [gameState]);

  useLayoutEffect(() => {
    const puzzleAreaElement = puzzleAreaRef.current;
    if (!puzzleAreaElement) return;

    const resizeObserver = new ResizeObserver(entries => {
        if (!entries || entries.length === 0) return;
        
        const { width: availableWidth, height: availableHeight } = entries[0].contentRect;
        const aspectRatio = difficulty.cols / difficulty.rows;

        let targetWidth = availableWidth;
        let targetHeight = targetWidth / aspectRatio;

        if (targetHeight > availableHeight) {
            targetHeight = availableHeight;
            targetWidth = targetHeight * aspectRatio;
        }

        setPuzzleSize(prevSize => {
            if (Math.round(prevSize.width) !== Math.round(targetWidth) || Math.round(prevSize.height) !== Math.round(targetHeight)) {
                return { width: targetWidth, height: targetHeight };
            }
            return prevSize;
        });
    });

    resizeObserver.observe(puzzleAreaElement);

    return () => {
        resizeObserver.disconnect();
    };
  }, [difficulty]);

  useLayoutEffect(() => {
    const puzzleArea = puzzleAreaRef.current;
    const boardInner = boardInnerRef.current;
    if (boardInner && puzzleArea) {
      const boardInnerRect = boardInner.getBoundingClientRect();
      const puzzleAreaRect = puzzleArea.getBoundingClientRect();
      setBoardRect({
        x: boardInnerRect.left - puzzleAreaRect.left,
        y: boardInnerRect.top - puzzleAreaRect.top,
        width: boardInnerRect.width,
        height: boardInnerRect.height,
      });
    }
  }, [puzzleSize, gameState]);
  
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleGenerate = useCallback(async (prompt: string) => {
    if (!prompt) {
      setError("Please enter a prompt.");
      return;
    }
    setIsGenerating(true);
    setError(null);
    try {
      const base64Image = await generateImage(prompt, difficulty.cols/difficulty.rows);
      setLoadedPieces(null);
      setPuzzleImageUrl(`data:image/png;base64,${base64Image}`);
      setGameState(GameState.IMAGE_LOADED);
      showToast("Image generated successfully!");
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during image generation.";
      setError(errorMessage);
      showToast(`Error: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  }, [difficulty]);

  const handleRandom = useCallback(() => {
    const prompt = PREDEFINED_PROMPTS[Math.floor(Math.random() * PREDEFINED_PROMPTS.length)];
    document.dispatchEvent(new CustomEvent('setPrompt', { detail: prompt }));
    handleGenerate(prompt);
  }, [handleGenerate]);
  
  const handleImport = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLoadedPieces(null);
        setPuzzleImageUrl(event.target?.result as string);
        setGameState(GameState.IMAGE_LOADED);
        showToast("Image imported!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLoadClick = () => {
    loadInputRef.current?.click();
  };
  
  const handleLoadFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const savedGame: SavedGame = await loadGame(file);
        setDifficulty(savedGame.difficulty);
        setPuzzleSeed(savedGame.puzzleSeed);
        setLoadedPieces(savedGame.pieces);
        setPuzzleImageUrl(savedGame.puzzleImageUrl);
        setGameState(GameState.PLAYING);
        showToast("Game loaded successfully!");
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load save file.";
        setError(errorMessage);
        showToast(`Error: ${errorMessage}`);
      }
    }
  };

  const handlePlay = () => {
    if (!loadedPieces) {
      setPuzzleSeed(Date.now());
    }
    setGameState(GameState.PLAYING);
  };
  
  const handleNewGame = () => {
    setLoadedPieces(null);
    setGameState(GameState.IMAGE_LOADED);
  }

  const handleSave = () => {
    if (!puzzleImageUrl) return;
    saveGame({
      puzzleImageUrl,
      difficulty,
      puzzleSeed,
      pieces,
    });
    showToast("Game saved!");
  };

  const handlePuzzleComplete = () => {
    setGameState(GameState.COMPLETE);
    showToast("Congratulations! You completed the puzzle!");
  };

  const handleDownloadImage = () => {
    if (!puzzleImageUrl) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const aspectRatio = difficulty.cols / difficulty.rows;
      
      let sourceX = 0, sourceY = 0, sourceWidth = img.naturalWidth, sourceHeight = img.naturalHeight;
      const imgAspectRatio = img.naturalWidth / img.naturalHeight;
  
      if (imgAspectRatio > aspectRatio) {
          sourceWidth = img.naturalHeight * aspectRatio;
          sourceX = (img.naturalWidth - sourceWidth) / 2;
      } else {
          sourceHeight = img.naturalWidth / aspectRatio;
          sourceY = (img.naturalHeight - sourceHeight) / 2;
      }
  
      canvas.width = sourceWidth;
      canvas.height = sourceHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, sourceWidth, sourceHeight);
      
      const link = document.createElement('a');
      link.download = 'puzzle-image.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = puzzleImageUrl;
  };

  const isPreGame = gameState === GameState.IDLE || gameState === GameState.IMAGE_LOADED;
  const isPlaying = gameState === GameState.PLAYING || gameState === GameState.COMPLETE;

  const renderMainContent = () => {
    if (isGenerating) {
        return (
            <div className="flex flex-col items-center gap-4 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-400"></div>
                <p className="text-lg text-gray-300">Generating your masterpiece...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-gray-400 p-8 bg-gray-900/50 rounded-lg max-w-md">
                <h3 className="text-2xl font-bold text-red-400 mb-2">Error Generating Image</h3>
                <p>{error}</p>
            </div>
        );
    }

    if (gameState === GameState.IDLE && !puzzleImageUrl) {
        return (
            <div className="text-center text-gray-300 p-10 bg-gray-900/50 rounded-xl shadow-2xl max-w-2xl border border-gray-700/50">
                <h2 className="text-4xl font-bold text-white mb-4">Welcome to Endless Jigsaws!</h2>
                <p className="text-lg mb-6">
                    Turn any idea into a puzzle. Here’s how to start:
                </p>
                <ul className="text-left list-none space-y-4 mb-8 text-base">
                    <li className="flex items-start gap-4">
                        <span className="text-indigo-400 font-bold text-2xl mt-0">1.</span>
                        <div>
                            <strong className="text-white">Describe an Image:</strong> Use the text box at the top to describe any scene you can imagine.
                        </div>
                    </li>
                    <li className="flex items-start gap-4">
                        <span className="text-indigo-400 font-bold text-2xl mt-0">2.</span>
                        <div>
                            <strong className="text-white">Create Your Image:</strong> Click the Generate button, get a random idea with the lightning bolt, or upload your own photo.
                        </div>
                        </li>
                    <li className="flex items-start gap-4">
                        <span className="text-indigo-400 font-bold text-2xl mt-0">3.</span>
                        <div>
                            <strong className="text-white">Play!</strong> Once your image appears, choose a difficulty and click "Play" to begin solving.
                        </div>
                    </li>
                </ul>
            </div>
        );
    }

    if (puzzleImageUrl && puzzleSize.width > 0) {
        return (
            <>
              <div 
                  className="relative p-5 bg-[#6b4f2e] rounded-md shadow-2xl"
                  style={{
                      width: `${puzzleSize.width}px`,
                      height: `${puzzleSize.height}px`,
                      backgroundImage: 'linear-gradient(rgba(255,255,255,0.05), rgba(0,0,0,0.2)), url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23543d24\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), inset 0 0 1px 1px rgba(255,255,255,0.1)',
                  }}
              >
                  <div
                    ref={boardInnerRef}
                    className="relative w-full h-full bg-[#1a3a2a] rounded-sm"
                  >
                      {isPreGame && (
                          <>
                              <img
                                  ref={imagePreviewRef}
                                  src={puzzleImageUrl}
                                  alt="Puzzle preview"
                                  className="absolute inset-0 w-full h-full object-cover rounded-sm"
                                  crossOrigin="anonymous"
                              />
                              {gameState === GameState.IMAGE_LOADED && (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                      <button
                                          onClick={handlePlay}
                                          className="px-8 py-4 bg-green-600 hover:bg-green-500 text-white font-bold text-2xl rounded-lg shadow-lg transition-transform transform hover:scale-105 border-2 border-green-400 hover:border-green-300 focus:outline-none focus:ring-4 focus:ring-green-400/50"
                                          style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
                                      >
                                          Play
                                      </button>
                                  </div>
                              )}
                          </>
                      )}
                  </div>
              </div>

              {isPlaying && boardRect.width > 0 && (
                <div className="absolute inset-0">
                    <PuzzleBoard
                        imageUrl={puzzleImageUrl}
                        difficulty={difficulty}
                        onComplete={handlePuzzleComplete}
                        puzzleSeed={puzzleSeed}
                        showPreview={showPreview}
                        setPiecesForSaving={setPieces}
                        loadedPieces={loadedPieces}
                        gameState={gameState}
                        boardRect={boardRect}
                    />
                </div>
              )}

              {gameState === GameState.COMPLETE && <CompletionMessage onNewGame={handleNewGame} />}
            </>
        );
    }
    
    // Fallback for when puzzleSize is not yet calculated but an image is loaded/loading
    if (puzzleImageUrl) {
        return (
            <div className="flex flex-col items-center gap-4 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-400"></div>
                <p className="text-lg text-gray-300">Loading puzzle...</p>
            </div>
        );
    }

    return null; // Should not be reached in normal flow
  }


  return (
    <div className="flex flex-col h-screen overflow-hidden bg-transparent">
      <Header
        gameState={gameState}
        isGenerating={isGenerating}
        difficulty={difficulty}
        difficulties={DIFFICULTIES}
        onGenerate={handleGenerate}
        onRandom={handleRandom}
        onImport={handleImport}
        onDifficultyChange={setDifficulty}
        onLoad={handleLoadClick}
        onSave={handleSave}
        onTogglePreview={() => setShowPreview(p => !p)}
        onNewGame={handleNewGame}
        onDownloadImage={handleDownloadImage}
        difficultyLocked={!!loadedPieces && isPreGame}
      />
      <main className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div ref={puzzleAreaRef} className="flex-1 grid place-items-center p-4 relative bg-black/20 overflow-hidden">
            {renderMainContent()}
        </div>
      </main>
      <Toast message={toastMessage} />
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
      <input type="file" ref={loadInputRef} onChange={handleLoadFileChange} accept=".jpuz" className="hidden" />
    </div>
  );
}