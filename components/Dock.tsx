
import React from 'react';
import { User } from '../types';

interface DockProps {
  user: User;
  onOpen: (action: string) => void;
}

const NavItem: React.FC<{ 
  icon: React.ReactNode, 
  onClick: () => void,
  label: string 
}> = React.memo(({ icon, onClick, label }) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center justify-center flex-1 py-2 text-gray-500 hover:text-[#009688] transition-all group"
  >
    <div className="p-2 rounded-xl group-hover:bg-[#009688]/10 transition-colors">
      {icon}
    </div>
    <span className="text-[10px] font-black uppercase tracking-widest mt-1">{label}</span>
  </button>
));

const Dock: React.FC<DockProps> = ({ user, onOpen }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-zinc-900 border-t border-black/5 dark:border-white/10 flex items-center justify-around px-8 z-50 shadow-[0_-4px_24px_rgba(0,0,0,0.05)]">
      <NavItem 
        label="Explorer"
        onClick={() => onOpen('VIEW_FILES')}
        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>}
      />
      <NavItem 
        label="Canvas"
        onClick={() => onOpen('PAINT')}
        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>}
      />
      <NavItem 
        label="Weather"
        onClick={() => onOpen('WEATHER')}
        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>}
      />
      <NavItem 
        label="Settings"
        onClick={() => onOpen('PREFERENCES')}
        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>}
      />
    </div>
  );
};

export default React.memo(Dock);
