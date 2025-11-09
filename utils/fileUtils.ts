import { SavedGame } from '../types';

export function saveGame(gameState: SavedGame): void {
  const jsonString = JSON.stringify(gameState, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'jigsaw-save.jpuz';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function loadGame(file: File): Promise<SavedGame> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const data = JSON.parse(text);
        
        // Basic validation
        if (data.puzzleImageUrl && data.difficulty && data.puzzleSeed && Array.isArray(data.pieces)) {
          resolve(data as SavedGame);
        } else {
          reject(new Error('Invalid save file format.'));
        }
      } catch (error) {
        reject(new Error('Failed to parse save file.'));
      }
    };
    reader.onerror = () => {
      reject(new Error('Failed to read the file.'));
    };
    reader.readAsText(file);
  });
}