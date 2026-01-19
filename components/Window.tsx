
import React, { useState } from 'react';
import { WindowType } from '../types';

interface WindowProps {
  type: WindowType;
  children: React.ReactNode;
  onClose: () => void;
  isActive: boolean;
  onFocus?: () => void;
}

const Window: React.FC<WindowProps> = ({ type, children, onClose, isActive, onFocus }) => {
  const [position, setPosition] = useState({ x: 100 + (Math.random() * 40), y: 60 + (Math.random() * 40) });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.window-control-btn')) return;
    onFocus?.();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const getTitle = () => {
    switch (type) {
      case WindowType.FILES: return 'Finder';
      case WindowType.SETTINGS: return 'Console';
      case WindowType.AUTH: return 'Passport';
      case WindowType.INTELLIGENCE: return 'Neural Assistant';
      case WindowType.NOTES: return 'Memos';
      case WindowType.PREFERENCES: return 'Settings';
      case WindowType.SYSTEM_INFO: return 'About';
      case WindowType.DASHBOARD: return 'Activity Hub';
      case WindowType.CAMERA: return 'Photo Booth';
      case WindowType.EDITOR: return 'Script Editor';
      case WindowType.SHARE_MODAL: return 'Nexus Share';
      case WindowType.PAINT: return 'Paint Studio';
      case WindowType.CALCULATOR: return 'Calculator';
      case WindowType.CALENDAR: return 'Calendar';
      case WindowType.WEATHER: return 'Weather';
      default: return 'Window';
    }
  };

  const isMobile = window.innerWidth < 768;

  const style: React.CSSProperties = isMobile ? {
    top: '1.75rem',
    left: 0,
    right: 0,
    bottom: 0,
    width: '100vw',
    height: 'calc(100vh - 1.75rem)',
    zIndex: isActive ? 40 : 30
  } : {
    top: Math.max(28, position.y),
    left: position.x,
    width: type === WindowType.FILES ? '1024px' : 
           type === WindowType.INTELLIGENCE ? '440px' : 
           type === WindowType.DASHBOARD ? '960px' : 
           type === WindowType.CALCULATOR ? '320px' :
           type === WindowType.CALENDAR ? '800px' :
           type === WindowType.WEATHER ? '400px' :
           '840px',
    maxWidth: '96vw',
    height: type === WindowType.INTELLIGENCE ? '580px' : 
            type === WindowType.CAMERA ? '640px' : 
            type === WindowType.CALCULATOR ? '480px' :
            type === WindowType.WEATHER ? '720px' :
            '680px',
    maxHeight: '88vh',
    zIndex: isActive ? 40 : 30,
    transition: isDragging ? 'none' : 'z-index 0.2s ease, transform 0.2s ease, box-shadow 0.3s ease'
  };

  return (
    <div 
      style={style}
      className={`absolute flex flex-col mac-blur rounded-2xl overflow-hidden border border-white/40 dark:border-white/10 ${isActive ? 'window-shadow ring-1 ring-blue-500/20' : 'window-shadow-inactive opacity-95 scale-[0.99]'}`}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={onFocus}
    >
      <div 
        className={`h-11 flex items-center justify-between px-5 transition-colors duration-300 cursor-default select-none border-b shrink-0 ${isActive ? 'bg-white/30 dark:bg-white/5 border-black/5 dark:border-white/5' : 'bg-gray-200/20 dark:bg-black/40 border-transparent'}`}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center space-x-2.5">
          <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="window-control-btn w-3.5 h-3.5 bg-[#FF5F56] hover:bg-[#FF3B30] rounded-full transition-all shadow-inner border border-black/10 flex items-center justify-center group">
            <svg className="w-2 h-2 text-black/40 opacity-0 group-hover:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 6L6 18M6 6l12 12" strokeWidth="3" strokeLinecap="round" /></svg>
          </button>
          <div className="w-3.5 h-3.5 bg-[#FFBD2E] rounded-full shadow-inner border border-black/10"></div>
          <div className="w-3.5 h-3.5 bg-[#27C93F] rounded-full shadow-inner border border-black/10"></div>
        </div>
        <span className={`text-[11px] font-black tracking-tight uppercase transition-opacity duration-300 ${isActive ? 'text-gray-800 dark:text-white' : 'text-gray-400 dark:text-gray-600'}`}>
          {getTitle()}
        </span>
        <div className="w-14"></div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {children}
      </div>
    </div>
  );
};

export default Window;
