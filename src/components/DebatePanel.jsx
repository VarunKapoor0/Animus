// Dual-object conversation panel.
// Objects take turns speaking. User controls pacing with CONTINUE.
// User can optionally speak/type before pressing CONTINUE to interject.

import { useState, useRef, useEffect } from 'react';

const LANG_TO_BCP47 = {
  'hindi': 'hi-IN', 'spanish': 'es-ES', 'french': 'fr-FR',
  'german': 'de-DE', 'italian': 'it-IT', 'portuguese': 'pt-BR',
  'japanese': 'ja-JP', 'korean': 'ko-KR', 'chinese': 'zh-CN',
  'arabic': 'ar-SA', 'russian': 'ru-RU',
};
function toBCP47(lang) { return LANG_TO_BCP47[lang?.toLowerCase()] || lang; }

export default function DebatePanel({ objectA, objectB, transcribeAudio, onClose }) {
  // objectA = new scan, objectB = from history
  const [messages, setMessages] = useState([]);
  const [turnState, setTurnState] = useState('idle'); // idle | speaking | paused | error
  const [currentSpeaker, setCurrentSpeaker] = useState('A'); // whose turn next
  const [userInput, setUserInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  // Gemini-style history per object
  const historyA = useRef([]);
  const historyB = useRef([]);
  const endRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const currentAudioRef = useRef(null);
  const messagesRef = useRef(messages);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, turnState]);

  // Start: Object A speaks first
  useEffect(() => {
    speakTurn('A', null, null);
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

  // Call Gemini for one turn
  const speakTurn = async (speaker, lastMessage, userInterject) => {
    setTurnState('speaking');
    const isA = speaker === 'A';
    const self = isA ? objectA : objectB;
    const other = isA ? objectB : objectA;
    const selfHistory = isA ? historyA : historyB;

    // Build the prompt message
    let userMsg = lastMessage
      ? `${other.object_type} said: "${lastMessage}"`
      : `Start a conversation with ${other.object_type}. Introduce yourself and say something provocative or interesting to them.`;
    if (userInterject) userMsg += ` The human also says: "${userInterject}"`;

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

      // Update that speaker's Gemini history
      selfHistory.current = [
        ...selfHistory.current,
        { role: 'user', parts: [{ text: userMsg }] },
        { role: 'model', parts: [{ text }] },
      ];

      setMessages(prev => [...prev, { speaker, object_type: self.object_type, text }]);
      playTTS(text, self.voice, self.vocal_direction);
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
        audio.play();
      }
    } catch (err) {
      console.warn('TTS failed:', err);
    }
  };

  const handleContinue = () => {
    const lastMsg = messagesRef.current.length > 0
      ? messagesRef.current[messagesRef.current.length - 1].text
      : null;
    const interject = userInput.trim() || null;
    setUserInput('');
    speakTurn(currentSpeaker, lastMsg, interject);
  };

  const handleClose = () => {
    stopAudio();
    // Save as a debate entry in history
    onClose({
      object_type: `${objectA.object_type} × ${objectB.object_type}`,
      personality_summary: 'Debate session',
      opening_line: messages[0]?.text || '',
      voice: objectA.voice,
      vocal_direction: objectA.vocal_direction,
      messages: messagesRef.current.map(m => ({ role: 'assistant', text: `[${m.object_type}] ${m.text}` })),
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
    <div className="absolute inset-0 m-4 sm:m-8 panel-bg border border-neon-cyan/50 flex flex-col pointer-events-auto shadow-[0_0_15px_rgba(0,245,255,0.1)] rounded overflow-hidden">
      {/* Header */}
      <div className="bg-neon-cyan/10 border-b border-neon-cyan/30 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse"></div>
          <span className={`font-mono text-xs font-bold uppercase tracking-wider ${colorA}`}>{objectA.object_type}</span>
          <span className="font-mono text-xs text-white/30">×</span>
          <span className={`font-mono text-xs font-bold uppercase tracking-wider ${colorB}`}>{objectB.object_type}</span>
        </div>
        <button onClick={handleClose} className="text-gray-400 hover:text-neon-magenta transition-colors font-mono text-sm uppercase px-2 py-1">
          [End]
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-sm">
        {messages.map((msg, i) => {
          const isA = msg.speaker === 'A';
          return (
            <div key={i} className={`max-w-[85%] ${isA ? 'mr-auto' : 'ml-auto'}`}>
              <div className={`text-[10px] mb-1 opacity-60 uppercase ${isA ? colorA : colorB}`}>
                {msg.object_type}
              </div>
              <div className={`p-3 rounded inline-block bg-black/50 border ${
                isA ? 'border-neon-magenta/30' : 'border-neon-cyan/30'
              } text-gray-200`}>
                <span className="chromatic font-serif italic text-base leading-relaxed whitespace-pre-wrap">{msg.text}</span>
              </div>
            </div>
          );
        })}

        {turnState === 'speaking' && (
          <div className="mr-auto max-w-[85%]">
            <div className={`text-[10px] mb-1 opacity-60 uppercase ${
              currentSpeaker === 'A' ? colorA : colorB
            }`}>
              {currentSpeaker === 'A' ? objectA.object_type : objectB.object_type}
            </div>
            <div className="p-3 rounded bg-black/50 border border-neon-cyan/30 text-gray-200">
              <span className="animate-pulse">_SPEAKING...</span>
            </div>
          </div>
        )}

        {turnState === 'error' && (
          <div className="text-center font-mono text-xs text-neon-magenta py-2">
            CONNECTION LOST — reload to retry
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Controls — only shown when paused */}
      {turnState === 'paused' && (
        <div className="p-4 bg-black/60 border-t border-neon-cyan/20 space-y-3">
          {/* Optional interject */}
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
              className="flex-1 bg-transparent border border-white/10 rounded px-3 py-2 font-mono text-xs text-white focus:outline-none focus:border-neon-cyan placeholder-gray-700"
            />
          </div>
          {/* Continue button */}
          <button
            onClick={handleContinue}
            className="w-full py-3 font-mono text-sm tracking-widest uppercase border border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10 hover:border-neon-cyan hover:shadow-[0_0_15px_rgba(0,245,255,0.15)] transition-all rounded"
          >
            {userInput.trim() ? '[ INTERJECT + CONTINUE → ]' : '[ CONTINUE → ]'}
          </button>
        </div>
      )}

      {/* Speaking indicator — controls locked */}
      {turnState === 'speaking' && (
        <div className="p-4 bg-black/60 border-t border-neon-cyan/20">
          <div className="w-full py-3 font-mono text-sm tracking-widest uppercase text-center text-white/20 border border-white/5 rounded">
            TRANSMITTING...
          </div>
        </div>
      )}
    </div>
  );
}
