
import React, { useState } from 'react';
import { FileItem } from '../types';

interface TextEditorProps {
  file: FileItem;
  onSave: (updatedFile: FileItem) => void;
}

const TextEditor: React.FC<TextEditorProps> = ({ file, onSave }) => {
  // Extracting data from base64 if it's stored that way, otherwise raw text
  const [content, setContent] = useState(() => {
    try {
      if (file.dataUrl.startsWith('data:text/plain;base64,')) {
        return atob(file.dataUrl.split(',')[1]);
      }
      return file.dataUrl || '';
    } catch (e) {
      return file.dataUrl;
    }
  });

  const handleSave = () => {
    const base64Content = `data:text/plain;base64,${btoa(content)}`;
    onSave({
      ...file,
      dataUrl: base64Content,
      size: content.length,
      createdAt: Date.now(),
      versions: [...file.versions, { dataUrl: file.dataUrl, size: file.size, createdAt: file.createdAt }]
    });
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-zinc-900">
      <div className="p-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between shrink-0 bg-gray-50 dark:bg-zinc-800">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeWidth="2.5"/></svg>
          </div>
          <span className="text-[11px] font-black dark:text-white uppercase tracking-widest">{file.name}</span>
        </div>
        <button 
          onClick={handleSave}
          className="px-6 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 active:scale-95 transition-all shadow-lg"
        >
          Commit Changes
        </button>
      </div>
      <textarea 
        className="flex-1 p-8 text-sm font-medium bg-transparent focus:outline-none dark:text-gray-300 resize-none leading-relaxed"
        value={content}
        onChange={e => setContent(e.target.value)}
        spellCheck={false}
        placeholder="Initiate text stream..."
      />
      <div className="h-6 bg-gray-50 dark:bg-zinc-800 border-t border-black/5 dark:border-white/5 flex items-center px-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">
        Character Count: {content.length} | Lines: {content.split('\n').length}
      </div>
    </div>
  );
};

export default TextEditor;
