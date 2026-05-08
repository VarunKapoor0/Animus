import { useState, useRef, useEffect, useCallback } from 'react';
import useAudio from '../hooks/useAudio';
import useRecording from '../hooks/useRecording';

export default function ChatPanel({ visionData, sendMessage, transcribeAudio, initialMessages, onClose }) {
  const defaultMessages = [{ role: 'assistant', text: visionData.opening_line }];
  const [messages, setMessages] = useState(
    initialMessages && initialMessages.length > 0 ? initialMessages : defaultMessages
  );
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endOfChatRef = useRef(null);
  const messagesRef = useRef(messages);
  const isMounted = useRef(true);

  useEffect(() => { messagesRef.current = messages; }, [messages]);

  const voice = visionData.voice || 'diana';
  const vocalDirection = visionData.vocal_direction || null;

  const { speakReply, stopAudio } = useAudio(isMounted);

  const handleSend = useCallback(async (messageText) => {
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
      speakReply(replyText, replyLang, voice, vocalDirection);
    } else {
      setMessages(prev => [...prev, { role: 'assistant', text: '[CONNECTION LOST... UNABLE TO RESPOND]' }]);
    }
    setIsTyping(false);
  }, [inputVal, isTyping, sendMessage, speakReply, voice, vocalDirection]);

  const { isRecording, isTranscribing, startRecording, stopRecording } = useRecording(
    transcribeAudio,
    (transcript) => handleSend(transcript)
  );

  useEffect(() => {
    endOfChatRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    isMounted.current = true;
    const isResuming = initialMessages && initialMessages.length > 0;
    if (!isResuming && visionData.opening_line) {
      speakReply(visionData.opening_line, 'english', voice, vocalDirection);
    }
    return () => { isMounted.current = false; stopAudio(); };
  }, []);

  const handleClose = () => { stopAudio(); onClose(messagesRef.current); };

  return (
    <div
      className="fixed inset-x-0 bottom-0 top-0 flex items-stretch justify-center pointer-events-none"
      style={{ zIndex: 30 }}
    >
      <div
        className="pointer-events-auto w-full max-w-2xl mx-auto my-2 sm:my-6 md:my-10 panel-bg border border-neon-cyan/50 flex flex-col shadow-[0_0_15px_rgba(0,245,255,0.1)] rounded overflow-hidden"
        style={{ maxHeight: 'calc(100dvh - 16px)' }}
      >
        <div className="flex-none bg-neon-cyan/10 border-b border-neon-cyan/30 px-3 py-2 flex items-center gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse flex-none" />
            <span className="font-mono text-xs tracking-wider uppercase text-neon-cyan font-bold truncate">
              LINK: {visionData.object_type}
            </span>
          </div>
          <button
            onClick={handleClose}
            className="flex-none px-3 py-1.5 font-mono text-xs uppercase text-neon-magenta border border-neon-magenta/50 hover:bg-neon-magenta/10 rounded transition-colors whitespace-nowrap"
          >
            ✕ END
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3 font-mono text-sm">
          {messages.map((msg, i) => (
            <div key={i} className={`max-w-[88%] ${msg.role === 'user' ? 'ml-auto text-right' : 'mr-auto text-left'}`}>
              <div className={`text-[10px] mb-1 opacity-50 uppercase ${msg.role === 'user' ? 'text-neon-blue' : 'text-neon-cyan'}`}>
                {msg.role === 'user' ? 'YOU' : visionData.object_type}
              </div>
              <div className={`p-2 rounded inline-block ${
                msg.role === 'user'
                  ? 'bg-neon-blue/20 border border-neon-blue/30 text-white'
                  : 'bg-black/50 border border-neon-cyan/30 text-gray-200'
              }`}>
                {msg.role === 'assistant'
                  ? <span className="chromatic font-serif italic text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</span>
                  : <span className="whitespace-pre-wrap text-sm">{msg.text}</span>
                }
              </div>
            </div>
          ))}
          {(isTyping || isTranscribing) && (
            <div className="mr-auto text-left max-w-[88%]">
              <div className="text-[10px] mb-1 opacity-50 uppercase text-neon-cyan">
                {isTranscribing ? 'SYSTEM' : visionData.object_type}
              </div>
              <div className="p-2 rounded bg-black/50 border border-neon-cyan/30 text-gray-200">
                <span className="animate-pulse">{isTranscribing ? '_TRANSCRIBING...' : '_PROCESSING...'}</span>
              </div>
            </div>
          )}
          <div ref={endOfChatRef} />
        </div>

        <div className="flex-none p-2 bg-black/60 border-t border-neon-cyan/20 space-y-2">
          <button
            type="button"
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onTouchStart={(e) => { e.preventDefault(); startRecording(); }}
            onTouchEnd={stopRecording}
            disabled={isTyping || isTranscribing}
            className={`w-full py-2.5 font-mono text-xs tracking-widest uppercase transition-all select-none rounded ${
              isRecording
                ? 'bg-neon-magenta/20 border border-neon-magenta text-neon-magenta animate-pulse'
                : isTranscribing
                ? 'bg-neon-cyan/10 border border-neon-cyan/40 text-neon-cyan/60 cursor-wait'
                : 'bg-transparent border border-neon-magenta/40 text-neon-magenta/70 hover:bg-neon-magenta/10 hover:border-neon-magenta hover:text-neon-magenta'
            } disabled:opacity-40`}
          >
            {isRecording ? '● RECORDING — release to send' : isTranscribing ? '⟳ TRANSCRIBING...' : '🎙 HOLD TO SPEAK'}
          </button>
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
            <input
              type="text"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              className="flex-1 min-w-0 bg-transparent border border-neon-cyan/50 rounded px-3 py-2 font-mono text-sm text-white focus:outline-none focus:border-neon-cyan placeholder-gray-600"
              placeholder="Or type a message..."
              disabled={isRecording || isTranscribing}
              maxLength={250}
            />
            <button
              type="submit"
              disabled={isTyping || !inputVal.trim() || isRecording || isTranscribing}
              className="flex-none px-3 py-2 bg-neon-cyan/20 hover:bg-neon-cyan/40 text-neon-cyan font-mono text-sm border border-neon-cyan/50 rounded transition-colors disabled:opacity-50 uppercase"
            >
              [Send]
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
