
import { Difficulty } from './types';

export const DIFFICULTIES: Difficulty[] = [
  { name: 'Easy', rows: 4, cols: 5 },
  { name: 'Medium', rows: 8, cols: 10 },
  { name: 'Hard', rows: 12, cols: 15 },
  { name: 'Expert', rows: 16, cols: 20 },
];

export const PREDEFINED_PROMPTS: string[] = [
  "A majestic cat astronaut floating in space with Earth in the background, digital art.",
  "A vibrant coral reef teeming with life, photorealistic.",
  "A cozy library in a gothic castle on a rainy night.",
  "A futuristic city with flying cars and neon lights, cyberpunk style.",
  "A serene Japanese garden with a koi pond and cherry blossoms.",
  "A steampunk dragon made of gears and brass, breathing fire.",
  "An enchanted forest with glowing mushrooms and fairy lights.",
  "A detailed world map in the style of ancient cartography.",
  "A basket of adorable puppies playing in a field of daisies.",
  "A surreal landscape where clouds are made of cotton candy and rivers of chocolate."
];
