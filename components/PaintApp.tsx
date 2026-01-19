
import React, { useRef, useState, useEffect } from 'react';
import { FileItem } from '../types';

interface PaintAppProps {
  onSave: (file: FileItem) => void;
  userId: string;
}

type Tool = 'brush' | 'eraser' | 'rect' | 'circle' | 'triangle' | 'star' | 'heart' | 'line' | 'text' | 'fill';
type BrushStyle = 'solid' | 'neon' | 'spray' | 'watercolor' | 'galaxy' | 'calligraphy';
type FontFamily = 'Inter, sans-serif' | 'serif' | 'monospace';

const PaintApp: React.FC<PaintAppProps> = ({ onSave, userId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#3b82f6');
  const [brushSize, setBrushSize] = useState(12);
  const [opacity, setOpacity] = useState(1);
  const [tool, setTool] = useState<Tool>('brush');
  const [brushStyle, setBrushStyle] = useState<BrushStyle>('solid');
  const [fontFamily, setFontFamily] = useState<FontFamily>('Inter, sans-serif');
  const [fillMode, setFillMode] = useState(false);
  
  // Undo/Redo History
  const [history, setHistory] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [snapshot, setSnapshot] = useState<ImageData | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState();

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [history, redoStack]);

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    setHistory(prev => [...prev.slice(-29), dataUrl]);
    setRedoStack([]);
  };

  const undo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const current = history[history.length - 1];
    const prev = history[history.length - 2];
    
    setRedoStack(r => [...r, current]);
    setHistory(h => h.slice(0, -1));

    const img = new Image();
    img.src = prev;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const next = redoStack[redoStack.length - 1];
    setRedoStack(r => r.slice(0, -1));
    setHistory(h => [...h, next]);

    const img = new Image();
    img.src = next;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  };

  const floodFill = (startX: number, startY: number, fillColor: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const targetColor = getPixelColor(data, startX, startY, canvas.width);
    const replacementColor = hexToRgb(fillColor);

    if (colorsMatch(targetColor, replacementColor)) return;

    const stack: [number, number][] = [[startX, startY]];
    while (stack.length > 0) {
      const [x, y] = stack.pop()!;
      if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) continue;
      
      const current = getPixelColor(data, x, y, canvas.width);
      if (colorsMatch(current, targetColor)) {
        setPixelColor(data, x, y, canvas.width, replacementColor);
        stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
      }
    }
    ctx.putImageData(imageData, 0, 0);
    saveState();
  };

  const getPixelColor = (data: Uint8ClampedArray, x: number, y: number, width: number) => {
    const offset = (y * width + x) * 4;
    return [data[offset], data[offset + 1], data[offset + 2], data[offset + 3]];
  };

  const setPixelColor = (data: Uint8ClampedArray, x: number, y: number, width: number, color: number[]) => {
    const offset = (y * width + x) * 4;
    data[offset] = color[0];
    data[offset + 1] = color[1];
    data[offset + 2] = color[2];
    data[offset + 3] = 255;
  };

  const colorsMatch = (c1: number[], c2: number[]) => {
    return c1[0] === c2[0] && c1[1] === c2[1] && c1[2] === c2[2];
  };

  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
  };

  const drawShape = (ctx: CanvasRenderingContext2D, tool: Tool, x: number, y: number) => {
    ctx.beginPath();
    const width = x - startPos.x;
    const height = y - startPos.y;

    if (tool === 'rect') {
      if (fillMode) ctx.fillRect(startPos.x, startPos.y, width, height);
      else ctx.strokeRect(startPos.x, startPos.y, width, height);
    } else if (tool === 'circle') {
      const radius = Math.sqrt(width * width + height * height);
      ctx.arc(startPos.x, startPos.y, radius, 0, Math.PI * 2);
    } else if (tool === 'triangle') {
      ctx.moveTo(startPos.x + width / 2, startPos.y);
      ctx.lineTo(startPos.x, y);
      ctx.lineTo(x, y);
      ctx.closePath();
    } else if (tool === 'star') {
      const cx = startPos.x;
      const cy = startPos.y;
      const spikes = 5;
      const outerRadius = Math.sqrt(width * width + height * height);
      const innerRadius = outerRadius / 2.5;
      let rot = Math.PI / 2 * 3;
      let step = Math.PI / spikes;
      ctx.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
        rot += step;
        ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
        rot += step;
      }
      ctx.closePath();
    } else if (tool === 'heart') {
      const cx = startPos.x;
      const cy = startPos.y;
      const r = Math.sqrt(width * width + height * height);
      ctx.moveTo(cx, cy + r / 4);
      ctx.bezierCurveTo(cx, cy, cx - r, cy, cx - r, cy + r / 2);
      ctx.bezierCurveTo(cx - r, cy + r, cx, cy + r * 1.5, cx, cy + r * 1.5);
      ctx.bezierCurveTo(cx, cy + r * 1.5, cx + r, cy + r, cx + r, cy + r / 2);
      ctx.bezierCurveTo(cx + r, cy, cx, cy, cx, cy + r / 4);
      ctx.closePath();
    } else if (tool === 'line') {
      ctx.moveTo(startPos.x, startPos.y);
      ctx.lineTo(x, y);
    }

    if (tool !== 'rect' && tool !== 'line') {
      if (fillMode) ctx.fill();
      else ctx.stroke();
    } else if (tool === 'line') {
      ctx.stroke();
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    
    if (tool === 'fill') {
      floodFill(Math.floor(x), Math.floor(y), color);
      return;
    }

    setStartPos({ x, y });
    setSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height));
    
    if (tool === 'text') {
      const text = prompt("Enter Creative Text:");
      if (text) {
        ctx.globalAlpha = opacity;
        ctx.fillStyle = color;
        ctx.font = `bold ${brushSize * 4}px ${fontFamily}`;
        ctx.fillText(text, x, y);
        saveState();
      }
      return;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const applyBrushStyle = (ctx: CanvasRenderingContext2D) => {
    ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowBlur = 0;
    ctx.globalAlpha = opacity;

    if (tool !== 'eraser') {
      if (brushStyle === 'neon') {
        ctx.shadowBlur = brushSize * 2.5;
        ctx.shadowColor = color;
      }
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    
    if (['rect', 'circle', 'triangle', 'star', 'heart', 'line'].includes(tool) && snapshot) {
      ctx.putImageData(snapshot, 0, 0);
      applyBrushStyle(ctx);
      drawShape(ctx, tool, x, y);
    } else if (tool === 'brush' || tool === 'eraser') {
      applyBrushStyle(ctx);
      
      if (brushStyle === 'spray' && tool === 'brush') {
        for (let i = 0; i < 30; i++) {
          const offsetX = (Math.random() - 0.5) * brushSize * 6;
          const offsetY = (Math.random() - 0.5) * brushSize * 6;
          ctx.fillRect(x + offsetX, y + offsetY, 1, 1);
        }
      } else if (brushStyle === 'watercolor' && tool === 'brush') {
        ctx.globalAlpha = 0.05;
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.arc(x + (Math.random() - 0.5) * brushSize, y + (Math.random() - 0.5) * brushSize, brushSize * (1 + Math.random()), 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (brushStyle === 'galaxy' && tool === 'brush') {
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
        ctx.fill();
        if (Math.random() > 0.8) {
           ctx.fillStyle = '#ffffff';
           ctx.beginPath();
           ctx.arc(x + (Math.random() - 0.5) * brushSize * 2, y + (Math.random() - 0.5) * brushSize * 2, 1, 0, Math.PI * 2);
           ctx.fill();
        }
      } else if (brushStyle === 'calligraphy' && tool === 'brush') {
        ctx.setTransform(1, 0.5, 0, 1, 0, 0);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      } else {
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveState();
    }
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSave({
      id: Math.random().toString(36).substr(2, 9),
      userId,
      parentId: null,
      isFolder: false,
      name: `Creation_${Date.now()}.png`,
      size: dataUrl.length * 0.75,
      type: 'image',
      dataUrl,
      createdAt: Date.now(),
      tags: ['canvas-masterpiece'],
      versions: [],
      isShared: false,
      isDeleted: false
    });
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-black overflow-hidden select-none">
      {/* Designer Toolbar */}
      <div className="shrink-0 bg-white/90 dark:bg-zinc-900/95 backdrop-blur-3xl border-b border-black/10 dark:border-white/10 flex flex-wrap items-center px-8 py-4 z-20 gap-x-10 gap-y-4 shadow-xl">
        
        {/* Undo / Redo Control */}
        <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-2xl shadow-inner border border-black/5 dark:border-white/5">
           <button onClick={undo} disabled={history.length <= 1} className="p-3 rounded-xl transition-all disabled:opacity-20 text-gray-500 hover:text-blue-500 hover:bg-white dark:hover:bg-white/10" title="Undo (⌘Z)">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
           </button>
           <button onClick={redo} disabled={redoStack.length === 0} className="p-3 rounded-xl transition-all disabled:opacity-20 text-gray-500 hover:text-blue-500 hover:bg-white dark:hover:bg-white/10" title="Redo (⌘Y)">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" /></svg>
           </button>
        </div>

        {/* Primary Tools Segmented Control */}
        <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-2xl border border-black/5 dark:border-white/5">
           {[
             { id: 'brush', icon: <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /> },
             { id: 'fill', icon: <path d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /> },
             { id: 'eraser', icon: <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /> },
             { id: 'line', icon: <path d="M4 20L20 4" strokeWidth="2.5" /> },
             { id: 'rect', icon: <rect x="4" y="4" width="16" height="16" rx="2" strokeWidth="2.5" /> },
             { id: 'circle', icon: <circle cx="12" cy="12" r="8" strokeWidth="2.5" /> },
             { id: 'triangle', icon: <path d="M12 4L4 20h16z" strokeWidth="2.5" /> },
             { id: 'star', icon: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2z" strokeWidth="2"/> },
             { id: 'heart', icon: <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" strokeWidth="2"/> },
             { id: 'text', icon: <path d="M4 7V4h16v3M9 20h6M12 4v16" strokeWidth="2.5" /> }
           ].map(t => (
             <button key={t.id} onClick={() => setTool(t.id as Tool)} className={`p-2.5 rounded-xl transition-all ${tool === t.id ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-md scale-105' : 'text-gray-400 hover:text-gray-600 dark:hover:text-white'}`} title={t.id.toUpperCase()}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">{t.icon}</svg>
             </button>
           ))}
        </div>

        {/* Fill Toggle */}
        {['rect', 'circle', 'triangle', 'star', 'heart'].includes(tool) && (
          <button onClick={() => setFillMode(!fillMode)} className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${fillMode ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-gray-100 dark:bg-white/5 text-gray-500 border-black/5 dark:border-white/5'}`}>
            {fillMode ? 'Filled Solids' : 'Outlines Only'}
          </button>
        )}

        {/* Brush Modality Picker */}
        {tool === 'brush' && (
          <div className="flex bg-blue-500/5 dark:bg-blue-500/10 p-1 rounded-2xl overflow-hidden border border-blue-500/20">
             {(['solid', 'neon', 'spray', 'watercolor', 'galaxy', 'calligraphy'] as BrushStyle[]).map(s => (
               <button key={s} onClick={() => setBrushStyle(s)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${brushStyle === s ? 'bg-white dark:bg-white/10 text-blue-600 shadow-sm' : 'text-gray-400 hover:text-blue-400'}`}>
                 {s}
               </button>
             ))}
          </div>
        )}

        {/* Color & Size Precision */}
        <div className="flex items-center space-x-12">
           <div className="flex flex-col items-center">
              <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Pigment</span>
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-10 h-10 rounded-full border-none cursor-pointer bg-transparent shadow-xl ring-2 ring-black/5 dark:ring-white/10" />
           </div>
           <div className="flex flex-col w-32">
              <div className="flex justify-between mb-1.5"><span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Weight</span><span className="text-[8px] font-black text-blue-500">{brushSize}px</span></div>
              <input type="range" min="1" max="200" value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))} className="w-full h-1.5 bg-gray-200 dark:bg-white/10 rounded-full appearance-none accent-blue-600" />
           </div>
           <div className="flex flex-col w-32">
              <div className="flex justify-between mb-1.5"><span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Aura</span><span className="text-[8px] font-black text-indigo-500">{Math.round(opacity * 100)}%</span></div>
              <input type="range" min="0.1" max="1" step="0.05" value={opacity} onChange={(e) => setOpacity(parseFloat(e.target.value))} className="w-full h-1.5 bg-gray-200 dark:bg-white/10 rounded-full appearance-none accent-indigo-600" />
           </div>
        </div>

        <button onClick={handleSave} className="ml-auto px-10 py-4 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white rounded-[26px] text-[10px] font-black uppercase tracking-[0.25em] shadow-[0_20px_50px_-10px_rgba(79,70,229,0.4)] hover:shadow-2xl hover:scale-[1.04] transition-all active:scale-95 border border-white/20">
          Commit Vision
        </button>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 relative flex items-center justify-center p-20 overflow-hidden bg-gray-100 dark:bg-zinc-950/50">
        <div className="relative group p-1 bg-white dark:bg-zinc-800 rounded-lg shadow-2xl">
            <canvas
              ref={canvasRef}
              width={2000}
              height={1400}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="bg-white shadow-sm cursor-crosshair max-w-full max-h-[80vh] transition-transform duration-700 border border-black/5"
            />
            {/* Corner Markers */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-500/30 rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blue-500/30 rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blue-500/30 rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blue-500/30 rounded-br-lg" />
        </div>
        
        {/* Navigation HUD */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center space-x-12 opacity-50 hover:opacity-100 transition-opacity">
           <div className="px-8 py-3 bg-black/80 backdrop-blur-3xl rounded-3xl border border-white/10 text-[10px] font-black text-white/70 tracking-[0.3em] flex items-center">
             <div className="w-2 h-2 bg-blue-500 rounded-full mr-4 animate-pulse" />
             DIMENSION: 2000 x 1400
           </div>
           <div className="px-8 py-3 bg-indigo-600/20 backdrop-blur-3xl rounded-3xl border border-indigo-500/20 text-[10px] font-black text-indigo-400 tracking-[0.2em]">
             ACTIVE TOOL: {tool.toUpperCase()}
           </div>
        </div>
      </div>
    </div>
  );
};

export default PaintApp;
