
import React, { useState } from 'react';
import { Note } from '../types';

interface StickyNotesProps {
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  userId: string;
}

const StickyNotes: React.FC<StickyNotesProps> = ({ notes, setNotes, userId }) => {
  const [content, setContent] = useState('');
  const colors = ['bg-yellow-100', 'bg-blue-100', 'bg-pink-100', 'bg-green-100'];

  const addNote = () => {
    if (!content.trim()) return;
    const newNote: Note = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      content: content.trim(),
      color: colors[Math.floor(Math.random() * colors.length)],
      x: 10,
      y: 10
    };
    setNotes(prev => [...prev, newNote]);
    setContent('');
  };

  const removeNote = (id: string) => setNotes(prev => prev.filter(n => n.id !== id));

  return (
    <div className="h-full flex flex-col bg-white/20">
      <div className="p-6 border-b border-black/5 flex space-x-2">
        <input 
          type="text" 
          value={content} 
          onChange={e => setContent(e.target.value)}
          placeholder="New memo..." 
          className="flex-1 px-4 py-2 rounded-xl text-xs bg-white border border-black/5 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
        <button onClick={addNote} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Post</button>
      </div>
      <div className="flex-1 p-6 grid grid-cols-2 gap-4 overflow-y-auto no-scrollbar">
        {notes.filter(n => n.userId === userId).map(note => (
          <div key={note.id} className={`${note.color} p-4 rounded-xl shadow-sm border border-black/5 relative group animate-in zoom-in-95 duration-200`}>
            <button onClick={() => removeNote(note.id)} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity text-black/20 hover:text-red-500">
               <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
            </button>
            <p className="text-[11px] font-medium text-gray-800 leading-relaxed">{note.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StickyNotes;
