import React, { useEffect, useRef } from 'react';

// Tell TypeScript that 'adsbygoogle' exists on the window object
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface AdComponentProps {
  adSlot: string; // The ID Google gives you for this specific ad
  style?: React.CSSProperties; // Custom width/height
  className?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal';
  responsive?: 'true' | 'false';
}

const AdComponent: React.FC<AdComponentProps> = ({ 
  adSlot, 
  style, 
  className = "", 
  format = "auto",
  responsive = "true"
}) => {
  const adRef = useRef<HTMLModElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    // Prevent double-loading the ad in React Strict Mode
    if (initialized.current) return;
    initialized.current = true;

    try {
      // This triggers the ad script to fill the slot
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, []);

  return (
    <div className={`ad-container ${className}`} style={style}>
        {/* This label is just for you to see while developing */}
        <div className="text-xs text-gray-500 text-center mb-1">Advertisement</div>
        
        <ins
          className="adsbygoogle"
          style={{ display: 'block', ...style }}
          data-ad-client="ca-pub-6368831252615190" // I pulled this from your index.html
          data-ad-slot={adSlot}
          data-ad-format={format}
          data-full-width-responsive={responsive}
        ></ins>
    </div>
  );
};

export default AdComponent;