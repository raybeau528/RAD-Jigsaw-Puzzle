import React from 'react';
import { NewGameIcon } from './icons/Icons';

interface CompletionMessageProps {
  onNewGame: () => void;
}

const CompletionMessage: React.FC<CompletionMessageProps> = ({ onNewGame }) => {
  return (
    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-20 backdrop-blur-sm">
      <div className="text-center p-8 bg-gray-800/80 rounded-2xl shadow-2xl border border-yellow-400/50">
        <h2 className="text-5xl font-bold text-yellow-400 mb-4 animate-pulse">Congratulations!</h2>
        <p className="text-gray-200 text-xl mb-8">You've completed the puzzle!</p>
        <button
          onClick={onNewGame}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg rounded-lg shadow-lg transition-transform transform hover:scale-105 border-2 border-blue-400 hover:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-400/50"
        >
          <NewGameIcon />
          <span>New Puzzle</span>
        </button>
      </div>
    </div>
  );
};

export default CompletionMessage;
