
import React, { useRef, useState, useEffect } from 'react';
import { FileItem } from '../types';

interface CameraAppProps {
  onCapture: (file: FileItem) => void;
  userId: string;
}

const CameraApp: React.FC<CameraAppProps> = ({ onCapture, userId }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const enableCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        setError("Optical sensor link failed. Check permissions.");
      }
    };

    enableCamera();

    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        
        const newFile: FileItem = {
          id: Math.random().toString(36).substr(2, 9),
          userId,
          parentId: null,
          isFolder: false,
          name: `Ingest_${new Date().getTime()}.jpg`,
          size: dataUrl.length * 0.75, // Approx size
          type: 'image',
          dataUrl,
          createdAt: Date.now(),
          tags: ['captured'],
          versions: [],
          isShared: false,
          isDeleted: false
        };

        onCapture(newFile);
        alert("Neural capture established and stored.");
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-black overflow-hidden relative">
      {error ? (
        <div className="flex-1 flex items-center justify-center p-8 text-center">
          <p className="text-red-500 font-black uppercase text-xs tracking-widest">{error}</p>
        </div>
      ) : (
        <>
          <video ref={videoRef} autoPlay playsInline className="flex-1 w-full h-full object-cover grayscale brightness-125" />
          <div className="absolute bottom-10 left-0 right-0 flex justify-center">
            <button 
              onClick={capture}
              className="w-16 h-16 bg-white rounded-full border-4 border-gray-200 shadow-2xl active:scale-90 transition-transform flex items-center justify-center group"
            >
               <div className="w-12 h-12 bg-white rounded-full border border-black/10 group-active:bg-red-500 transition-colors" />
            </button>
          </div>
          <canvas ref={canvasRef} className="hidden" />
          <div className="absolute top-4 right-4 bg-red-500 w-2 h-2 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,1)]" />
          <div className="absolute top-4 left-4 text-white text-[9px] font-black uppercase tracking-[0.2em] opacity-50">Sensor Active</div>
        </>
      )}
    </div>
  );
};

export default CameraApp;
