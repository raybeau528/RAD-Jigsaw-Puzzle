import React from 'react';
import AdComponent from './AdComponent';

const Sidebar: React.FC = () => {
  return (
    <aside
      className="bg-gray-900/50 p-4 w-48"
    >
  {/* Skyscraper Ad Slot */}
    <div className="bg-gray-800/50 rounded-lg p-2 flex justify-center">
        <AdComponent 
            adSlot="1234567890" // PLACEHOLDER: You will get this ID from AdSense later
            style={{ width: '160px', height: '600px' }}
        />
    </div>
    </aside>
  );
};

export default Sidebar;

