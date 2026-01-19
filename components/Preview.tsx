
import React, { useState, useRef, useEffect } from 'react';
import { FileItem } from '../types';

interface PreviewProps {
  file: FileItem;
  onClose: () => void;
}

const Preview: React.FC<PreviewProps> = ({ file, onClose }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(!file.isLocked);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (file.isLocked && !isUnlocked) {
      const pass = prompt(`"${file.name}" is locked. Enter key:`);
      if (pass === file.password) setIsUnlocked(true);
      else {
        alert("Incorrect Key.");
        onClose();
      }
    }
  }, [file]);

  if (file.isLocked && !isUnlocked) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-8 animate-in fade-in zoom-in duration-300">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl" onClick={onClose}></div>
      <div className="relative z-10 w-full max-w-6xl h-full max-h-[92vh] bg-transparent rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header Overlay */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/90 to-transparent z-50 flex items-center justify-between px-8 pointer-events-none">
          <div className="flex flex-col">
            <div className="flex items-center space-x-3 pointer-events-auto">
                <span className="text-white text-xl font-black tracking-tight truncate max-w-md">{file.name}</span>
            </div>
            <div className="flex items-center space-x-3 mt-1 pointer-events-auto">
                <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">{file.type} • v{file.versions.length + 1}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4 pointer-events-auto">
            <button onClick={() => setShowDetails(!showDetails)} className={`w-11 h-11 flex items-center justify-center rounded-full transition-all duration-300 ${showDetails ? 'bg-blue-600 text-white shadow-blue-500/50 scale-110' : 'bg-white/10 text-white/70 hover:bg-white/20'}`} title="Metadata"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></button>
            <button onClick={onClose} className="w-11 h-11 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-red-600 transition-all active:scale-90 shadow-lg" title="Close"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
        </div>

        {/* Media Container */}
        <div className="flex-1 flex items-center justify-center relative group">
          {file.type === 'image' && <div className="relative w-full h-full flex items-center justify-center p-12"><img src={file.dataUrl} alt={file.name} className="max-w-full max-h-full object-contain shadow-2xl rounded-sm animate-in fade-in duration-700" /></div>}
          {file.type === 'video' && <div className="w-full h-full bg-black flex items-center justify-center group relative"><video ref={videoRef} src={file.dataUrl} controls autoPlay className="max-w-full max-h-full shadow-2xl" /></div>}
          {file.type === 'audio' && (
            <div className="flex flex-col items-center justify-center w-full h-full space-y-16 animate-in slide-in-from-bottom duration-700">
              <div className="w-56 h-56 bg-gradient-to-br from-indigo-500 via-blue-600 to-purple-700 rounded-full flex items-center justify-center shadow-2xl border-[12px] border-white/5"><svg className="w-24 h-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg></div>
              <h3 className="text-white text-3xl font-black mb-2 tracking-tight">{file.name}</h3>
              <audio src={file.dataUrl} controls autoPlay className="w-[480px] h-12 rounded-full shadow-2xl invert opacity-80" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Preview;
