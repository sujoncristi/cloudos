
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { User } from '../types';

interface MenuBarProps {
  user: User | null;
  onLogout: () => void;
  onAction: (action: string) => void;
}

const MenuDropdown: React.FC<{ 
  label: string; 
  items: { label: string; onClick: () => void; shortcut?: string; variant?: 'default' | 'danger' }[];
  isOpen: boolean;
  onToggle: () => void;
}> = ({ label, items, isOpen, onToggle }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onToggle();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onToggle]);

  return (
    <div className="relative h-full flex items-center" ref={dropdownRef}>
      <button 
        onClick={onToggle}
        className={`px-3.5 h-full flex items-center transition-all text-xs font-bold select-none ${isOpen ? 'bg-blue-600/90 text-white rounded-md' : 'hover:bg-black/5 dark:hover:bg-white/10 text-gray-800 dark:text-white/95'}`}
      >
        {label}
      </button>
      {isOpen && (
        <div className="absolute top-[110%] left-0 w-60 bg-white/90 dark:bg-gray-900/95 backdrop-blur-3xl border border-black/10 dark:border-white/10 shadow-2xl rounded-xl py-1.5 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
          {items.map((item, idx) => (
            <button
              key={idx}
              onClick={() => { item.onClick(); onToggle(); }}
              className={`w-full flex items-center justify-between px-4 py-2 text-[11px] font-bold transition-all mx-1 w-[calc(100%-8px)] rounded-lg ${
                item.variant === 'danger' ? 'text-red-500 hover:bg-red-500 hover:text-white' : 'text-gray-700 dark:text-white/90 hover:bg-blue-600 hover:text-white'
              }`}
            >
              <span>{item.label}</span>
              {item.shortcut && <span className="opacity-40 tabular-nums ml-4 font-normal text-[10px]">{item.shortcut}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const MenuBar: React.FC<MenuBarProps> = ({ user, onLogout, onAction }) => {
  const [time, setTime] = useState(new Date());
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 10000); // Only update every 10s for performance
    return () => clearInterval(timer);
  }, []);

  const appleMenu = useMemo(() => [
    { label: 'About CloudOS', onClick: () => onAction('SYSTEM_INFO') },
    { label: 'System Settings...', onClick: () => onAction('PREFERENCES') },
    { label: 'Activity Hub...', onClick: () => onAction('DASHBOARD') },
    { label: 'Force Quit...', onClick: () => window.location.reload(), shortcut: '⌥⌘⎋' },
    { label: 'Restart Shell', onClick: () => window.location.reload(), variant: 'danger' as const },
    { label: 'Sleep System', onClick: onLogout, variant: 'danger' as const },
  ], [onAction, onLogout]);

  const fileMenu = useMemo(() => [
    { label: 'New Neural Folder', onClick: () => onAction('NEW_FOLDER'), shortcut: '⌘N' },
    { label: 'Ingest Asset...', onClick: () => onAction('UPLOAD'), shortcut: '⌘I' },
    { label: 'Purge Trash Buffer', onClick: () => onAction('PURGE_TRASH'), variant: 'danger' as const },
  ], [onAction]);

  const viewMenu = useMemo(() => [
    { label: 'Light Aesthetic', onClick: () => onAction('THEME_LIGHT') },
    { label: 'Matrix Dark', onClick: () => onAction('THEME_DARK') },
    { label: 'Midnight Echo', onClick: () => onAction('THEME_MIDNIGHT') },
    { label: 'Solar Pulse', onClick: () => onAction('THEME_SOLAR') },
    { label: 'Toggle Layout Mode', onClick: () => onAction('TOGGLE_VIEW') },
  ], [onAction]);

  return (
    <header className="fixed top-0 left-0 right-0 h-[28px] mac-blur dark:bg-black/60 z-50 flex items-center justify-between px-4 text-[11px] font-bold shadow-sm border-b border-black/5 dark:border-white/5">
      <div className="flex items-center h-full space-x-1">
        <div className="relative h-full">
          <button 
            onClick={() => setActiveMenu(activeMenu === '' ? null : '')}
            className={`px-3.5 h-full flex items-center text-[14px] transition-all ${activeMenu === '' ? 'bg-blue-600/90 text-white rounded-md' : 'text-gray-900 dark:text-white'}`}
          >
            
          </button>
          {activeMenu === '' && (
            <div className="absolute top-[110%] left-0 w-60 bg-white/90 dark:bg-gray-900/95 backdrop-blur-3xl border border-black/10 dark:border-white/10 shadow-2xl rounded-xl py-1.5 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
              {appleMenu.map((item, idx) => (
                <button key={idx} onClick={() => { item.onClick(); setActiveMenu(null); }} className={`w-full flex items-center justify-between px-4 py-2 text-[11px] font-bold mx-1 w-[calc(100%-8px)] rounded-lg transition-all ${item.variant === 'danger' ? 'text-red-500 hover:bg-red-500 hover:text-white' : 'text-gray-700 dark:text-white/90 hover:bg-blue-600 hover:text-white'}`}>
                  <span>{item.label}</span>
                  {item.shortcut && <span className="opacity-40 font-normal">{item.shortcut}</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        <MenuDropdown label="CloudOS" items={[{ label: 'About Systems', onClick: () => onAction('SYSTEM_INFO') }, { label: 'Security Panel', onClick: () => onAction('PREFERENCES') }, { label: 'Kill Shell', onClick: onLogout, shortcut: '⌘Q' }]} isOpen={activeMenu === 'CloudOS'} onToggle={() => setActiveMenu(activeMenu === 'CloudOS' ? null : 'CloudOS')} />
        <MenuDropdown label="File" items={fileMenu} isOpen={activeMenu === 'File'} onToggle={() => setActiveMenu(activeMenu === 'File' ? null : 'File')} />
        <MenuDropdown label="View" items={viewMenu} isOpen={activeMenu === 'View'} onToggle={() => setActiveMenu(activeMenu === 'View' ? null : 'View')} />
        <MenuDropdown label="Help" items={[{label: 'User Manual', onClick: () => {}}]} isOpen={activeMenu === 'Help'} onToggle={() => setActiveMenu(activeMenu === 'Help' ? null : 'Help')} />
      </div>

      <div className="flex items-center space-x-5">
        <div className="flex items-center space-x-1.5 px-3 py-0.5 bg-black/5 dark:bg-white/5 rounded-full border border-black/5 dark:border-white/5">
           <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
           <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Neural Sync</span>
        </div>

        {user && (
          <div className="flex items-center space-x-3">
            <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full ${user.isAdmin ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200'}`}>
              {user.isAdmin ? 'Root' : 'User'}
            </span>
            <div className="h-3 w-[1px] bg-black/10 dark:bg-white/10" />
            <span className="text-gray-600 dark:text-white/60 font-black text-[10px] tabular-nums tracking-tight">
              {((user.storageUsed / (1024*1024))).toFixed(1)} MB
            </span>
          </div>
        )}
        
        <div className="flex items-center space-x-2 mr-2">
          <span className="tabular-nums font-black text-gray-800 dark:text-white/95 text-[11px] tracking-tight">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>
    </header>
  );
};

export default React.memo(MenuBar);
