
import React, { useRef, useState, useMemo, useEffect, useCallback } from 'react';
import { FileItem, User, ExplorerViewMode, STORAGE_LIMITS } from '../types';
import FileDetailsPanel from './FileDetailsPanel';
import ContextMenu from './ContextMenu';

interface FileExplorerProps {
  files: FileItem[];
  user: User;
  onUpload: (file: FileItem) => void;
  onUpdateFiles: React.Dispatch<React.SetStateAction<FileItem[]>>;
  onPreview: (file: FileItem) => void;
  selectedFileIds: string[];
  onSelectFiles: (ids: string[]) => void;
  onBulkRename?: (ids: string[], baseName: string) => void;
  onEditFile?: (file: FileItem) => void;
  onShareFile?: (file: FileItem) => void;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ 
  files, user, onUpload, onUpdateFiles, onPreview, selectedFileIds, onSelectFiles, onBulkRename, onEditFile, onShareFile 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'home' | 'files' | 'trash'>('home');
  const [explorerMode, setExplorerMode] = useState<ExplorerViewMode>('grid');
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, fileId?: string } | null>(null);

  const filteredFiles = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return files.filter(f => {
      const matchesSearch = query === '' || f.name.toLowerCase().includes(query) || f.type.toLowerCase().includes(query);
      const matchesDeleted = viewMode === 'trash' ? f.isDeleted : !f.isDeleted;
      const matchesFolder = viewMode === 'trash' ? true : (searchQuery ? true : f.parentId === currentFolderId);
      return matchesSearch && matchesDeleted && matchesFolder;
    });
  }, [files, currentFolderId, searchQuery, viewMode]);

  const handleCreateFolder = useCallback(() => {
    const n = prompt("Folder Name:"); 
    if(n && n.trim() !== "") {
      onUpload({ 
        id: Math.random().toString(36).substr(2, 9), 
        userId: user.id, 
        parentId: currentFolderId, 
        isFolder: true, 
        name: n.trim(), 
        size: 0, 
        type: 'folder', 
        dataUrl: '', 
        createdAt: Date.now(), 
        tags: [], 
        versions: [], 
        isShared: false, 
        isDeleted: false 
      });
    }
  }, [onUpload, user.id, currentFolderId]);

  const storagePercent = (user.storageUsed / STORAGE_LIMITS[user.role]) * 100;

  return (
    <div className="flex flex-1 h-full bg-[#f5f7fa] dark:bg-black overflow-hidden select-none">
      {/* Sidebar Navigation */}
      <div className="w-64 border-r border-black/5 dark:border-white/5 bg-white dark:bg-zinc-900 flex flex-col shrink-0">
        <div className="p-6">
          <h2 className="text-[11px] font-black uppercase text-gray-400 tracking-[0.2em] mb-8">Navigation</h2>
          <div className="space-y-1">
            {[
              { id: 'home', label: 'Home', icon: <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> },
              { id: 'files', label: 'Local Files', icon: <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /> },
              { id: 'trash', label: 'Recycle Bin', icon: <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /> }
            ].map(item => (
              <button 
                key={item.id}
                onClick={() => { setViewMode(item.id as any); if(item.id !== 'home') setCurrentFolderId(null); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${viewMode === item.id ? 'bg-[#009688]/10 text-[#009688]' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon.props.d} /></svg>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto p-6 border-t border-black/5">
          <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4">
             <div className="flex justify-between text-[10px] font-black uppercase text-gray-400 mb-2">
                <span>Storage</span>
                <span>{storagePercent.toFixed(1)}%</span>
             </div>
             <div className="h-1.5 w-full bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#009688]" style={{ width: `${storagePercent}%` }} />
             </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-16 border-b border-black/5 bg-white dark:bg-zinc-900 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center space-x-4">
            <button onClick={() => setCurrentFolderId(null)} className="text-gray-400 hover:text-[#009688]"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg></button>
            <div className="h-4 w-[1px] bg-gray-200" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{viewMode === 'home' ? 'Storage Hub' : 'Explorer'}</span>
          </div>

          <div className="flex items-center space-x-2 bg-gray-100 dark:bg-white/5 rounded-full px-4 py-2 w-64">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs font-bold w-full focus:outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 no-scrollbar" onClick={() => onSelectFiles([])}>
          {viewMode === 'home' ? (
            <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Storage Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="es-card p-6 flex items-center space-x-6 hover:shadow-xl transition-shadow cursor-pointer group">
                  <div className="w-20 h-20 rounded-full border-[6px] border-[#009688]/10 flex items-center justify-center relative">
                    <svg className="w-10 h-10 text-[#009688]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-100" />
                      <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray={213} strokeDashoffset={213 - (213 * storagePercent) / 100} className="text-[#009688] transition-all duration-1000" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-black text-gray-800 dark:text-white">Internal Storage</h3>
                    <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">{((user.storageUsed / (1024*1024))).toFixed(1)}MB / 2.0GB</p>
                    <div className="mt-3 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-[#009688]" style={{ width: `${storagePercent}%` }} /></div>
                  </div>
                </div>

                <div className="es-card p-6 flex items-center space-x-6 opacity-60">
                  <div className="w-20 h-20 rounded-full border-[6px] border-gray-100 flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-black text-gray-300">SD Card</h3>
                    <p className="text-xs font-bold text-gray-300 mt-1 uppercase tracking-widest">Not Mounted</p>
                  </div>
                </div>
              </div>

              {/* Category Grid */}
              <div className="es-card p-8">
                <h4 className="text-[11px] font-black uppercase text-gray-400 tracking-[0.3em] mb-8">Library Quick Scan</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
                  {[
                    { label: 'Images', icon: '🖼️', color: 'bg-blue-500', count: files.filter(f => f.type === 'image').length },
                    { label: 'Videos', icon: '🎬', color: 'bg-red-500', count: files.filter(f => f.type === 'video').length },
                    { label: 'Audio', icon: '🎵', color: 'bg-orange-500', count: files.filter(f => f.type === 'audio').length },
                    { label: 'Docs', icon: '📄', color: 'bg-cyan-500', count: files.filter(f => f.type === 'document' || f.type === 'text').length },
                    { label: 'Apps', icon: '🧩', color: 'bg-green-500', count: 0 },
                    { label: 'Cloud', icon: '☁️', color: 'bg-purple-600', count: files.filter(f => f.isShared).length }
                  ].map(cat => (
                    <div key={cat.label} onClick={() => setViewMode('files')} className="flex flex-col items-center group cursor-pointer">
                      <div className={`w-16 h-16 ${cat.color} rounded-[22.5%] flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform active:scale-95 text-white`}>
                        {cat.icon}
                      </div>
                      <span className="mt-3 text-[11px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-400">{cat.label}</span>
                      <span className="text-[9px] font-bold text-gray-400">{cat.count} Items</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-8 gap-y-12">
              {filteredFiles.map(file => {
                const isSelected = selectedFileIds.includes(file.id);
                return (
                  <div key={file.id} 
                    className={`flex flex-col items-center p-4 rounded-2xl transition-all cursor-default group relative ${isSelected ? 'bg-[#009688]/10 ring-2 ring-[#009688]/40 shadow-xl' : 'hover:bg-white dark:hover:bg-white/5 shadow-sm'}`}
                    onClick={(e) => { e.stopPropagation(); onSelectFiles([file.id]); }}
                    onDoubleClick={() => file.isFolder ? setCurrentFolderId(file.id) : onPreview(file)}
                  >
                    <div className="w-20 h-20 flex items-center justify-center text-5xl shadow-md rounded-[20%] bg-white dark:bg-zinc-800 border border-black/5 group-active:scale-95 transition-all overflow-hidden relative">
                        {file.isFolder ? '📂' : file.type === 'image' ? <img src={file.dataUrl} className="w-full h-full object-cover" alt="" /> : file.type === 'video' ? '🎬' : file.type === 'audio' ? '🎵' : '📄'}
                    </div>
                    {isSelected && <div className="absolute top-2 right-2 w-6 h-6 bg-[#009688] rounded-full flex items-center justify-center text-white shadow-lg"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg></div>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <FileDetailsPanel file={selectedFileIds.length === 1 ? files.find(f => f.id === selectedFileIds[0]) || null : null} onPreview={onPreview} onUpdateFile={(updatedFile) => onUpdateFiles(prev => prev.map(f => f.id === updatedFile.id ? updatedFile : f))} onShareFile={onShareFile} />
      </div>
      <input type="file" ref={fileInputRef} className="hidden" multiple onChange={(e) => Array.from(e.target.files || []).forEach(f => { const reader = new FileReader(); reader.onload = (event) => onUpload({ id: Math.random().toString(36).substr(2, 9), userId: user.id, parentId: currentFolderId, isFolder: false, name: f.name, size: f.size, type: f.type.split('/')[0], dataUrl: event.target?.result as string, createdAt: Date.now(), tags: [], versions: [], isShared: false, isDeleted: false }); reader.readAsDataURL(f); })} />
    </div>
  );
};

export default React.memo(FileExplorer);
