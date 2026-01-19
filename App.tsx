
import React, { useState, useEffect, useMemo } from 'react';
import { User, FileItem, WindowType, STORAGE_LIMITS, ActivityLog, Notification, ThemeMode, Note } from './types';
import MenuBar from './components/MenuBar';
import Dock from './components/Dock';
import Window from './components/Window';
import FileExplorer from './components/FileExplorer';
import Auth from './components/Auth';
import Preview from './components/Preview';
import Intelligence from './components/Intelligence';
import StickyNotes from './components/StickyNotes';
import Dashboard from './components/Dashboard';
import CameraApp from './components/CameraApp';
import TextEditor from './components/TextEditor';
import SocialShare from './components/SocialShare';
import PaintApp from './components/PaintApp';
import Calculator from './components/Calculator';
import CalendarApp from './components/CalendarApp';
import WeatherApp from './components/WeatherApp';
import { initialFiles } from './constants';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeWindows, setActiveWindows] = useState<WindowType[]>([]);
  const [files, setFiles] = useState<FileItem[]>(initialFiles);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [sharingFile, setSharingFile] = useState<FileItem | null>(null);
  const [editingFile, setEditingFile] = useState<FileItem | null>(null);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [adminViewMode, setAdminViewMode] = useState<'PERSONAL' | 'GLOBAL'>('PERSONAL');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [notes, setNotes] = useState<Note[]>([]);

  const sysStats = useMemo(() => ({
    totalUsers: allUsers.length,
    totalFiles: files.length,
    activeSessions: allUsers.filter(u => u.status === 'ACTIVE').length,
    totalStorageUsed: allUsers.reduce((acc, u) => acc + (u.storageUsed || 0), 0)
  }), [allUsers, files]);

  useEffect(() => {
    const savedUser = localStorage.getItem('cloudos_user');
    const savedFiles = localStorage.getItem('cloudos_files');
    const savedRegistry = localStorage.getItem('cloudos_global_registry');
    const savedLogs = localStorage.getItem('cloudos_logs');
    const savedNotes = localStorage.getItem('cloudos_notes');
    
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setCurrentUser(parsed);
      setTheme(parsed.theme || 'light');
      setActiveWindows([WindowType.FILES]);
    } else {
      setActiveWindows([WindowType.AUTH]);
    }

    if (savedFiles) setFiles(JSON.parse(savedFiles));
    if (savedRegistry) setAllUsers(JSON.parse(savedRegistry));
    if (savedLogs) setLogs(JSON.parse(savedLogs));
    if (savedNotes) setNotes(JSON.parse(savedNotes));
  }, []);

  useEffect(() => {
    if (currentUser) {
      const userToSave = { ...currentUser, theme };
      localStorage.setItem('cloudos_user', JSON.stringify(userToSave));
      setAllUsers(prev => prev.map(u => u.id === currentUser.id ? userToSave : u));
    }
    localStorage.setItem('cloudos_files', JSON.stringify(files));
    localStorage.setItem('cloudos_global_registry', JSON.stringify(allUsers));
    localStorage.setItem('cloudos_logs', JSON.stringify(logs));
    localStorage.setItem('cloudos_notes', JSON.stringify(notes));
  }, [files, allUsers, logs, theme, notes]);

  const notify = (title: string, message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 4000);
  };

  const handleMenuAction = (action: string) => {
    if (action.startsWith('THEME_')) {
      const selectedTheme = action.replace('THEME_', '').toLowerCase() as ThemeMode;
      setTheme(selectedTheme);
      notify("Theme Synchronized", `Terminal skin updated to ${selectedTheme}.`, "success");
      return;
    }

    switch (action) {
      case 'NEW_FOLDER':
      case 'UPLOAD':
      case 'SELECT_ALL':
      case 'VIEW_TRASH':
      case 'TOGGLE_VIEW':
        window.dispatchEvent(new CustomEvent('cloudos-action', { detail: action }));
        break;
      case 'PURGE_TRASH':
        setFiles(prev => prev.filter(f => !f.isDeleted));
        notify("Buffer Cleared", "System trash deallocated.", "info");
        break;
      case 'VIEW_SETTINGS': openWindow(WindowType.SETTINGS); break;
      case 'SYSTEM_INFO': openWindow(WindowType.SYSTEM_INFO); break;
      case 'PREFERENCES': openWindow(WindowType.PREFERENCES); break;
      case 'INTELLIGENCE': openWindow(WindowType.INTELLIGENCE); break;
      case 'NOTES': openWindow(WindowType.NOTES); break;
      case 'DASHBOARD': openWindow(WindowType.DASHBOARD); break;
      case 'CAMERA': openWindow(WindowType.CAMERA); break;
      case 'PAINT': openWindow(WindowType.PAINT); break;
      case 'CALCULATOR': openWindow(WindowType.CALCULATOR); break;
      case 'CALENDAR': openWindow(WindowType.CALENDAR); break;
      case 'WEATHER': openWindow(WindowType.WEATHER); break;
      default: console.log("Menu Action:", action);
    }
  };

  const openWindow = (type: WindowType) => {
    if (type === WindowType.SETTINGS && (!currentUser || !currentUser.isAdmin)) {
      notify("Bypass Denied", "Administrative signature required.", "error");
      return;
    }
    setActiveWindows(prev => prev.includes(type) ? [...prev.filter(w => w !== type), type] : [...prev, type]);
  };

  const closeWindow = (type: WindowType) => {
    setActiveWindows(prev => prev.filter(w => w !== type));
    if (type === WindowType.EDITOR) setEditingFile(null);
    if (type === WindowType.SHARE_MODAL) setSharingFile(null);
  };

  const handleFileUpload = (newFile: FileItem) => {
    if (!currentUser) return;
    const limit = STORAGE_LIMITS[currentUser.role];
    if (currentUser.storageUsed + newFile.size > limit) {
      notify("Buffer Full", "Storage ceiling reached. Clean up required.", "error");
      return;
    }
    setFiles(prev => [...prev, newFile]);
    if (newFile.size > 0) {
      const updatedUser = { ...currentUser, storageUsed: currentUser.storageUsed + newFile.size };
      setCurrentUser(updatedUser);
      notify("Asset Locked", `${newFile.name} added to your vault.`, "success");
    }
  };

  const handleShareFile = (file: FileItem) => {
    setSharingFile(file);
    openWindow(WindowType.SHARE_MODAL);
  };

  const bgStyle = useMemo(() => {
    const urls = {
      light: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop',
      dark: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop',
      midnight: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bc04?q=80&w=2070&auto=format&fit=crop',
      solar: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=2070&auto=format&fit=crop'
    };
    return { backgroundImage: `url(${urls[theme]})` };
  }, [theme]);

  const themeClass = theme === 'light' ? '' : theme === 'dark' ? 'dark' : theme === 'midnight' ? 'dark midnight' : 'solar';

  return (
    <div className={`relative w-full h-screen overflow-hidden bg-cover bg-center transition-all duration-1000 ${themeClass}`} style={bgStyle}>
      <MenuBar user={currentUser} onLogout={() => { setCurrentUser(null); setActiveWindows([WindowType.AUTH]); }} onAction={handleMenuAction} />

      <div className="fixed bottom-1 right-2 z-0 opacity-20 text-[8px] font-black uppercase text-white tracking-[1em] pointer-events-none drop-shadow-lg">
        CloudOS X Creator: Sujon Kumar Roy
      </div>

      <div className="fixed top-12 right-4 z-[100] flex flex-col space-y-2 w-80">
        {notifications.map(n => (
          <div key={n.id} className="bg-white/90 dark:bg-black/80 dark:border-white/20 backdrop-blur-2xl border border-white/50 p-4 rounded-3xl shadow-2xl flex items-start space-x-3 animate-in slide-in-from-right duration-500 ring-1 ring-white/10">
             <div className={`w-3 h-3 rounded-full mt-1 shrink-0 ${n.type === 'success' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : n.type === 'error' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'}`} />
             <div>
                <p className="text-[10px] font-black text-gray-800 dark:text-white uppercase tracking-widest">{n.title}</p>
                <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{n.message}</p>
             </div>
          </div>
        ))}
      </div>

      <main className="relative z-10 w-full h-full p-4 pt-10 flex flex-col items-center">
        {activeWindows.map(type => (
          <Window 
            key={type} 
            type={type} 
            onClose={() => closeWindow(type)}
            isActive={activeWindows[activeWindows.length - 1] === type}
            onFocus={() => setActiveWindows([...activeWindows.filter(w => w !== type), type])}
          >
            {type === WindowType.AUTH && <Auth onLogin={(u) => { setCurrentUser(u); setTheme(u.theme || 'light'); setActiveWindows([WindowType.FILES]); }} />}
            {type === WindowType.FILES && currentUser && (
              <FileExplorer 
                files={adminViewMode === 'GLOBAL' && currentUser.isAdmin ? files : files.filter(f => f.userId === currentUser.id || f.userId === 'guest')} 
                user={currentUser}
                onUpload={handleFileUpload}
                onUpdateFiles={setFiles}
                onPreview={setPreviewFile}
                selectedFileIds={selectedFileIds}
                onSelectFiles={setSelectedFileIds}
                onEditFile={(f) => { setEditingFile(f); openWindow(WindowType.EDITOR); }}
                onShareFile={handleShareFile}
              />
            )}
            {type === WindowType.INTELLIGENCE && <Intelligence />}
            {type === WindowType.NOTES && currentUser && <StickyNotes notes={notes} setNotes={setNotes} userId={currentUser.id} />}
            {type === WindowType.DASHBOARD && <Dashboard stats={sysStats} users={allUsers} files={files} />}
            {type === WindowType.CAMERA && <CameraApp onCapture={handleFileUpload} userId={currentUser?.id || 'guest'} />}
            {type === WindowType.PAINT && currentUser && <PaintApp onSave={handleFileUpload} userId={currentUser.id} />}
            {type === WindowType.CALCULATOR && <Calculator />}
            {type === WindowType.CALENDAR && <CalendarApp />}
            {type === WindowType.WEATHER && <WeatherApp />}
            {type === WindowType.SHARE_MODAL && sharingFile && <SocialShare file={sharingFile} onClose={() => closeWindow(WindowType.SHARE_MODAL)} />}
            {type === WindowType.EDITOR && editingFile && (
              <TextEditor 
                file={editingFile} 
                onSave={(updatedFile) => {
                  setFiles(prev => prev.map(f => f.id === updatedFile.id ? updatedFile : f));
                  notify("Buffer Updated", `${updatedFile.name} changes committed.`, "success");
                }} 
              />
            )}
            {type === WindowType.SYSTEM_INFO && (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-white/40 dark:bg-black/40 backdrop-blur-3xl">
                <div className="w-24 h-24 mb-6 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-[22%] shadow-2xl flex items-center justify-center text-5xl text-white font-black"></div>
                <h2 className="text-3xl font-black text-gray-800 dark:text-white tracking-tighter">CloudOS X</h2>
                <p className="text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest mb-10">Sequoia Edition v5.0</p>
                <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                   <div className="p-4 bg-white/60 dark:bg-white/5 rounded-3xl border border-black/5 shadow-md"><p className="text-[8px] font-black text-gray-400">USERS</p><p className="text-xs font-black dark:text-white">{sysStats.totalUsers}</p></div>
                   <div className="p-4 bg-white/60 dark:bg-white/5 rounded-3xl border border-black/5 shadow-md"><p className="text-[8px] font-black text-gray-400">NODES</p><p className="text-xs font-black dark:text-white">{sysStats.totalFiles}</p></div>
                </div>
                <div className="mt-12 text-[9px] font-medium text-gray-400 flex flex-col items-center">
                  <span>Developed by Sujon Kumar Roy</span>
                  <a href="https://facebook.com/sujonworld0" target="_blank" className="text-blue-500 font-black hover:underline mt-1">facebook.com/sujonworld0</a>
                </div>
              </div>
            )}
            {type === WindowType.PREFERENCES && (
              <div className="p-10 h-full bg-white/20 dark:bg-black/20 overflow-y-auto no-scrollbar">
                <h2 className="text-3xl font-black mb-10 dark:text-white tracking-tight">System Identity</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                  {(['light', 'dark', 'midnight', 'solar'] as ThemeMode[]).map(t => (
                    <button key={t} onClick={() => handleMenuAction(`THEME_${t.toUpperCase()}`)} className={`h-28 rounded-3xl border-4 transition-all overflow-hidden ${theme === t ? 'border-blue-600 scale-105 shadow-2xl ring-4 ring-blue-500/10' : 'border-white/50 hover:border-blue-300'}`}>
                      <div className={`w-full h-full flex items-center justify-center text-[9px] font-black uppercase tracking-widest ${t === 'light' ? 'bg-blue-50 text-blue-900' : t === 'dark' ? 'bg-gray-800 text-gray-100' : t === 'midnight' ? 'bg-slate-950 text-indigo-100' : 'bg-orange-100 text-orange-900'}`}>
                        {t}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Window>
        ))}
        {previewFile && <Preview file={previewFile} onClose={() => setPreviewFile(null)} />}
      </main>
      {currentUser && <Dock user={currentUser} onOpen={handleMenuAction} />}
    </div>
  );
};

export default App;
