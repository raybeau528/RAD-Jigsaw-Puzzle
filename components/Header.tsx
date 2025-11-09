import React, { useState, useEffect } from 'react';
import { GameState, Difficulty } from '../types';
import { GenerateIcon, RandomIcon, ImportIcon, SaveIcon, LoadIcon, PreviewIcon, NewGameIcon, DownloadIcon } from './icons/Icons';

interface HeaderProps {
  gameState: GameState;
  isGenerating: boolean;
  difficulty: Difficulty;
  difficulties: Difficulty[];
  onGenerate: (prompt: string) => void;
  onRandom: () => void;
  onImport: () => void;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onLoad: () => void;
  onSave: () => void;
  onTogglePreview: () => void;
  onNewGame: () => void;
  onDownloadImage: () => void;
  difficultyLocked?: boolean;
}

interface TooltipButtonProps {
  title: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  className: string;
}

const TooltipButton: React.FC<TooltipButtonProps> = ({ title, onClick, disabled, children, className }) => {
  return (
    <div className="relative group flex items-center">
      <button onClick={onClick} disabled={disabled} className={className}>
        {children}
      </button>
      <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2
                      bg-gray-900 text-white text-sm font-semibold px-3 py-1.5 rounded-md shadow-lg 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap
                      pointer-events-none z-20">
        {title}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0
                        border-x-4 border-x-transparent
                        border-b-4 border-b-gray-900"></div>
      </div>
    </div>
  );
};

const Header: React.FC<HeaderProps> = ({
  gameState,
  isGenerating,
  difficulty,
  difficulties,
  onGenerate,
  onRandom,
  onImport,
  onDifficultyChange,
  onLoad,
  onSave,
  onTogglePreview,
  onNewGame,
  onDownloadImage,
  difficultyLocked,
}) => {
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    const handleSetPrompt = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      setPrompt(customEvent.detail);
    };
    document.addEventListener('setPrompt', handleSetPrompt);
    return () => {
      document.removeEventListener('setPrompt', handleSetPrompt);
    };
  }, []);

  const handleGenerateClick = () => {
    onGenerate(prompt);
  };
  
  const isPreGame = gameState === GameState.IDLE || gameState === GameState.IMAGE_LOADED;
  const isImageReady = gameState !== GameState.IDLE;

  return (
    <header className="relative z-10 p-2 bg-gray-800/70 backdrop-blur-sm border-b border-gray-700/50 flex flex-wrap items-center justify-between gap-2 shadow-lg">
      <h1 className="text-xl md:text-2xl font-bold text-white tracking-wider">RAD Jigsaw Puzzle</h1>
      
      <div className="flex flex-wrap items-center gap-2">
        {isPreGame && (
          <>
            <div className="flex items-center bg-gray-900/50 rounded-md">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A majestic cat astronaut..."
                className="bg-transparent p-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500 w-72 md:w-96"
                disabled={isGenerating}
              />
              <TooltipButton onClick={handleGenerateClick} disabled={isGenerating} title="Generate AI Image" className="p-2 bg-indigo-600 hover:bg-indigo-500 rounded-r-md disabled:bg-indigo-800 disabled:cursor-not-allowed transition-colors">
                {isGenerating ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <GenerateIcon />}
              </TooltipButton>
            </div>
             <TooltipButton onClick={onRandom} disabled={isGenerating} title="Random Prompt" className="p-2 bg-gray-700 hover:bg-gray-600 rounded-md disabled:bg-gray-800 disabled:cursor-not-allowed transition-colors">
                <RandomIcon />
            </TooltipButton>
            <div className="flex items-center gap-1 bg-gray-900/50 p-1 rounded-md">
              {difficulties.map(d => (
                 <TooltipButton
                    key={d.name}
                    onClick={() => onDifficultyChange(d)}
                    disabled={difficultyLocked}
                    title={`${d.name} (${d.rows}x${d.cols})`}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${difficulty.name === d.name ? 'bg-indigo-600 font-bold' : 'bg-gray-700 hover:bg-gray-600'} disabled:bg-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed`}
                >
                  {d.name}
                </TooltipButton>
              ))}
            </div>
          </>
        )}
        
        {gameState === GameState.PLAYING && <span className="font-semibold text-green-400">Playing...</span>}
        {gameState === GameState.COMPLETE && <span className="font-semibold text-yellow-400">Puzzle Complete!</span>}

        {gameState === GameState.PLAYING && (
            <TooltipButton onClick={onTogglePreview} title="Toggle Image Preview" className="p-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors">
                <PreviewIcon />
            </TooltipButton>
        )}

        {(gameState === GameState.PLAYING || gameState === GameState.COMPLETE) && (
            <TooltipButton onClick={onNewGame} title="New Puzzle" className="p-2 bg-blue-600 hover:bg-blue-500 rounded-md transition-colors">
                <NewGameIcon />
            </TooltipButton>
        )}
        
        {/* Grouped Game Progress Operations */}
        <div className="flex items-center gap-1 bg-gray-900/50 p-1 rounded-md">
            <TooltipButton 
                onClick={onSave} 
                title="Save Progress"
                disabled={gameState !== GameState.PLAYING}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors disabled:bg-gray-800 disabled:cursor-not-allowed"
            >
                <SaveIcon />
            </TooltipButton>
            <TooltipButton
                onClick={onLoad}
                title="Load Progress"
                disabled={!isPreGame}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors disabled:bg-gray-800 disabled:cursor-not-allowed"
            >
                <LoadIcon />
            </TooltipButton>
        </div>

        {/* Grouped Image Operations */}
        <div className="flex items-center gap-1 bg-gray-900/50 p-1 rounded-md">
            <TooltipButton
                onClick={onImport}
                title="Upload Image"
                disabled={!isPreGame}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors disabled:bg-gray-800 disabled:cursor-not-allowed"
            >
                <ImportIcon />
            </TooltipButton>
            <TooltipButton
                onClick={onDownloadImage}
                title="Download Image"
                disabled={!isImageReady}
                className="p-2 bg-teal-600 hover:bg-teal-500 rounded-md transition-colors disabled:bg-gray-800 disabled:cursor-not-allowed"
            >
                <DownloadIcon />
            </TooltipButton>
        </div>
      </div>
    </header>
  );
};

export default Header;