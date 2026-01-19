
import React from 'react';

interface ContextMenuItemProps {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

const ContextMenuItem: React.FC<ContextMenuItemProps> = ({ label, icon, onClick, variant = 'default' }) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    className={`w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-medium rounded-md transition-colors ${
      variant === 'danger' 
        ? 'text-red-500 hover:bg-red-500 hover:text-white' 
        : 'text-gray-700 hover:bg-blue-600 hover:text-white'
    }`}
  >
    <span>{label}</span>
    {icon && <span className="opacity-60">{icon}</span>}
  </button>
);

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  items: ContextMenuItemProps[][];
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose, items }) => {
  // Ensure menu doesn't go off screen
  const menuWidth = 180;
  const menuHeight = items.flat().length * 30 + (items.length * 8);
  const adjustedX = Math.min(x, window.innerWidth - menuWidth - 20);
  const adjustedY = Math.min(y, window.innerHeight - menuHeight - 20);

  return (
    <>
      <div className="fixed inset-0 z-[60]" onClick={onClose} onContextMenu={(e) => { e.preventDefault(); onClose(); }} />
      <div
        className="fixed z-[70] w-[180px] bg-white/80 backdrop-blur-2xl border border-black/5 rounded-xl shadow-2xl p-1.5 animate-in zoom-in-95 duration-100 origin-top-left flex flex-col space-y-1"
        style={{ left: adjustedX, top: adjustedY }}
      >
        {items.map((group, gIdx) => (
          <React.Fragment key={gIdx}>
            {gIdx > 0 && <div className="h-px bg-black/5 my-1 mx-1" />}
            {group.map((item, iIdx) => (
              <ContextMenuItem key={iIdx} {...item} />
            ))}
          </React.Fragment>
        ))}
      </div>
    </>
  );
};

export default ContextMenu;
