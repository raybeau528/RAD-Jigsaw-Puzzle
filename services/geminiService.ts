// !! IMPORTANT: Use the Production URL Vercel gave you !!
const BACKEND_URL = 'https://jigsaw-backend.vercel.app/api/generate';

// --- WE KEEP ALL THIS LOGIC ---
const aspectRatios: { [key: number]: "1:1" | "4:3" | "3:4" | "16:9" | "9:16" } = {
  1: "1:1",
  1.333: "4:3",
  0.75: "3:4",
  1.777: "16:9",
  0.5625: "9:16"
}

function getClosestAspectRatio(ratio: number): "1:1" | "4:3" | "3:4" | "16:9" | "9:16" {
    const supportedRatios = Object.keys(aspectRatios).map(Number);
    const closest = supportedRatios.reduce((prev, curr) => 
        (Math.abs(curr - ratio) < Math.abs(prev - ratio) ? curr : prev)
    );
    return aspectRatios[closest];
}
// --- END OF LOGIC WE KEEP ---


// --- THIS IS THE UPDATED FUNCTION ---
export async function generateImage(prompt: string, ratio: number): Promise<string> {
    // We still create the enhanced prompt and get the ratio
    const enhancedPrompt = `A beautiful, high-resolution, vibrant, photorealistic image of: ${prompt}`;
    const aspectRatio = getClosestAspectRatio(ratio);
    
    try {
        // We call our OWN backend, not Google's
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // We send the data our backend needs
            body: JSON.stringify({
                prompt: enhancedPrompt,
                aspectRatio: aspectRatio
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            // If the backend sent an error, show it
            throw new Error(data.error || "Failed to generate image.");
        }
        
        // Return the image data from our backend
        return data.imageBytes;

    } catch (error) {
        console.error("Error calling backend:", error);
        throw error; // Re-throw the error for the component to handle
  _ }
}