import React from 'react';
import { Minus, Square, X, Terminal } from 'lucide-react';

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
            <Square size={6} className="text-black opacity-0 group-hover:opacity-40" />
          </button>
        </div>

        {/* The Hidden Backend Button - Right next to controls */}
        <button
          onClick={onToggleBackend}
          className={`p-1.5 rounded-md transition-all no-drag ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'hover:bg-gray-800 text-gray-400 hover:text-white'}`}
          title="Toggle Backend Interface"
        >
          <Terminal size={18} />
        </button>
      </div>

      <div className="text-[11px] text-gray-500 font-bold tracking-[0.2em] uppercase">
        System Core
      </div>

      <div className="w-20"></div> {/* Spacer to center the title if needed */}
    </div>
  );
};

export default TitleBar;
