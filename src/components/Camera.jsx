import { useRef, useEffect } from 'react';

export default function Camera({ onScan }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    let stream = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Ensure onScan availability in App
  useEffect(() => {
    window.captureFrame = () => {
      if (!videoRef.current || !canvasRef.current) return null;
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      return canvas.toDataURL('image/jpeg', 0.8);
    };
  }, []);

  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover z-0 filter brightness-75 contrast-125 grayscale-[20%]"
      />
      <canvas ref={canvasRef} className="hidden" />
    </>
  );
}
