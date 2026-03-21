import { useState, useRef } from 'react';
import Camera from './components/Camera';
import ScanButton from './components/ScanButton';
import GlitchText from './components/GlitchText';
import ObjectCard from './components/ObjectCard';
import ChatPanel from './components/ChatPanel';
import AROverlay from './components/AROverlay';
import BoundingBox from './components/BoundingBox';
import useGemini from './hooks/useGemini';

function App() {
  const [visionData, setVisionData] = useState(null);
  const [chatActive, setChatActive] = useState(false);
  const [tapPos, setTapPos] = useState(null);
  
  const { isProcessing, error, identifyObject, startConversation, sendMessage } = useGemini();
  
  // We assume standard browser check for MVP simplicity.
  const isWebXRSupported = 'xr' in navigator;
  
  const handleScan = async (imageSrc) => {
    setChatActive(false);
    // If we have no image source or captureFrame fails
    if (!imageSrc) return;
    
    // Calls the hook to do generative AI
    const result = await identifyObject(imageSrc);
    if (result) {
      setVisionData(result);
    }
  };

  const handleScreenTap = (e) => {
    // Only allow tapping if we're not actively processing, viewing data, or chatting
    if (isProcessing || visionData || chatActive) return;
    
    setTapPos({ x: e.clientX, y: e.clientY });
    
    if (window.captureFrame) {
      const imgData = window.captureFrame();
      handleScan(imgData);
    }
  };

  const handleStartChat = async () => {
    if (!visionData) return;
    setChatActive(true);
    await startConversation(visionData.object_type, visionData.personality_summary);
  };

  const handleCloseChat = () => {
    setChatActive(false);
    setVisionData(null);
    setTapPos(null);
  };

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden font-sans scanlines">
      {/* Background Camera Layer */}
      <Camera />

      {/* Invisible clickable layer to catch taps across the whole screen */}
      {!isProcessing && !visionData && !chatActive && (
        <div 
          className="absolute inset-0 z-10 pointer-events-auto cursor-crosshair" 
          onClick={handleScreenTap}
        />
      )}

      {/* AR Overlay wraps the main UI - Handles Three.js Canvas injection */}
      <AROverlay isSupported={isWebXRSupported}>
        
        {/* Neon Bounding Box */}
        {(isProcessing || visionData || chatActive) && (
          <BoundingBox 
            x={tapPos?.x ?? null} 
            y={tapPos?.y ?? null} 
            isScanning={isProcessing} 
          />
        )}

        {/* Main UI Overlay */}
        <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-6">
          {/* Top Header */}
          <header className="flex justify-between items-start">
            <div>
              <GlitchText text="ANIMUS_OS_v1.0" className="text-neon-cyan font-mono text-xs tracking-widest font-bold opacity-80" />
              <div className={`text-[10px] uppercase mt-1 animate-flicker font-mono ${error ? 'text-neon-magenta' : 'text-neon-blue'}`}>
                Status: {error ? 'ERROR' : isProcessing ? 'PROCESSING' : chatActive ? 'LINK ESTABLISHED' : 'ONLINE'}
              </div>
              {error && <div className="text-xs text-neon-magenta mt-1 max-w-[200px]">{error}</div>}
            </div>
            <div className="w-8 h-8 rounded-full border border-neon-cyan/30 flex items-center justify-center">
              <div className={`w-2 h-2 ${error ? 'bg-neon-magenta shadow-[0_0_8px_#ff00c8]' : 'bg-neon-cyan shadow-[0_0_8px_#00f5ff]'} rounded-full ${chatActive ? 'animate-none' : 'animate-pulse'}`}></div>
            </div>
          </header>

          {/* Dynamic Center/Overlay content can go here */}
          <div className="flex-1 flex items-center justify-center relative pointer-events-none">
            {isProcessing && (
              <div className="panel-bg neon-border-cyan p-4 flex flex-col items-center animate-[flicker_0.3s_ease-in]">
                 <GlitchText text="ANALYZING..." className="text-neon-cyan font-mono text-lg" glitchSpeed="fast" />
                 <div className="w-full h-1 bg-gray-800 mt-2 rounded">
                   <div className="h-full bg-neon-cyan animate-pulse rounded"></div>
                 </div>
              </div>
            )}
            
            {visionData && !isProcessing && !chatActive && (
              <ObjectCard 
                visionData={visionData} 
                onClose={() => { setVisionData(null); setTapPos(null); }} 
                onChatStart={handleStartChat} 
              />
            )}

            {chatActive && (
              <ChatPanel 
                visionData={visionData}
                sendMessage={sendMessage}
                onClose={handleCloseChat}
              />
            )}
          </div>

          {/* Bottom Controls */}
          <div className="pb-8 flex justify-center pointer-events-auto">
             {/* Only show scan button if not actively conversing or scanning */}
             {!isProcessing && !visionData && !chatActive && (
               <ScanButton 
                 onScan={(img) => { setTapPos(null); handleScan(img); }} 
                 isScanning={isProcessing} 
               />
             )}
          </div>
        </div>
      </AROverlay>
    </div>
  );
}

export default App;
