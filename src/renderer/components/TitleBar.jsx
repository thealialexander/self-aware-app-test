import React from 'react';
import { Minus, X, Maximize2, Terminal } from 'lucide-react';

const TitleBar = ({ onToggleBackend, isActive, isFocused }) => {
  const handleMinimize = () => window.electronAPI?.minimize();
  const handleMaximize = () => window.electronAPI?.maximize();
  const handleClose = () => window.electronAPI?.close();

  return (
    <div
      className={`h-7 flex items-center justify-between px-3 select-none z-[100] flex-shrink-0 transition-colors duration-200 ${isFocused ? 'bg-[#323232] text-[#9a9a9a]' : 'bg-[#282828] text-[#5a5a5a]'}`}
      style={{ WebkitAppRegion: 'drag' }}
    >
      <div className="flex items-center gap-2">
        {/* Window Controls (macOS style) */}
        <div className="flex gap-[8px] no-drag group">
          <button
            onClick={handleClose}
            className={`w-[12px] h-[12px] rounded-full flex items-center justify-center transition-colors ${isFocused ? 'bg-[#ff5f57]' : 'bg-[#4a4a4a]'}`}
          >
            <X size={7} strokeWidth={6} className="text-black/50 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          <button
            onClick={handleMinimize}
            className={`w-[12px] h-[12px] rounded-full flex items-center justify-center transition-colors ${isFocused ? 'bg-[#febc2e]' : 'bg-[#4a4a4a]'}`}
          >
            <Minus size={7} strokeWidth={6} className="text-black/50 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          <button
            onClick={handleMaximize}
            className={`w-[12px] h-[12px] rounded-full flex items-center justify-center transition-colors ${isFocused ? 'bg-[#28c840]' : 'bg-[#4a4a4a]'}`}
          >
            <Maximize2 size={7} strokeWidth={6} className="text-black/50 opacity-0 group-hover:opacity-100 transition-opacity rotate-45" />
          </button>
        </div>

        {/* The Hidden Backend Button - Circular Terminal button */}
        <button
          onClick={onToggleBackend}
          className={`w-[12px] h-[12px] rounded-full flex items-center justify-center transition-all no-drag ml-1 group/btn ${isActive ? 'bg-[#007aff] text-white' : isFocused ? 'bg-[#4a4a4a] text-gray-400 hover:bg-[#5a5a5a]' : 'bg-[#3a3a3a] text-gray-600'}`}
          title="Toggle Backend Interface"
        >
          <Terminal size={7} strokeWidth={6} className={isActive ? 'opacity-100' : 'opacity-0 group-hover/btn:opacity-100 transition-opacity'} />
        </button>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 text-[9px] font-bold tracking-[0.15em] uppercase pointer-events-none">
        System Core
      </div>

      <div className="w-16"></div> {/* Spacer */}
    </div>
  );
};

export default TitleBar;
