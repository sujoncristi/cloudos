
import React, { useState, useEffect } from 'react';
import { FileItem, FileVersion } from '../types';
import { GoogleGenAI } from '@google/genai';

interface FileDetailsPanelProps {
  file: FileItem | null;
  onPreview: (file: FileItem) => void;
  onUpdateFile: (file: FileItem) => void;
  onShareFile?: (file: FileItem) => void;
}

const FileDetailsPanel: React.FC<FileDetailsPanelProps> = ({ file, onPreview, onUpdateFile, onShareFile }) => {
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [newTag, setNewTag] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const [tempName, setTempName] = useState('');

  useEffect(() => {
    if (file) {
      setNotes(file.notes || '');
      setTempName(file.name);
      setIsRenaming(false);
    }
  }, [file]);

  if (!file) {
    return (
      <div className="hidden lg:flex w-80 border-l border-white/10 flex-col items-center justify-center p-12 text-center bg-white/20 dark:bg-black/20 backdrop-blur-3xl shadow-inner">
        <div className="w-20 h-20 rounded-[22%] bg-white/40 dark:bg-white/5 border border-white/50 dark:border-white/10 shadow-2xl flex items-center justify-center mb-8">
          <svg className="w-10 h-10 text-gray-400/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-[10px] text-gray-400 dark:text-white/20 font-black uppercase tracking-[0.4em]">Omni Inspector</p>
        <p className="text-[11px] text-gray-400/60 mt-4 font-medium px-8 leading-relaxed italic">Select an object to bridge neural metadata.</p>
      </div>
    );
  }

  const handleAiAnalyze = async () => {
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let prompt = `Analyze this ${file.type} named "${file.name}" and provide a 2-sentence sophisticated summary.`;
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      onUpdateFile({ ...file, description: response.text || "Summary generated." });
    } catch (err) {
      alert("AI Bridge Failed.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="hidden lg:flex w-80 border-l border-white/10 flex-col bg-white/60 dark:bg-black/40 overflow-y-auto no-scrollbar shadow-2xl backdrop-blur-3xl">
      <div className="p-8 flex flex-col items-center border-b border-white/10 bg-gradient-to-b from-blue-500/5 to-transparent">
        <div className="w-40 h-40 mb-6 rounded-[24%] overflow-hidden border-[6px] border-white dark:border-white/10 shadow-2xl bg-white dark:bg-black/60 flex items-center justify-center group relative">
           {file.type === 'image' ? (
             <img src={file.dataUrl} alt={file.name} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
           ) : (
             <span className="text-6xl select-none drop-shadow-xl">
                {file.type === 'audio' ? '🎵' : file.type === 'video' ? '🎥' : file.type === 'folder' ? '📂' : '📄'}
             </span>
           )}
           <button 
             onClick={() => onPreview(file)}
             className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
           >
              <svg className="w-10 h-10 text-white mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              <span className="text-[9px] text-white font-black uppercase tracking-[0.2em]">Quick Look</span>
           </button>
        </div>
        
        {isRenaming ? (
          <input autoFocus type="text" value={tempName} onChange={(e) => setTempName(e.target.value)} onBlur={() => { if(tempName.trim()) onUpdateFile({...file, name: tempName}); setIsRenaming(false); }} onKeyDown={(e) => e.key === 'Enter' && setIsRenaming(false)} className="w-full px-4 py-2 text-xs font-black text-center bg-white dark:bg-white/10 rounded-2xl border-2 border-blue-500 focus:outline-none shadow-xl" />
        ) : (
          <h3 className="text-[13px] font-black text-gray-800 dark:text-white text-center tracking-tight px-4 cursor-pointer hover:text-blue-500 transition-colors" onClick={() => setIsRenaming(true)}>{file.name}</h3>
        )}
      </div>

      <div className="p-8 space-y-8">
        <div className="flex flex-col space-y-3">
            <button 
                onClick={() => onShareFile?.(file)}
                className="w-full py-4 bg-gradient-to-br from-indigo-500 to-blue-700 text-white rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] hover:shadow-2xl hover:scale-[1.02] transition-all active:scale-95 shadow-xl flex items-center justify-center space-x-3"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
                <span>Omni-Share</span>
            </button>
            <div className="flex items-center space-x-2">
              <button onClick={() => onUpdateFile({...file, isShared: !file.isShared})} className={`flex-1 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${file.isShared ? 'bg-green-100 text-green-600 border border-green-200 shadow-lg shadow-green-500/10' : 'bg-white dark:bg-white/10 text-gray-400 border border-white/50'}`}>
                {file.isShared ? 'Public' : 'Private'}
              </button>
              <button onClick={() => onPreview(file)} className="flex-1 py-3 bg-white dark:bg-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest text-blue-500 border border-white/50 shadow-lg">Preview</button>
            </div>
        </div>

        <div>
          <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3 flex items-center">
            <svg className="w-3.5 h-3.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" strokeWidth="2.5"/></svg>
            Neural Intel
          </h4>
          <div className="p-5 bg-white/60 dark:bg-white/5 rounded-3xl border border-white/50 dark:border-white/10 shadow-xl group">
            {isAiLoading ? <div className="py-4 text-center"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" /><p className="text-[9px] font-black text-blue-500 uppercase tracking-widest animate-pulse">Scanning</p></div> : 
              file.description ? <p className="text-[11px] leading-relaxed text-gray-700 dark:text-gray-300 italic font-medium">"{file.description}"</p> :
              <button onClick={handleAiAnalyze} className="w-full py-4 flex flex-col items-center justify-center space-y-2 opacity-40 hover:opacity-100 transition-opacity">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" strokeWidth="2.5"/></svg>
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-blue-600">Sync AI Summary</span>
              </button>
            }
          </div>
        </div>

        <div>
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Memos & Observations</h4>
          <textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => onUpdateFile({...file, notes})}
            placeholder="Log workspace context..."
            className="w-full h-32 p-5 text-[11px] bg-white/60 dark:bg-white/5 border border-white/50 dark:border-white/10 rounded-3xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 shadow-inner resize-none font-medium dark:text-gray-300 transition-all no-scrollbar"
          />
        </div>
      </div>
    </div>
  );
};

export default FileDetailsPanel;
