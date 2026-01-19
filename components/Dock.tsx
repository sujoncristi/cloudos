
import React from 'react';
import { WindowType, User } from '../types';

interface DockProps {
  user: User;
  onOpen: (action: string) => void;
}

const DockIcon: React.FC<{ 
  bg: string, 
  icon: React.ReactNode, 
  onClick: () => void,
  label: string 
}> = React.memo(({ bg, icon, onClick, label }) => (
  <div className="group relative flex flex-col items-center">
    <div 
      onClick={onClick}
      className={`${bg} ios-icon w-[42px] h-[42px] md:w-[54px] md:h-[54px] flex items-center justify-center cursor-pointer relative overflow-hidden group-active:scale-90 shadow-2xl`}
    >
      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      {icon}
    </div>
    <span className="absolute -top-12 scale-0 group-hover:scale-100 transition-all duration-300 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-xl text-white text-[11px] font-bold whitespace-nowrap z-[100] shadow-2xl border border-white/10 opacity-0 group-hover:opacity-100 pointer-events-none">
      {label}
    </span>
  </div>
));

const Dock: React.FC<DockProps> = ({ user, onOpen }) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-end p-2 px-4 space-x-2 md:space-x-3 bg-white/30 dark:bg-black/40 backdrop-blur-3xl rounded-[32px] border border-white/40 dark:border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] z-50">
      <DockIcon 
        label="Vault Explorer"
        bg="bg-gradient-to-br from-blue-400 to-blue-600" 
        onClick={() => onOpen('VIEW_FILES')}
        icon={<svg className="w-6 h-6 md:w-8 md:h-8 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>}
      />
      
      <DockIcon 
        label="Climate Pulse"
        bg="bg-gradient-to-br from-blue-300 via-blue-500 to-indigo-600" 
        onClick={() => onOpen('WEATHER')}
        icon={<svg className="w-6 h-6 md:w-8 md:h-8 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>}
      />

      <DockIcon 
        label="Chronos Grid"
        bg="bg-white" 
        onClick={() => onOpen('CALENDAR')}
        icon={<div className="flex flex-col items-center"><span className="text-[10px] md:text-[12px] font-black text-red-500 leading-none uppercase">{new Date().toLocaleString('default', { month: 'short' })}</span><span className="text-xl md:text-2xl font-black text-gray-800 leading-none">{new Date().getDate()}</span></div>}
      />

      <DockIcon 
        label="Compute Engine"
        bg="bg-gradient-to-br from-gray-200 to-gray-400" 
        onClick={() => onOpen('CALCULATOR')}
        icon={<svg className="w-6 h-6 md:w-8 md:h-8 text-gray-800 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10H9m3-10v10M9 7v10m6-10v10m3-5H6" /></svg>}
      />

      <DockIcon 
        label="Canvas Studio"
        bg="bg-gradient-to-br from-orange-400 to-pink-600" 
        onClick={() => onOpen('PAINT')}
        icon={<svg className="w-6 h-6 md:w-8 md:h-8 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>}
      />

      <DockIcon 
        label="Neural Assistant"
        bg="bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500" 
        onClick={() => onOpen('INTELLIGENCE')}
        icon={<svg className="w-6 h-6 md:w-8 md:h-8 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
      />

      <div className="h-10 w-[1px] bg-white/20 mx-1" />

      <DockIcon 
        label="System Preferences"
        bg="bg-gradient-to-br from-gray-200 to-gray-400 dark:from-gray-600 dark:to-gray-800" 
        onClick={() => onOpen('PREFERENCES')}
        icon={<svg className="w-6 h-6 md:w-8 md:h-8 text-gray-700 dark:text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>}
      />

      {user.isAdmin && (
        <DockIcon 
          label="Root Console"
          bg="bg-gradient-to-br from-zinc-800 to-black" 
          onClick={() => onOpen('VIEW_SETTINGS')}
          icon={<svg className="w-6 h-6 md:w-8 md:h-8 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
        />
      )}
    </div>
  );
};

export default React.memo(Dock);
