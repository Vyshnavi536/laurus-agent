import { User, Bot, Trash2 } from 'lucide-react';
import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

export default function ChatBox({ messages, isTyping, onDeleteChat, onSendMessage }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 sm:space-y-8 bg-transparent relative z-10 scroll-smooth">
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-slate-500 animate-in fade-in zoom-in duration-1000 px-4 text-center">
          <div className="relative mb-4 sm:mb-6">
             <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full animate-pulse" />
             <Bot size={60} className="relative text-blue-500 sm:w-[80px] sm:h-[80px]" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-white font-display">How can I assist you?</h3>
          <p className="mt-3 sm:mt-4 text-center max-w-lg text-slate-400 text-base sm:text-lg leading-relaxed">
            I'm your dedicated pharmaceutical intelligence agent. Ask about drugs, dosages, or complex interactions.
          </p>
          <div className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full max-w-2xl">
             <div 
                onClick={() => onSendMessage("What are the side effects of Metformin?")}
                className="glass-card p-3 sm:p-4 rounded-xl sm:rounded-2xl cursor-pointer hover:bg-white/5 transition-all text-[13px] sm:text-sm text-slate-300 border border-white/5 group"
             >
                "What are the side effects of Metformin?"
             </div>
             <div 
                onClick={() => onSendMessage("Interaction between Warfarin and Aspirin")}
                className="glass-card p-3 sm:p-4 rounded-xl sm:rounded-2xl cursor-pointer hover:bg-white/5 transition-all text-[13px] sm:text-sm text-slate-300 border border-white/5 group"
             >
                "Interaction between Warfarin and Aspirin"
             </div>
          </div>
        </div>
      ) : (
        messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 sm:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'ai' && (
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-blue-600/10 flex items-center justify-center shrink-0 border border-blue-500/20 shadow-lg shadow-blue-500/5">
                <Bot size={18} className="text-blue-400 sm:w-[22px] sm:h-[22px]" />
              </div>
            )}
            
            <div className={`group relative max-w-[85%] sm:max-w-[75%] rounded-[18px] sm:rounded-[24px] px-4 py-3 sm:px-6 sm:py-5 shadow-2xl ${
              msg.sender === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none shadow-blue-600/10' 
                : 'glass-card text-slate-200 rounded-bl-none'
            }`}>
              <div className="font-sans leading-relaxed text-[14px] sm:text-[16px] prose prose-invert max-w-none">
                {msg.sender === 'ai' ? (
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                ) : (
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                )}
              </div>
              
              <button 
                onClick={() => onDeleteChat(msg.id)}
                className={`absolute top-1 ${msg.sender === 'user' ? '-left-7' : '-right-7'} opacity-0 group-hover:opacity-100 p-2 text-slate-600 hover:text-red-400 transition-all`}
                title="Delete message"
              >
                <Trash2 size={12} />
              </button>
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                <User size={18} className="text-slate-400 sm:w-[22px] sm:h-[22px]" />
              </div>
            )}
          </div>
        ))
      )}
      
      {isTyping && (
        <div className="flex gap-3 sm:gap-6 justify-start animate-in fade-in duration-300">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-blue-600/10 flex items-center justify-center shrink-0 border border-blue-500/20">
            <Bot size={18} className="text-blue-400 sm:w-[22px] sm:h-[22px]" />
          </div>
          <div className="glass-card rounded-[18px] sm:rounded-[24px] rounded-bl-none px-4 py-3 sm:px-6 sm:py-5 shadow-sm flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      )}
    </div>
  );
}
