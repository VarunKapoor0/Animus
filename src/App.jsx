// App.jsx — lean layout and routing shell.
// All domain state and handlers live in useAnimusState.

import { useEffect } from 'react';
import Camera from './components/Camera';
import ScanButton from './components/ScanButton';
import GlitchText from './components/GlitchText';
import ObjectCard from './components/ObjectCard';
import ChatPanel from './components/ChatPanel';
import DebatePrompt from './components/DebatePrompt';
import DebatePanel from './components/DebatePanel';
import AROverlay from './components/AROverlay';
import BoundingBox from './components/BoundingBox';
import TapRipple from './components/TapRipple';
import SpatialMarkers from './components/SpatialMarkers';
import LandingPage from './components/LandingPage';
import ScanHistory from './components/ScanHistory';
import useAnimusState from './hooks/useAnimusState';
import { useState } from 'react';

function App() {
  const [landed, setLanded] = useState(false);

  const {
    visionData, setVisionData,
    chatActive,
    debateActive,
    debatePartner,
    tapPos, setTapPos,
    rippleTrigger,
    ripplePos,
    scanHistory,
    markers,
    resumedMessages,
    showDebatePrompt,
    isIdle,
    isProcessing, error,
    sendMessage, transcribeAudio,
    containerRef, isARActive, markerScreenPositions,
    resetToIdle,
    handleScreenTap,
    handleScanButton,
    handleTalkAlone,
    handleStartDebate,
    handleStartChat,
    handleCloseChat,
    handleCloseDebate,
    handleMarkerTap,
    handleResume,
  } = useAnimusState();

  useEffect(() => {
    window.history.replaceState({ page: 'landing' }, '');
    const handlePopState = (e) => {
      if (!e.state || e.state.page === 'landing') {
        setLanded(false);
        resetToIdle();
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [resetToIdle]);

  const handleEnter = () => {
    window.history.pushState({ page: 'app' }, '');
    setLanded(true);
  };

  if (!landed) return <LandingPage onEnter={handleEnter} />;

  const lastScannedName = scanHistory.length > 0 ? scanHistory[0].object_type : null;

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden font-sans scanlines">
      <Camera hidden={isARActive} />

      {isIdle && (
        <div className="absolute inset-0 z-10 pointer-events-auto cursor-crosshair" onClick={handleScreenTap} />
      )}

      <AROverlay containerRef={containerRef} isARActive={isARActive}>
        <TapRipple x={ripplePos.x} y={ripplePos.y} trigger={rippleTrigger} />

        <SpatialMarkers
          markers={isIdle ? markers : []}
          onTap={handleMarkerTap}
          arMode={isARActive}
          arScreenPositions={markerScreenPositions}
        />

        {isProcessing && (
          <BoundingBox
            x={tapPos?.x ?? null}
            y={tapPos?.y ?? null}
            isScanning={true}
            objectType={null}
          />
        )}

        <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-6">
          {/* Header — backdrop blur pill for readability against camera feed */}
          <header className="flex justify-between items-start">
            <div
              className="px-3 py-2 rounded"
              style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)' }}
            >
              <GlitchText
                text="ANIMUS_OS_v1.0"
                className="text-neon-cyan font-mono text-xs tracking-widest font-bold"
              />
              <div
                className={`text-[10px] uppercase mt-0.5 font-mono ${
                  error ? 'text-neon-magenta' : 'text-neon-blue'
                }`}
                style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}
              >
                {error ? 'ERROR' : isProcessing ? 'PROCESSING' : chatActive ? 'LINK ESTABLISHED' : debateActive ? 'DUAL LINK' : isARActive ? 'AR · ONLINE' : 'ONLINE'}
              </div>
              {error && (
                <div
                  className="text-xs text-neon-magenta mt-1 max-w-[200px]"
                  style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}
                >
                  {error}
                </div>
              )}
            </div>
            <div
              className="w-8 h-8 rounded-full border border-neon-cyan/30 flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)' }}
            >
              <div className={`w-2 h-2 ${
                error ? 'bg-neon-magenta shadow-[0_0_8px_#ff00c8]'
                : debateActive ? 'bg-neon-magenta shadow-[0_0_8px_#ff00c8]'
                : isARActive ? 'bg-neon-cyan shadow-[0_0_12px_#00f5ff]'
                : 'bg-neon-cyan shadow-[0_0_8px_#00f5ff]'
              } rounded-full ${(chatActive || debateActive) ? 'animate-none' : 'animate-pulse'}`}></div>
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

            {visionData && !isProcessing && !chatActive && !debateActive && showDebatePrompt && (
              <DebatePrompt
                newObject={visionData}
                history={scanHistory}
                onConnect={handleStartDebate}
                onTalkAlone={handleTalkAlone}
              />
            )}

            {visionData && !isProcessing && !chatActive && !debateActive && !showDebatePrompt && (
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
                initialMessages={resumedMessages}
                onClose={handleCloseChat}
              />
            )}

            {debateActive && visionData && debatePartner && (
              <DebatePanel
                objectA={visionData}
                objectB={debatePartner}
                transcribeAudio={transcribeAudio}
                onClose={handleCloseDebate}
              />
            )}
          </div>

          <div className="pb-8 flex flex-col items-center gap-3 pointer-events-auto">
            {isIdle && (
              <>
                <ScanHistory history={scanHistory} onResume={handleResume} />

                {/* Connect nudge — shown after first conversation */}
                {lastScannedName && (
                  <p
                    className="font-mono text-[10px] text-white/60 tracking-widest uppercase text-center px-4 py-1 rounded"
                    style={{
                      textShadow: '0 1px 4px rgba(0,0,0,0.9)',
                      background: 'rgba(0,0,0,0.35)',
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    Scan another object to connect it with{' '}
                    <span className="text-neon-cyan/70">
                      {lastScannedName.length > 20
                        ? lastScannedName.substring(0, 20) + '...'
                        : lastScannedName}
                    </span>
                  </p>
                )}

                <ScanButton onScan={handleScanButton} isScanning={isProcessing} />
              </>
            )}
          </div>
        </div>
      </AROverlay>
    </div>
  );
}

export default App;
