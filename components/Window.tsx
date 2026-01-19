
import React, { useState, useMemo } from 'react';
import { WindowType } from '../types';

interface WindowProps {
  type: WindowType;
  children: React.ReactNode;
  onClose: () => void;
  isActive: boolean;
  onFocus?: () => void;
}

const Window: React.FC<WindowProps> = ({ type, children, onClose, isActive, onFocus }) => {
  const [position, setPosition] = useState({ x: 60 + (Math.random() * 40), y: 40 + (Math.random() * 40) });
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

  const title = useMemo(() => {
    switch (type) {
      case WindowType.FILES: return 'ES Explorer';
      case WindowType.SETTINGS: return 'Root Settings';
      case WindowType.AUTH: return 'User Account';
      case WindowType.INTELLIGENCE: return 'Neural Assistant';
      case WindowType.NOTES: return 'Memos';
      case WindowType.PREFERENCES: return 'Settings';
      case WindowType.SYSTEM_INFO: return 'Properties';
      case WindowType.DASHBOARD: return 'Logger';
      case WindowType.CAMERA: return 'Camera';
      case WindowType.EDITOR: return 'Note Editor';
      case WindowType.PAINT: return 'Canvas';
      case WindowType.CALCULATOR: return 'Calculator';
      case WindowType.CALENDAR: return 'Planner';
      case WindowType.WEATHER: return 'Weather';
      default: return 'App';
    }
  }, [type]);

  const style: React.CSSProperties = {
    top: Math.max(0, position.y),
    left: position.x,
    width: type === WindowType.FILES ? '1100px' : '800px',
    maxWidth: '100vw',
    height: '750px',
    maxHeight: '95vh',
    zIndex: isActive ? 40 : 30,
    transition: isDragging ? 'none' : 'z-index 0.2s ease, transform 0.2s ease',
    willChange: 'transform, top, left',
    transform: 'translate3d(0,0,0)'
  };

  return (
    <div 
      style={style}
      className={`absolute flex flex-col bg-white dark:bg-[#121212] rounded-xl overflow-hidden shadow-2xl border border-black/5 dark:border-white/5 ${isActive ? 'window-shadow' : 'opacity-95'}`}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={onFocus}
    >
      {/* ES Style Header */}
      <div 
        className={`h-14 flex items-center justify-between px-6 transition-colors duration-300 cursor-default select-none shrink-0 ${isActive ? 'bg-[#009688] text-white' : 'bg-gray-200 dark:bg-zinc-800 text-gray-500'}`}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center space-x-4">
          <svg className="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
          <span className="text-sm font-bold tracking-wide uppercase">
            {title}
          </span>
        </div>
        
        <div className="flex items-center space-x-1">
          <button className="window-control-btn p-2 hover:bg-black/10 rounded-full transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20 12H4" strokeWidth="3" strokeLinecap="round" /></svg></button>
          <button className="window-control-btn p-2 hover:bg-black/10 rounded-full transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 4h16v16H4z" strokeWidth="2.5" /></svg></button>
          <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="window-control-btn p-2 hover:bg-red-500 hover:text-white rounded-full transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 6L6 18M6 6l12 12" strokeWidth="3" strokeLinecap="round" /></svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative bg-[#f5f7fa] dark:bg-black">
        {children}
      </div>
    </div>
  );
};

export default React.memo(Window);
