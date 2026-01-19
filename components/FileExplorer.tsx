
import React, { useRef, useState, useMemo, useEffect, useCallback } from 'react';
import { FileItem, User, ExplorerViewMode } from '../types';
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
  const [viewMode, setViewMode] = useState<'all' | 'trash'>('all');
  const [explorerMode, setExplorerMode] = useState<ExplorerViewMode>('grid');
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, fileId?: string } | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const breadcrumbs = useMemo(() => {
    const crumbs: FileItem[] = [];
    let currentId = currentFolderId;
    while (currentId) {
      const folder = files.find(f => f.id === currentId);
      if (folder) { 
        crumbs.unshift(folder); 
        currentId = folder.parentId; 
      } else break;
    }
    return crumbs;
  }, [currentFolderId, files]);

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
    const n = prompt("Neural Folder Label:"); 
    if(n && n.trim() !== "") {
      const newFolder: FileItem = { 
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
      };
      onUpload(newFolder);
    }
  }, [onUpload, user.id, currentFolderId]);

  useEffect(() => {
    const handleAction = (e: any) => {
      const action = e.detail;
      switch (action) {
        case 'NEW_FOLDER': handleCreateFolder(); break;
        case 'UPLOAD': fileInputRef.current?.click(); break;
        case 'SELECT_ALL': onSelectFiles(filteredFiles.map(f => f.id)); break;
        case 'VIEW_TRASH': setViewMode('trash'); break;
        case 'TOGGLE_VIEW': setExplorerMode(prev => prev === 'grid' ? 'list' : 'grid'); break;
      }
    };
    window.addEventListener('cloudos-action', handleAction);
    return () => window.removeEventListener('cloudos-action', handleAction);
  }, [filteredFiles, handleCreateFolder, onSelectFiles]);

  const handleOpenFolder = useCallback((file: FileItem) => {
    if (file.isLocked && file.password) {
      const p = prompt(`Access Key required for hidden asset:`);
      if (p === file.password) setCurrentFolderId(file.id);
      else if (p !== null) alert("Identity mismatch.");
    } else setCurrentFolderId(file.id);
  }, []);

  const menuItems = useMemo(() => {
    if (!contextMenu) return [];
    if (selectedFileIds.length > 1) {
      return [[{ label: `Rename Batch (${selectedFileIds.length})`, onClick: () => onBulkRename?.(selectedFileIds, prompt("Prefix:") || '') }, { label: 'Purge Selection', variant: 'danger' as const, onClick: () => onUpdateFiles(prev => prev.map(f => selectedFileIds.includes(f.id) ? { ...f, isDeleted: true } : f)) }]];
    }
    if (contextMenu.fileId) {
      const file = files.find(f => f.id === contextMenu.fileId);
      if (file?.isDeleted) return [[{ label: 'Reconstruct Asset', onClick: () => onUpdateFiles(prev => prev.map(f => f.id === file.id ? { ...f, isDeleted: false } : f)) }]];
      
      const fileActions: any[] = [{ label: 'Spotlight Preview', onClick: () => file?.isFolder ? handleOpenFolder(file) : onPreview(file!) }];
      if (file?.type === 'document' || file?.name.endsWith('.txt')) {
        fileActions.push({ label: 'Edit Terminal Stream', onClick: () => onEditFile?.(file!) });
      }
      fileActions.push({ label: 'Global Social Share', onClick: () => onShareFile?.(file!) });

      return [
        fileActions,
        [{ label: 'Refactor Identity', onClick: () => { const n = prompt("New Name:", file?.name); if(n) onUpdateFiles(prev => prev.map(f => f.id === file?.id ? {...f, name: n} : f)); }}],
        [{ label: 'Omni-Protection', onClick: () => { const p = prompt("Set Neural Lock:"); onUpdateFiles(prev => prev.map(f => f.id === file?.id ? {...f, isLocked: !!p, password: p || undefined} : f)); }}],
        [{ label: 'Move to Buffer Trash', variant: 'danger' as const, onClick: () => onUpdateFiles(prev => prev.map(f => f.id === file?.id ? {...f, isDeleted: true} : f)) }]
      ];
    }
    return [[{ label: 'Create Neural Folder', onClick: handleCreateFolder }, { label: 'Ingest External Link', onClick: () => fileInputRef.current?.click() }]];
  }, [contextMenu, files, selectedFileIds, handleCreateFolder, onUpdateFiles, onPreview, onBulkRename, onEditFile, onShareFile, handleOpenFolder]);

  const onFileClick = useCallback((e: React.MouseEvent, file: FileItem) => {
    e.stopPropagation(); 
    const isSelected = selectedFileIds.includes(file.id);
    if (e.shiftKey || e.metaKey) {
      onSelectFiles(isSelected ? selectedFileIds.filter(id => id !== file.id) : [...selectedFileIds, file.id]);
    } else {
      onSelectFiles([file.id]);
    }
  }, [selectedFileIds, onSelectFiles]);

  return (
    <div className="flex flex-1 flex-col bg-white/40 dark:bg-black/60 overflow-hidden relative" onContextMenu={(e) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY }); }}>
      
      <div className={`transition-all duration-500 flex flex-col items-center justify-center p-4 border-b border-white/20 dark:border-white/10 ${isSearchFocused ? 'h-32 bg-white/70 dark:bg-black/90 shadow-2xl z-20' : 'h-16 bg-white/40 dark:bg-black/40'}`}>
         <div className={`relative flex items-center transition-all duration-500 ease-out group ${isSearchFocused ? 'w-[85%] scale-105' : 'w-[70%]'}`}>
            <div className={`absolute left-5 transition-transform duration-300 ${isSearchFocused ? 'scale-125 text-blue-500' : 'text-gray-400'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input 
              type="text" 
              placeholder="Spotlight CloudOS..." 
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/95 dark:bg-white/10 border border-white/60 dark:border-white/20 rounded-[22px] pl-14 pr-6 py-4 text-sm font-bold dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-8 focus:ring-blue-500/10 shadow-2xl transition-all" 
            />
         </div>
      </div>

      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/30 dark:bg-black/30 backdrop-blur-3xl shrink-0">
        <div className="flex items-center space-x-5">
          <div className="flex bg-black/10 dark:bg-white/10 p-1 rounded-[16px] shadow-inner">
             <button onClick={() => setViewMode('all')} className={`px-6 py-2 rounded-[12px] text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'all' ? 'bg-white dark:bg-white/20 text-blue-600 shadow-lg' : 'text-gray-500 hover:text-gray-700 dark:hover:text-white'}`}>Vault</button>
             <button onClick={() => setViewMode('trash')} className={`px-6 py-2 rounded-[12px] text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'trash' ? 'bg-white dark:bg-red-900/40 text-red-500 shadow-lg' : 'text-gray-500 hover:text-gray-700 dark:hover:text-white'}`}>Trash</button>
          </div>
          <div className="flex items-center space-x-3 text-[12px] font-black text-gray-400 dark:text-white/30">
            <span onClick={() => setCurrentFolderId(null)} className="hover:text-blue-600 transition-colors cursor-pointer tracking-wider">ROOT</span>
            {breadcrumbs.map(crumb => (
              <React.Fragment key={crumb.id}>
                <span className="opacity-50">/</span>
                <span onClick={() => handleOpenFolder(crumb)} className="hover:text-blue-600 cursor-pointer">{crumb.name.toUpperCase()}</span>
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="flex items-center space-x-4">
            <button onClick={handleCreateFolder} className="p-3 bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/15 rounded-2xl text-gray-600 dark:text-white/60 transition-all active:scale-90 border border-white/50 dark:border-white/10 shadow-md">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        <div className={`flex-1 p-8 overflow-y-auto no-scrollbar transition-all duration-700 ${isSearchFocused ? 'opacity-30 blur-2xl scale-[1.02]' : ''}`} onClick={() => onSelectFiles([])}>
          {filteredFiles.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-10">
               <svg className="w-36 h-36 mb-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
               <p className="text-2xl font-black uppercase tracking-[0.8em]">Neural Empty</p>
            </div>
          ) : explorerMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-8 gap-y-12 content-start items-start">
              {filteredFiles.map(file => {
                const isSelected = selectedFileIds.includes(file.id);
                return (
                  <div key={file.id} 
                    className={`flex flex-col items-center p-4 rounded-[28px] transition-all cursor-default group relative animate-in fade-in zoom-in-95 duration-300 ${isSelected ? 'bg-blue-600/10 dark:bg-blue-500/20 ring-2 ring-blue-500/40 shadow-xl scale-105 z-10' : 'hover:bg-white/80 dark:hover:bg-white/5'}`}
                    onClick={(e) => onFileClick(e, file)}
                    onDoubleClick={() => file.isFolder ? handleOpenFolder(file) : onPreview(file)}
                    onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); onSelectFiles([file.id]); setContextMenu({ x: e.clientX, y: e.clientY, fileId: file.id }); }}
                  >
                    <div className="w-24 h-24 flex items-center justify-center text-6xl shadow-2xl rounded-[24%] bg-white dark:bg-black/80 border border-white dark:border-white/10 group-active:scale-95 transition-all overflow-hidden relative">
                        {file.isFolder ? '📂' : file.type === 'image' ? <img src={file.dataUrl} className="w-full h-full object-cover" alt="" /> : file.type === 'video' ? '🎥' : file.type === 'audio' ? '🎵' : '📄'}
                        
                        {isSelected && (
                          <div className="absolute top-2 left-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-in zoom-in duration-200">
                             <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                          </div>
                        )}
                        
                        {file.isLocked && <div className="absolute bottom-2 right-2 bg-white/95 dark:bg-gray-800 p-1.5 rounded-full shadow-2xl ring-1 ring-black/5"><svg className="w-3.5 h-3.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg></div>}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white/50 dark:bg-black/20 rounded-[36px] border border-white dark:border-white/10 overflow-hidden shadow-2xl backdrop-blur-3xl">
               <table className="w-full text-left">
                  <thead><tr className="border-b border-white/20 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest bg-white/20 dark:bg-black/30"><th className="px-12 py-6">Identity</th><th className="px-12 py-6">Allocation</th><th className="px-12 py-6">Date</th><th className="px-12 py-6">Modality</th></tr></thead>
                  <tbody className="divide-y divide-white/10 dark:divide-white/5">
                    {filteredFiles.map(file => (
                      <tr key={file.id} 
                        onClick={(e) => onFileClick(e, file)} 
                        onDoubleClick={() => file.isFolder ? handleOpenFolder(file) : onPreview(file)}
                        className={`hover:bg-blue-500/5 dark:hover:bg-blue-500/10 cursor-default transition-all duration-300 ${selectedFileIds.includes(file.id) ? 'bg-blue-500/10' : ''}`}>
                        <td className="px-12 py-6 flex items-center space-x-6 text-[14px] font-black text-gray-800 dark:text-white/95">
                           <span className="text-4xl filter drop-shadow-lg">{file.isFolder ? '📂' : '📄'}</span>
                        </td>
                        <td className="px-12 py-6 text-[12px] font-bold text-gray-500 dark:text-gray-400">{(file.size/1024).toFixed(1)} KB</td>
                        <td className="px-12 py-6 text-[12px] font-bold text-gray-500 dark:text-gray-400">{new Date(file.createdAt).toLocaleDateString()}</td>
                        <td className="px-12 py-6"><span className="px-5 py-2 rounded-full bg-white/60 dark:bg-white/5 text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-white/30 shadow-sm border border-white/40 dark:border-white/10">{file.type}</span></td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          )}
        </div>
        <FileDetailsPanel file={selectedFileIds.length === 1 ? files.find(f => f.id === selectedFileIds[0]) || null : null} onPreview={onPreview} onUpdateFile={(updatedFile) => onUpdateFiles(prev => prev.map(f => f.id === updatedFile.id ? updatedFile : f))} onShareFile={onShareFile} />
      </div>
      <input type="file" ref={fileInputRef} className="hidden" multiple onChange={(e) => Array.from(e.target.files || []).forEach(f => { const reader = new FileReader(); reader.onload = (event) => onUpload({ id: Math.random().toString(36).substr(2, 9), userId: user.id, parentId: currentFolderId, isFolder: false, name: f.name, size: f.size, type: f.type.split('/')[0], dataUrl: event.target?.result as string, createdAt: Date.now(), tags: [], versions: [], isShared: false, isDeleted: false }); reader.readAsDataURL(f); })} />
      {contextMenu && <ContextMenu x={contextMenu.x} y={contextMenu.y} onClose={() => setContextMenu(null)} items={menuItems} />}
    </div>
  );
};

export default React.memo(FileExplorer);
