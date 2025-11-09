import React from 'react';

const Sidebar: React.FC = () => {
  return (
    <aside
      className="bg-gray-900/50 p-4 w-48"
    >
      <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-gray-700 rounded-lg">
        <div className="w-[160px] h-[600px] bg-gray-700 flex items-center justify-center text-gray-500 rounded">
            Skyscraper Ad (160x600)
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;