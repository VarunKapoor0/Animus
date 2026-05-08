// Dual-object conversation panel.
import { useState, useRef, useEffect } from 'react';

export default function DebatePanel({ objectA, objectB, transcribeAudio, onClose }) {
  const [messages, setMessages] = useState([]);
  const [turnState, setTurnState] = useState('idle');
  const [currentSpeaker, setCurrentSpeaker] = useState('A');
  const [userInput, setUserInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const historyA = useRef([]);
  const historyB = useRef([]);
  const lastSaidA = useRef(null);
  const lastSaidB = useRef(null);
  const pendingInterject = useRef(null);
  const endRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const currentAudioRef = useRef(null);
  const messagesRef = useRef([]);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, turnState]);

  useEffect(() => {
    speakTurn('A');
    return () => stopAudio();
  }, []);

  const stopAudio = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.src = '';
      currentAudioRef.current = null;
    }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  };

  const speakTurn = async (speaker) => {
    setTurnState('speaking');
    const isA = speaker === 'A';
    const self = isA ? objectA : objectB;
    const other = isA ? objectB : objectA;
    const selfHistory = isA ? historyA : historyB;
    const lastOtherSaid = isA ? lastSaidB.current : lastSaidA.current;
    const interject = pendingInterject.current;
    pendingInterject.current = null;

    let userMsg;
    if (!lastOtherSaid) {
      userMsg = `You are starting a conversation with ${other.object_type}. Introduce yourself and say something provocative or interesting to get them talking.`;
    } else {
      userMsg = `${other.object_type} just said: "${lastOtherSaid}".${interject ? ` The human also says: "${interject}". Respond to both ${other.object_type} and the human.` : ''} Respond directly to ${other.object_type}.`;
    }

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'debate',
          payload: {
            selfType: self.object_type,
            selfPersonality: self.personality_summary,
            otherType: other.object_type,
            otherPersonality: other.personality_summary,
            message: userMsg,
            history: selfHistory.current,
          }
        })
      });
      if (!response.ok) throw new Error('Debate API error');
      const data = await response.json();
      const text = data.text;
      selfHistory.current = [
        ...selfHistory.current,
        { role: 'user', parts: [{ text: userMsg }] },
        { role: 'model', parts: [{ text }] },
      ];
      if (isA) lastSaidA.current = text;
      else lastSaidB.current = text;
      setMessages(prev => [...prev, { speaker, object_type: self.object_type, text }]);
      await playTTS(text, self.voice, self.vocal_direction);
      setCurrentSpeaker(isA ? 'B' : 'A');
      setTurnState('paused');
    } catch (err) {
      console.error('Debate turn error:', err);
      setTurnState('error');
    }
  };

  const playTTS = async (text, voice, vocalDirection) => {
    stopAudio();
    try {
      const response = await fetch('/api/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: voice || 'diana', vocal_direction: vocalDirection })
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        currentAudioRef.current = audio;
        audio.onended = () => URL.revokeObjectURL(url);
        await audio.play();
      }
    } catch (err) { console.warn('TTS failed:', err); }
  };

  const handleContinue = () => {
    const interject = userInput.trim() || null;
    if (interject) {
      setMessages(prev => [...prev, { speaker: 'USER', object_type: 'YOU', text: interject }]);
      pendingInterject.current = interject;
    }
    setUserInput('');
    speakTurn(currentSpeaker);
  };

  const handleClose = () => {
    stopAudio();
    onClose({
      object_type: `${objectA.object_type} × ${objectB.object_type}`,
      personality_summary: 'Connection session',
      opening_line: messagesRef.current[0]?.text || '',
      voice: objectA.voice,
      vocal_direction: objectA.vocal_direction,
      messages: messagesRef.current.map(m => ({
        role: m.speaker === 'USER' ? 'user' : 'assistant',
        text: m.speaker === 'USER' ? m.text : `[${m.object_type}] ${m.text}`
      })),
      isDebate: true,
    });
  };

  const startRecording = async () => {
    if (turnState === 'speaking' || isTranscribing) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setIsTranscribing(true);
        const transcript = await transcribeAudio(blob);
        setIsTranscribing(false);
        if (transcript) setUserInput(transcript.trim());
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) { console.error('Mic error:', err); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const colorA = 'text-neon-magenta';
  const colorB = 'text-neon-cyan';

  return (
    <div
      className="fixed inset-x-0 bottom-0 top-0 flex items-stretch justify-center pointer-events-none"
      style={{ zIndex: 30 }}
    >
      <div
        className="pointer-events-auto w-full max-w-2xl mx-auto my-2 sm:my-6 md:my-10 panel-bg border border-neon-cyan/50 flex flex-col shadow-[0_0_15px_rgba(0,245,255,0.1)] rounded overflow-hidden"
        style={{ maxHeight: 'calc(100dvh - 16px)' }}
      >
        {/* Header */}
        <div className="flex-none bg-neon-cyan/10 border-b border-neon-cyan/30 px-3 py-2 flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse flex-none" />
            <span className={`font-mono text-xs font-bold uppercase tracking-wider truncate ${colorA}`}>{objectA.object_type}</span>
            <span className="font-mono text-xs text-white/30 flex-none">×</span>
            <span className={`font-mono text-xs font-bold uppercase tracking-wider truncate ${colorB}`}>{objectB.object_type}</span>
          </div>
          <button
            onClick={handleClose}
            className="flex-none px-3 py-1.5 font-mono text-xs uppercase text-neon-magenta border border-neon-magenta/50 hover:bg-neon-magenta/10 rounded transition-colors whitespace-nowrap"
          >
            ✕ END
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 font-mono text-sm">
          {messages.map((msg, i) => {
            const isUser = msg.speaker === 'USER';
            const isA = msg.speaker === 'A';
            return (
              <div key={i} className={`max-w-[88%] ${isUser ? 'ml-auto text-right' : isA ? 'mr-auto' : 'ml-auto'}`}>
                <div className={`text-[10px] mb-1 opacity-60 uppercase ${
                  isUser ? 'text-white/40' : isA ? colorA : colorB
                }`}>
                  {msg.object_type}
                </div>
                <div className={`p-2 rounded inline-block ${
                  isUser
                    ? 'bg-white/10 border border-white/20 text-white'
                    : `bg-black/50 border ${isA ? 'border-neon-magenta/30' : 'border-neon-cyan/30'} text-gray-200`
                }`}>
                  {isUser
                    ? <span className="whitespace-pre-wrap text-sm">{msg.text}</span>
                    : <span className="chromatic font-serif italic text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</span>
                  }
                </div>
              </div>
            );
          })}
          {turnState === 'speaking' && (
            <div className={`max-w-[88%] ${currentSpeaker === 'B' ? 'ml-auto' : 'mr-auto'}`}>
              <div className={`text-[10px] mb-1 opacity-60 uppercase ${currentSpeaker === 'A' ? colorA : colorB}`}>
                {currentSpeaker === 'A' ? objectA.object_type : objectB.object_type}
              </div>
              <div className="p-2 rounded bg-black/50 border border-neon-cyan/30 text-gray-200">
                <span className="animate-pulse">_SPEAKING...</span>
              </div>
            </div>
          )}
          {turnState === 'error' && (
            <div className="text-center font-mono text-xs text-neon-magenta py-2">CONNECTION LOST — try again</div>
          )}
          <div ref={endRef} />
        </div>

        {/* Controls — always anchored to bottom */}
        {turnState === 'paused' && (
          <div className="flex-none p-2 bg-black/60 border-t border-neon-cyan/20 space-y-2">
            <div className="flex gap-2">
              <button
                type="button"
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onTouchStart={(e) => { e.preventDefault(); startRecording(); }}
                onTouchEnd={stopRecording}
                disabled={isTranscribing}
                className={`flex-none px-3 py-2 font-mono text-xs border rounded transition-all select-none ${
                  isRecording
                    ? 'bg-neon-magenta/20 border-neon-magenta text-neon-magenta animate-pulse'
                    : 'border-neon-magenta/30 text-neon-magenta/50 hover:border-neon-magenta hover:text-neon-magenta'
                }`}
              >
                {isRecording ? '●' : '🎙'}
              </button>
              <input
                type="text"
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleContinue(); }}
                placeholder={isTranscribing ? 'Transcribing...' : 'Interject (optional)...'}
                className="flex-1 min-w-0 bg-transparent border border-white/10 rounded px-3 py-2 font-mono text-xs text-white focus:outline-none focus:border-neon-cyan placeholder-gray-700"
              />
            </div>
            <button
              onClick={handleContinue}
              className="w-full py-2.5 font-mono text-xs tracking-widest uppercase border border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10 hover:border-neon-cyan transition-all rounded"
            >
              {userInput.trim() ? '[ INTERJECT + CONTINUE → ]' : '[ CONTINUE → ]'}
            </button>
          </div>
        )}
        {turnState === 'speaking' && (
          <div className="flex-none p-2 bg-black/60 border-t border-neon-cyan/20">
            <div className="w-full py-2.5 font-mono text-xs tracking-widest uppercase text-center text-white/20 border border-white/5 rounded">
              TRANSMITTING...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
