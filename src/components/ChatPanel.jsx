import { useState, useRef, useEffect } from 'react';

const LANG_TO_BCP47 = {
  'hindi': 'hi-IN', 'spanish': 'es-ES', 'french': 'fr-FR',
  'german': 'de-DE', 'italian': 'it-IT', 'portuguese': 'pt-BR',
  'japanese': 'ja-JP', 'korean': 'ko-KR', 'chinese': 'zh-CN',
  'arabic': 'ar-SA', 'russian': 'ru-RU', 'dutch': 'nl-NL',
  'polish': 'pl-PL', 'turkish': 'tr-TR', 'swedish': 'sv-SE',
};

function toBCP47(language) {
  if (!language) return null;
  return LANG_TO_BCP47[language.toLowerCase()] || language;
}

export default function ChatPanel({ visionData, sendMessage, transcribeAudio, initialMessages, onClose }) {
  const defaultMessages = [{ role: 'assistant', text: visionData.opening_line }];

  const [messages, setMessages] = useState(
    initialMessages && initialMessages.length > 0 ? initialMessages : defaultMessages
  );
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const endOfChatRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const currentAudioRef = useRef(null);
  const messagesRef = useRef(messages);
  const isMounted = useRef(true);

  useEffect(() => { messagesRef.current = messages; }, [messages]);

  const voice = visionData.voice || 'diana';
  const vocalDirection = visionData.vocal_direction || null;

  useEffect(() => {
    endOfChatRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    isMounted.current = true;
    const isResuming = initialMessages && initialMessages.length > 0;
    if (!isResuming && visionData.opening_line) {
      speakReply(visionData.opening_line, 'english');
    }
    return () => {
      isMounted.current = false;
      stopAudio();
    };
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
    onClose(messagesRef.current);
  };

  const handleSend = async (messageText) => {
    const text = messageText || inputVal;
    if (!text.trim() || isTyping) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInputVal('');
    setIsTyping(true);
    const result = await sendMessage(text);
    if (!isMounted.current) return;
    if (result) {
      const replyText = result.text || result;
      const replyLang = result.language || 'english';
      setMessages(prev => [...prev, { role: 'assistant', text: replyText }]);
      speakReply(replyText, replyLang);
    } else {
      setMessages(prev => [...prev, { role: 'assistant', text: '[CONNECTION LOST... UNABLE TO RESPOND]' }]);
    }
    setIsTyping(false);
  };

  const speakReply = async (text, language = 'english') => {
    stopAudio();
    const isEnglish = !language || language === 'english' || language === 'en';
    if (isEnglish) {
      try {
        const response = await fetch('/api/speak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, voice, vocal_direction: vocalDirection })
        });
        if (!isMounted.current) return;
        if (response.ok) {
          const audioBlob = await response.blob();
          if (!isMounted.current) return;
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
    }
    if (!isMounted.current) return;
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      const langTag = isEnglish ? 'en-US' : toBCP47(language);
      if (langTag) utterance.lang = langTag;
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
        if (transcript && transcript.trim()) handleSend(transcript.trim());
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
    // Reduced margin on mobile (m-2) so panel has more room, sm:m-6 on larger
    <div className="absolute inset-0 m-2 sm:m-6 panel-bg border border-neon-cyan/50 flex flex-col pointer-events-auto shadow-[0_0_15px_rgba(0,245,255,0.1)] rounded overflow-hidden">

      {/* Header — min-w-0 + truncate on object name ensures Terminate always visible */}
      <div className="bg-neon-cyan/10 border-b border-neon-cyan/30 px-3 py-3 flex items-center gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse flex-none"></div>
          <span className="font-mono text-xs tracking-wider uppercase text-neon-cyan font-bold truncate">
            LINK: {visionData.object_type}
          </span>
        </div>
        {/* Terminate — flex-none so it never gets squeezed off screen */}
        <button
          onClick={handleClose}
          className="flex-none text-gray-400 hover:text-neon-magenta transition-colors font-mono text-xs uppercase px-2 py-1 border border-gray-600/40 hover:border-neon-magenta/50 rounded"
        >
          ✕ END
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4 font-mono text-sm custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`max-w-[88%] ${msg.role === 'user' ? 'ml-auto text-right' : 'mr-auto text-left'}`}>
            <div className={`text-[10px] mb-1 opacity-50 uppercase ${msg.role === 'user' ? 'text-neon-blue' : 'text-neon-cyan'}`}>
              {msg.role === 'user' ? 'YOU' : visionData.object_type}
            </div>
            <div className={`p-3 rounded inline-block ${
              msg.role === 'user'
                ? 'bg-neon-blue/20 border border-neon-blue/30 text-white'
                : 'bg-black/50 border border-neon-cyan/30 text-gray-200 shadow-[inset_0_0_10px_rgba(0,245,255,0.05)]'
            }`}>
              {msg.role === 'assistant'
                ? <span className="chromatic font-serif italic text-base leading-relaxed whitespace-pre-wrap">{msg.text}</span>
                : <span className="whitespace-pre-wrap">{msg.text}</span>
              }
            </div>
          </div>
        ))}
        {(isTyping || isTranscribing) && (
          <div className="mr-auto text-left max-w-[88%]">
            <div className="text-[10px] mb-1 opacity-50 uppercase text-neon-cyan">
              {isTranscribing ? 'SYSTEM' : visionData.object_type}
            </div>
            <div className="p-3 rounded bg-black/50 border border-neon-cyan/30 text-gray-200">
              <span className="animate-pulse">{isTranscribing ? '_TRANSCRIBING...' : '_PROCESSING...'}</span>
            </div>
          </div>
        )}
        <div ref={endOfChatRef} />
      </div>

      <div className="p-3 bg-black/60 border-t border-neon-cyan/20 space-y-2">
        <button
          type="button"
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onTouchStart={(e) => { e.preventDefault(); startRecording(); }}
          onTouchEnd={stopRecording}
          disabled={isTyping || isTranscribing}
          className={`w-full py-3 font-mono text-sm tracking-widest uppercase transition-all duration-150 select-none rounded ${
            isRecording
              ? 'bg-neon-magenta/20 border border-neon-magenta text-neon-magenta shadow-[0_0_20px_rgba(255,0,200,0.3)] animate-pulse'
              : isTranscribing
              ? 'bg-neon-cyan/10 border border-neon-cyan/40 text-neon-cyan/60 cursor-wait'
              : 'bg-transparent border border-neon-magenta/40 text-neon-magenta/70 hover:bg-neon-magenta/10 hover:border-neon-magenta hover:text-neon-magenta hover:shadow-[0_0_15px_rgba(255,0,200,0.2)]'
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {isRecording ? '● RECORDING — release to send' : isTranscribing ? '⟳ TRANSCRIBING...' : '🎙 HOLD TO SPEAK'}
        </button>

        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
          <input
            type="text"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            className="flex-1 bg-transparent border border-neon-cyan/50 rounded px-3 py-2 font-mono text-sm text-white focus:outline-none focus:border-neon-cyan shadow-[inset_0_0_5px_rgba(0,245,255,0.1)] transition-colors placeholder-gray-600 min-w-0"
            placeholder="Or type a message..."
            disabled={isRecording || isTranscribing}
            maxLength={250}
          />
          <button
            type="submit"
            disabled={isTyping || !inputVal.trim() || isRecording || isTranscribing}
            className="flex-none px-3 py-2 bg-neon-cyan/20 hover:bg-neon-cyan/40 text-neon-cyan font-mono text-sm border border-neon-cyan/50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase"
          >
            [Send]
          </button>
        </form>
      </div>
    </div>
  );
}
