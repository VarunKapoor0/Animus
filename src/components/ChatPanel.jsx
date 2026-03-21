import { useState, useRef, useEffect } from 'react';
import GlitchText from './GlitchText';

export default function ChatPanel({ visionData, sendMessage, onClose }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: visionData.opening_line }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endOfChatRef = useRef(null);

  useEffect(() => {
    endOfChatRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputVal.trim() || isTyping) return;

    const userMessage = inputVal;
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInputVal('');
    setIsTyping(true);

    const reply = await sendMessage(userMessage);

    if (reply) {
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } else {
      setMessages(prev => [...prev, { role: 'assistant', text: '[CONNECTION LOST... UNABLE TO RESPOND]' }]);
    }
    setIsTyping(false);
  };

  return (
    <div className="absolute inset-0 m-4 sm:m-8 panel-bg border border-neon-cyan/50 flex flex-col pointer-events-auto shadow-[0_0_15px_rgba(0,245,255,0.1)] rounded overflow-hidden">
      {/* Header */}
      <div className="bg-neon-cyan/10 border-b border-neon-cyan/30 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse"></div>
          <span className="font-mono text-sm tracking-wider uppercase text-neon-cyan font-bold">
             LINK: {visionData.object_type}
          </span>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-neon-magenta transition-colors font-mono text-sm uppercase px-2 py-1"
        >
          [Terminate]
        </button>
      </div>

      {/* Messages */}
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
        {isTyping && (
           <div className="mr-auto text-left max-w-[85%]">
             <div className="text-[10px] mb-1 opacity-50 uppercase text-neon-cyan">{visionData.object_type}</div>
             <div className="p-3 rounded bg-black/50 border border-neon-cyan/30 text-gray-200">
               <span className="animate-pulse">_PROCESSING...</span>
             </div>
           </div>
        )}
        <div ref={endOfChatRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 bg-black/60 border-t border-neon-cyan/20">
        <div className="flex gap-2">
           <input 
             type="text" 
             value={inputVal}
             onChange={e => setInputVal(e.target.value)}
             className="flex-1 bg-transparent border border-neon-cyan/50 rounded px-3 py-2 font-mono text-sm text-white focus:outline-none focus:border-neon-cyan shadow-[inset_0_0_5px_rgba(0,245,255,0.1)] transition-colors placeholder-gray-600"
             placeholder="Transmit message..."
             maxLength={250}
           />
           <button 
             type="submit" 
             disabled={isTyping || !inputVal.trim()}
             className="px-4 py-2 bg-neon-cyan/20 hover:bg-neon-cyan/40 text-neon-cyan font-mono text-sm border border-neon-cyan/50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase"
           >
             [Send]
           </button>
        </div>
      </form>
    </div>
  );
}
