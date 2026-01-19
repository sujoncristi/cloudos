
import React, { useState } from 'react';
import { FileItem } from '../types';

interface SocialShareProps {
  file: FileItem;
  onClose: () => void;
}

const SocialShare: React.FC<SocialShareProps> = ({ file, onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  const generateLink = (platform: string) => {
    setIsGenerating(true);
    // Simulate API bridge generation
    setTimeout(() => {
      const mockUrl = `https://cloudos.io/nexus/${platform.toLowerCase()}/${file.id}`;
      setShareUrl(mockUrl);
      setIsGenerating(false);
      
      const platforms: Record<string, string> = {
        'Facebook': `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(mockUrl)}`,
        'X': `https://twitter.com/intent/tweet?url=${encodeURIComponent(mockUrl)}&text=Check out this asset from CloudOS!`,
        'Instagram': `https://www.instagram.com/`, // API restricted, open app
        'Threads': `https://www.threads.net/intent/post?text=${encodeURIComponent(mockUrl)}`,
        'TruthSocial': `https://truthsocial.com/share?url=${encodeURIComponent(mockUrl)}`
      };

      if (platforms[platform]) {
        window.open(platforms[platform], '_blank');
      }
    }, 800);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-white/40 dark:bg-black/60 backdrop-blur-3xl animate-in fade-in duration-500">
      <div className="w-24 h-24 mb-8 bg-blue-600 rounded-[22%] shadow-2xl flex items-center justify-center overflow-hidden">
         {file.type === 'image' ? <img src={file.dataUrl} className="w-full h-full object-cover" alt="" /> : <span className="text-4xl">📄</span>}
      </div>
      <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-2 tracking-tight">Omni-Share Bridge</h2>
      <p className="text-xs font-medium text-gray-400 mb-10 text-center px-12">Establish a neural transmission link for "{file.name}" across global networks.</p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-lg">
        {[
          { name: 'Facebook', color: 'bg-[#1877F2]', icon: 'FB' },
          { name: 'X', color: 'bg-black', icon: '𝕏' },
          { name: 'Instagram', color: 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600', icon: 'IG' },
          { name: 'Threads', color: 'bg-black', icon: 'TH' },
          { name: 'TruthSocial', color: 'bg-[#1F6BFF]', icon: 'TS' }
        ].map(p => (
          <button 
            key={p.name}
            disabled={isGenerating}
            onClick={() => generateLink(p.name)}
            className={`${p.color} h-16 rounded-3xl flex flex-col items-center justify-center shadow-lg active:scale-95 transition-all group overflow-hidden relative`}
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="text-lg font-black text-white">{p.icon}</span>
            <span className="text-[8px] font-black uppercase text-white/70 tracking-widest mt-1">{p.name}</span>
          </button>
        ))}
        <button onClick={onClose} className="h-16 bg-white/10 border border-white/20 rounded-3xl flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-red-500 hover:text-white transition-all">Cancel</button>
      </div>

      {isGenerating && (
        <div className="mt-12 flex flex-col items-center animate-pulse">
           <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
           <p className="text-[9px] font-black uppercase text-blue-500 tracking-[0.3em]">Encrypting Nexus Link...</p>
        </div>
      )}
    </div>
  );
};

export default SocialShare;
