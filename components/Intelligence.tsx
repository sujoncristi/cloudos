
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';

const Intelligence: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', text: string }[]>([
    { role: 'bot', text: "Welcome to CloudOS Intelligence. I am your neural assistant. How can I facilitate your workspace today?" }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: { systemInstruction: "You are the CloudOS Intelligence Assistant, a helpful and sophisticated AI for a macOS-style file manager. Be concise, professional, and slightly futuristic." }
      });
      setMessages(prev => [...prev, { role: 'bot', text: response.text || "Neural connection timed out." }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'bot', text: "Error syncing with Gemini core. Verify API link." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white/40 dark:bg-black/60 backdrop-blur-2xl">
      <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar" ref={scrollRef}>
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl text-[11px] font-medium leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-white/10 dark:text-white border border-black/5'}`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && <div className="flex justify-start"><div className="bg-white/10 p-4 rounded-2xl animate-pulse text-[11px] text-gray-400 font-black tracking-widest uppercase">Processing Neural Stream...</div></div>}
      </div>
      <div className="p-4 border-t border-black/5 bg-white/40 dark:bg-black/40">
        <div className="flex items-center space-x-2 bg-white dark:bg-white/5 border border-black/5 rounded-2xl p-1 shadow-inner">
          <input 
            type="text" 
            value={input} 
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask Intelligence..."
            className="flex-1 bg-transparent px-4 py-2 text-xs focus:outline-none dark:text-white"
          />
          <button onClick={handleSend} className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-xl active:scale-95 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Intelligence;
