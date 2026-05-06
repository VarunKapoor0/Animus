import { useState, useRef, useEffect } from 'react';
import GlitchText from './GlitchText';

export default function ChatPanel({ visionData, sendMessage, transcribeAudio, onClose }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: visionData.opening_line }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const endOfChatRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const currentAudioRef = useRef(null);

  useEffect(() => {
    endOfChatRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Auto-play opening line when chat panel mounts
  useEffect(() => {
    if (visionData.opening_line) {
      speakReply(visionData.opening_line);
    }
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

  const handleClose = () => {
    stopAudio();
    onClose();
  };

  const handleSend = async (messageText) => {
    const text = messageText || inputVal;
    if (!text.trim() || isTyping) return;

    setMessages(prev => [...prev, { role: 'user', text }]);
    setInputVal('');
    setIsTyping(true);

    const reply = await sendMessage(text);

    if (reply) {
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
      speakReply(reply);
    } else {
      setMessages(prev => [...prev, { role: 'assistant', text: '[CONNECTION LOST... UNABLE TO RESPOND]' }]);
    }
    setIsTyping(false);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSend();
  };

  // TTS — try Groq Orpheus first, fall back to Web Speech on failure
  const speakReply = async (text) => {
    stopAudio();
    try {
      const response = await fetch('/api/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        currentAudioRef.current = audio;
        audio.onended = () => URL.revokeObjectURL(audioUrl);
        audio.play();
        return;
      }
    } catch (err) {
      console.warn('Groq TTS failed, falling back to Web Speech:', err);
    }

    // Fallback: Web Speech API
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startRecording = async () => {
    if (isTyping || isTranscribing) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setIsTranscribing(true);
        const transcript = await transcribeAudio(audioBlob);
        setIsTranscribing(false);
        if (transcript && transcript.trim()) {
          handleSend(transcript.trim());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone access error:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="absolute inset-0 m-4 sm:m-8 panel-bg border border-neon-cyan/50 flex flex-col pointer-events-auto shadow-[0_0_15px_rgba(0,245,255,0.1)] rounded overflow-hidden">
      <div className="bg-neon-cyan/10 border-b border-neon-cyan/30 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse"></div>
          <span className="font-mono text-sm tracking-wider uppercase text-neon-cyan font-bold">
             LINK: {visionData.object_type}
          </span>
        </div>
        <button 
          onClick={handleClose}
          className="text-gray-400 hover:text-neon-magenta transition-colors font-mono text-sm uppercase px-2 py-1"
        >
          [Terminate]
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-sm custom-scrollbar">
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`max-w-[85%] ${msg.role === 'user' ? 'ml-auto text-right' : 'mr-auto text-left'}`}
          >
            <div className={`text-[10px] mb-1 opacity-50 uppercase ${msg.role === 'user' ? 'text-neon-blue' : 'text-neon-cyan'}`}>
              {msg.role === 'user' ? 'USER' : visionData.object_type}
            </div>
            <div className={`p-3 rounded inline-block ${
              msg.role === 'user' 
                ? 'bg-neon-blue/20 border border-neon-blue/30 text-white' 
                : 'bg-black/50 border border-neon-cyan/30 text-gray-200 shadow-[inset_0_0_10px_rgba(0,245,255,0.05)]'
            }`}>
               {msg.role === 'assistant' ? (
                 <span className="chromatic font-serif italic text-base leading-relaxed whitespace-pre-wrap">{msg.text}</span>
               ) : (
                 <span className="whitespace-pre-wrap">{msg.text}</span>
               )}
            </div>
          </div>
        ))}
        {(isTyping || isTranscribing) && (
           <div className="mr-auto text-left max-w-[85%]">
             <div className="text-[10px] mb-1 opacity-50 uppercase text-neon-cyan">
               {isTranscribing ? 'SYSTEM' : visionData.object_type}
             </div>
             <div className="p-3 rounded bg-black/50 border border-neon-cyan/30 text-gray-200">
               <span className="animate-pulse">
                 {isTranscribing ? '_TRANSCRIBING...' : '_PROCESSING...'}
               </span>
             </div>
           </div>
        )}
        <div ref={endOfChatRef} />
      </div>

      <form onSubmit={handleFormSubmit} className="p-4 bg-black/60 border-t border-neon-cyan/20">
        <div className="flex gap-2">
          <button
            type="button"
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            disabled={isTyping || isTranscribing}
            className={`px-3 py-2 font-mono text-sm border rounded transition-all select-none ${
              isRecording
                ? 'bg-neon-magenta/40 border-neon-magenta text-neon-magenta shadow-[0_0_10px_rgba(255,45,120,0.5)] animate-pulse'
                : 'bg-transparent border-neon-cyan/30 text-neon-cyan/60 hover:border-neon-magenta/50 hover:text-neon-magenta/80'
            } disabled:opacity-30 disabled:cursor-not-allowed`}
            title="Hold to speak"
          >
            {isRecording ? '●' : '🎙'}
          </button>

           <input 
             type="text" 
             value={inputVal}
             onChange={e => setInputVal(e.target.value)}
             className="flex-1 bg-transparent border border-neon-cyan/50 rounded px-3 py-2 font-mono text-sm text-white focus:outline-none focus:border-neon-cyan shadow-[inset_0_0_5px_rgba(0,245,255,0.1)] transition-colors placeholder-gray-600"
             placeholder={isRecording ? 'Recording...' : isTranscribing ? 'Transcribing...' : 'Type or hold 🎙 to speak...'}
             disabled={isRecording || isTranscribing}
             maxLength={250}
           />
           <button 
             type="submit" 
             disabled={isTyping || !inputVal.trim() || isRecording || isTranscribing}
             className="px-4 py-2 bg-neon-cyan/20 hover:bg-neon-cyan/40 text-neon-cyan font-mono text-sm border border-neon-cyan/50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase"
           >
             [Send]
           </button>
        </div>
        <div className="mt-2 text-[10px] font-mono text-gray-600 text-center">
          {isRecording ? '● RECORDING — release to send' : 'Hold 🎙 to speak · Type to transmit'}
        </div>
      </form>
    </div>
  );
}
