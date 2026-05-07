import { useState, useRef, useEffect } from 'react';
import Camera from './components/Camera';
import ScanButton from './components/ScanButton';
import GlitchText from './components/GlitchText';
import ObjectCard from './components/ObjectCard';
import ChatPanel from './components/ChatPanel';
import AROverlay from './components/AROverlay';
import BoundingBox from './components/BoundingBox';
import LandingPage from './components/LandingPage';
import useGemini from './hooks/useGemini';

function App() {
  const [landed, setLanded] = useState(false);
  const [visionData, setVisionData] = useState(null);
  const [chatActive, setChatActive] = useState(false);
  const [tapPos, setTapPos] = useState(null);
  
  const { isProcessing, error, identifyObject, startConversation, sendMessage, transcribeAudio } = useGemini();
  
  const isWebXRSupported = 'xr' in navigator;

  // Push history entry when entering app, pop back to landing on back button
  useEffect(() => {
    const handlePopState = () => {
      setLanded(false);
      setVisionData(null);
      setChatActive(false);
      setTapPos(null);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleEnter = () => {
    window.history.pushState({ page: 'app' }, '');
    setLanded(true);
  };

  if (!landed) {
    return <LandingPage onEnter={handleEnter} />;
  }
  
  const handleScan = async (imageSrc) => {
    setChatActive(false);
    if (!imageSrc) return;
    const result = await identifyObject(imageSrc);
    if (result) setVisionData(result);
  };

  const handleScreenTap = (e) => {
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
      <Camera />

      {!isProcessing && !visionData && !chatActive && (
        <div 
          className="absolute inset-0 z-10 pointer-events-auto cursor-crosshair" 
          onClick={handleScreenTap}
        />
      )}

      <AROverlay isSupported={isWebXRSupported}>
        
        {(isProcessing || visionData || chatActive) && (
          <BoundingBox 
            x={tapPos?.x ?? null} 
            y={tapPos?.y ?? null} 
            isScanning={isProcessing} 
          />
        )}

        <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-6">
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
                transcribeAudio={transcribeAudio}
                onClose={handleCloseChat}
              />
            )}
          </div>

          <div className="pb-8 flex justify-center pointer-events-auto">
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
