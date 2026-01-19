
import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  const [prefTab, setPrefTab] = useState<'PROFILE' | 'APPEARANCE' | 'STORAGE' | 'ABOUT'>('PROFILE');

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

  const notify = useCallback((title: string, message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 4000);
  }, []);

  const openWindow = useCallback((type: WindowType) => {
    setActiveWindows(prev => {
      if (type === WindowType.SETTINGS && (!currentUser || !currentUser.isAdmin)) {
        notify("Bypass Denied", "Administrative signature required.", "error");
        return prev;
      }
      return prev.includes(type) 
        ? [...prev.filter(w => w !== type), type] 
        : [...prev, type];
    });
  }, [currentUser, notify]);

  const closeWindow = useCallback((type: WindowType) => {
    setActiveWindows(prev => prev.filter(w => w !== type));
    if (type === WindowType.EDITOR) setEditingFile(null);
    if (type === WindowType.SHARE_MODAL) setSharingFile(null);
  }, []);

  const handleMenuAction = useCallback((action: string) => {
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
      case 'VIEW_FILES': openWindow(WindowType.FILES); break;
      default: console.log("Menu Action:", action);
    }
  }, [notify, openWindow]);

  const handleFileUpload = useCallback((newFile: FileItem) => {
    setCurrentUser(curr => {
      if (!curr) return curr;
      const limit = STORAGE_LIMITS[curr.role];
      if (curr.storageUsed + newFile.size > limit) {
        notify("Buffer Full", "Storage ceiling reached. Clean up required.", "error");
        return curr;
      }
      setFiles(prev => [...prev, newFile]);
      if (newFile.size > 0) {
        notify("Asset Locked", `${newFile.name} added to your vault.`, "success");
        return { ...curr, storageUsed: curr.storageUsed + newFile.size };
      }
      return curr;
    });
  }, [notify]);

  const handleShareFile = useCallback((file: FileItem) => {
    setSharingFile(file);
    openWindow(WindowType.SHARE_MODAL);
  }, [openWindow]);

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

      <div className="fixed top-12 right-4 z-[100] flex flex-col space-y-2 w-80 pointer-events-none">
        {notifications.map(n => (
          <div key={n.id} className="pointer-events-auto bg-white/90 dark:bg-black/80 dark:border-white/20 backdrop-blur-2xl border border-white/50 p-4 rounded-3xl shadow-2xl flex items-start space-x-3 animate-in slide-in-from-right duration-500 ring-1 ring-white/10">
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
            onFocus={() => setActiveWindows(prev => [...prev.filter(w => w !== type), type])}
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
            {type === WindowType.SETTINGS && currentUser?.isAdmin && (
              <div className="h-full flex flex-col bg-white/40 dark:bg-black/40 backdrop-blur-3xl p-10 overflow-y-auto no-scrollbar">
                <h2 className="text-3xl font-black mb-8 dark:text-white tracking-tighter uppercase">Root Administrator Console</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                   <div className="bg-white/90 dark:bg-white/5 p-8 rounded-[32px] border border-black/5">
                      <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-6">Neural Registry ({allUsers.length})</h3>
                      <div className="space-y-4">
                        {allUsers.slice(0, 5).map(u => (
                          <div key={u.id} className="flex items-center justify-between">
                            <span className="text-xs font-bold dark:text-white">{u.username}</span>
                            <span className="text-[9px] font-black uppercase px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full">{u.role}</span>
                          </div>
                        ))}
                      </div>
                   </div>
                   <div className="bg-white/90 dark:bg-white/5 p-8 rounded-[32px] border border-black/5">
                      <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-6">Vault Control</h3>
                      <button 
                        onClick={() => setAdminViewMode(prev => prev === 'GLOBAL' ? 'PERSONAL' : 'GLOBAL')}
                        className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${adminViewMode === 'GLOBAL' ? 'bg-indigo-600 text-white shadow-xl' : 'bg-white dark:bg-white/10 text-gray-500'}`}
                      >
                        {adminViewMode === 'GLOBAL' ? 'Deactivate Global Sight' : 'Activate Global Sight'}
                      </button>
                      <p className="text-[8px] text-gray-400 mt-4 font-bold text-center">Toggling global sight allows root access to all network assets.</p>
                   </div>
                </div>
              </div>
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
            {type === WindowType.PREFERENCES && currentUser && (
              <div className="h-full flex bg-white/80 dark:bg-zinc-900/90 backdrop-blur-2xl overflow-hidden">
                <div className="w-64 border-r border-black/5 dark:border-white/5 flex flex-col p-4 space-y-2 bg-gray-50/50 dark:bg-black/20">
                  <div className="px-4 py-4 mb-4">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Settings</h2>
                  </div>
                  {[
                    { id: 'PROFILE', label: 'User Profile', icon: <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /> },
                    { id: 'APPEARANCE', label: 'Appearance', icon: <path d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /> },
                    { id: 'STORAGE', label: 'Vault Storage', icon: <path d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /> },
                    { id: 'ABOUT', label: 'CloudOS About', icon: <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> },
                  ].map(tab => (
                    <button 
                      key={tab.id}
                      onClick={() => setPrefTab(tab.id as any)}
                      className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all ${prefTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={tab.icon.props.d} /></svg>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>

                <div className="flex-1 p-12 overflow-y-auto no-scrollbar">
                  {prefTab === 'PROFILE' && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                      <div className="flex items-center space-x-8 mb-12">
                         <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-700 shadow-2xl flex items-center justify-center text-3xl text-white font-black ring-4 ring-white/50">
                           {currentUser.username[0].toUpperCase()}
                         </div>
                         <div>
                            <h3 className="text-3xl font-black dark:text-white tracking-tight">{currentUser.username}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{currentUser.email}</p>
                            <span className="mt-3 inline-block px-4 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest">{currentUser.role} NODE</span>
                         </div>
                      </div>
                      <div className="bg-black/5 dark:bg-white/5 p-8 rounded-3xl border border-black/5 dark:border-white/5">
                         <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">User Telemetry</h4>
                         <div className="grid grid-cols-2 gap-8">
                            <div><p className="text-[9px] font-black text-gray-400 uppercase mb-1">Status</p><p className="text-sm font-bold dark:text-white text-green-500">{currentUser.status}</p></div>
                            <div><p className="text-[9px] font-black text-gray-400 uppercase mb-1">System Privilege</p><p className="text-sm font-bold dark:text-white">{currentUser.isAdmin ? 'Root' : 'Standard'}</p></div>
                         </div>
                      </div>
                    </div>
                  )}

                  {prefTab === 'APPEARANCE' && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                      <h3 className="text-2xl font-black mb-10 dark:text-white tracking-tight">System Appearance</h3>
                      <div className="grid grid-cols-2 gap-6">
                        {(['light', 'dark', 'midnight', 'solar'] as ThemeMode[]).map(t => (
                          <button 
                            key={t} 
                            onClick={() => handleMenuAction(`THEME_${t.toUpperCase()}`)} 
                            className={`group relative h-32 rounded-3xl border-4 transition-all overflow-hidden ${theme === t ? 'border-blue-600 shadow-2xl scale-[1.02]' : 'border-black/5 dark:border-white/10 hover:border-blue-300'}`}
                          >
                            <div className={`w-full h-full flex flex-col items-center justify-center ${t === 'light' ? 'bg-white' : t === 'dark' ? 'bg-zinc-800' : t === 'midnight' ? 'bg-slate-950' : 'bg-orange-50'}`}>
                               <span className={`text-[10px] font-black uppercase tracking-widest ${t === 'light' ? 'text-gray-900' : t === 'dark' ? 'text-gray-100' : t === 'midnight' ? 'text-indigo-100' : 'text-orange-900'}`}>{t}</span>
                               <div className="mt-4 flex space-x-2">
                                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                                  <div className="w-3 h-3 rounded-full bg-gray-400" />
                                  <div className="w-3 h-3 rounded-full bg-gray-300" />
                               </div>
                            </div>
                            {theme === t && <div className="absolute top-3 right-3 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg></div>}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {prefTab === 'STORAGE' && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                      <h3 className="text-2xl font-black mb-2 dark:text-white tracking-tight">Vault Capacity</h3>
                      <p className="text-xs text-gray-500 mb-12">Allocated storage breakdown for your neural node.</p>
                      
                      <div className="mb-12">
                         <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">
                            <span>Storage Allocation</span>
                            <span className="text-blue-600">{((currentUser.storageUsed / STORAGE_LIMITS[currentUser.role]) * 100).toFixed(1)}%</span>
                         </div>
                         <div className="w-full h-4 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden flex shadow-inner border border-black/5">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-1000 ease-out" 
                              style={{ width: `${(currentUser.storageUsed / STORAGE_LIMITS[currentUser.role]) * 100}%` }}
                            />
                         </div>
                         <div className="mt-6 flex justify-between text-[11px] font-bold dark:text-white">
                            <span className="opacity-50">Used: {((currentUser.storageUsed / (1024*1024))).toFixed(1)} MB</span>
                            <span className="opacity-50">Total: {((STORAGE_LIMITS[currentUser.role] / (1024*1024))).toFixed(1)} MB</span>
                         </div>
                      </div>
                    </div>
                  )}

                  {prefTab === 'ABOUT' && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500 flex flex-col items-center justify-center h-full text-center">
                       <div className="w-24 h-24 mb-6 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-[22%] shadow-2xl flex items-center justify-center text-5xl text-white font-black"></div>
                       <h2 className="text-3xl font-black text-gray-800 dark:text-white tracking-tighter">CloudOS X</h2>
                       <p className="text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest mb-10">Sequoia Edition v5.1</p>
                       <p className="max-w-md text-sm text-gray-400 font-medium leading-relaxed italic">"A boundaryless digital landscape where logic meets aesthetics."</p>
                       <div className="mt-12 text-[9px] font-black text-gray-300 flex flex-col items-center">
                         <span>Developed by Sujon Kumar Roy</span>
                         <a href="https://facebook.com/sujonworld0" target="_blank" className="text-blue-500 font-black hover:underline mt-1">facebook.com/sujonworld0</a>
                       </div>
                    </div>
                  )}
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
