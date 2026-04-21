import React from 'react';

const TitleBar = ({ onToggleBackend, isActive, isFocused }) => {
  const handleMinimize = () => window.electronAPI?.minimize();
  const handleMaximize = () => window.electronAPI?.maximize();
  const handleClose = () => window.electronAPI?.close();

  return (
    <div className={`h-12 flex items-center justify-between px-4 border-b select-none z-[100] flex-shrink-0 transition-colors duration-200 ${isFocused ? 'bg-gray-900 border-black text-white' : 'bg-gray-800 border-gray-900 text-gray-500'}`} style={{ WebkitAppRegion: 'drag' }}>
      <div className="flex items-center gap-4">
        {/* Window Controls (macOS style) */}
        <div className="flex gap-2 no-drag py-2">
          <button
            onClick={handleClose}
            className={`w-3.5 h-3.5 rounded-full flex items-center justify-center group border border-black/10 transition-colors ${isFocused ? 'bg-[#ff5f56] hover:bg-[#ff5f56]/80' : 'bg-gray-700'}`}
            title="Close"
          >
            <X size={8} className="text-black opacity-0 group-hover:opacity-40" />
          </button>
          <button
            onClick={handleMinimize}
            className={`w-3.5 h-3.5 rounded-full flex items-center justify-center group border border-black/10 transition-colors ${isFocused ? 'bg-[#ffbd2e] hover:bg-[#ffbd2e]/80' : 'bg-gray-700'}`}
            title="Minimize"
          >
            <Minus size={8} className="text-black opacity-0 group-hover:opacity-40" />
          </button>
          <button
            onClick={handleMaximize}
            className={`w-3.5 h-3.5 rounded-full flex items-center justify-center group border border-black/10 transition-colors ${isFocused ? 'bg-[#27c93f] hover:bg-[#27c93f]/80' : 'bg-gray-700'}`}
            title="Maximize"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" className="opacity-0 group-hover/code:opacity-100 transition-opacity pointer-events-none">
              <path d="M4.5 4.5L3 6l1.5 1.5M7.5 4.5L9 6 7.5 7.5M6.5 3.5l-1 5" fill="none" stroke="#1e3a8a" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TitleBar;
