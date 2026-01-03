
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { Send, Dice3, MessageSquare } from 'lucide-react';

interface Props {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  currentUser: string;
}

export const Chat: React.FC<Props> = ({ messages, onSendMessage, currentUser }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  const getDieIcon = (val: number) => {
    if (val === 1) return <span className="text-green-400 font-black">+</span>;
    if (val === -1) return <span className="text-red-400 font-black">-</span>;
    return <span className="text-gray-500 font-black">0</span>;
  };

  return (
    <div className="flex flex-col h-full bg-[#0f1115] border-l border-[#3a4a63] w-full max-w-sm shrink-0">
      <div className="p-6 border-b border-[#3a4a63] bg-[#15171b] flex items-center gap-3">
        <MessageSquare size={20} className="text-[#4aa3ff]"/>
        <h3 className="font-black text-xs uppercase tracking-widest text-[#e6e9ef]">Лог событий</h3>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col animate-in fade-in slide-in-from-right-2 duration-300 ${msg.sender === currentUser ? 'items-end' : 'items-start'}`}>
            <span className="text-[9px] font-black text-[#9aa4b2] uppercase tracking-[0.1em] mb-1.5">{msg.sender}</span>
            <div className={`p-4 rounded-2xl max-w-[95%] text-sm shadow-xl ${
              msg.type === 'roll' 
                ? 'bg-[#1e2128] border-l-4 border-[#4aa3ff] w-full'
                : msg.sender === currentUser 
                  ? 'bg-[#4aa3ff] text-white rounded-tr-none' 
                  : 'bg-[#24272d] text-[#e6e9ef] rounded-tl-none border border-[#3a4a63]'
            }`}>
              {msg.type === 'roll' ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between opacity-70">
                    <span className="flex items-center gap-1.5 font-bold text-xs"><Dice3 size={12}/> {msg.rollData?.skillName || 'Бросок'}</span>
                    <span className="text-[10px]">Мод: {msg.rollData?.modifier}</span>
                  </div>
                  <div className="flex justify-center gap-2">
                    {msg.rollData?.dice.map((d, i) => (
                      <div key={i} className="w-8 h-8 flex items-center justify-center rounded-lg bg-black/40 border border-white/5 text-xl">
                        {getDieIcon(d)}
                      </div>
                    ))}
                  </div>
                  <div className="text-center text-3xl font-black pt-2 border-t border-white/5">
                    {msg.rollData?.total! >= 0 ? `+${msg.rollData?.total}` : msg.rollData?.total}
                  </div>
                </div>
              ) : (
                <p className="leading-relaxed">{msg.text}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 border-t border-[#3a4a63] bg-[#15171b]">
        <div className="flex gap-2 relative">
          <input 
            className="flex-1 bg-[#0f1115] border border-[#3a4a63] rounded-2xl px-5 py-3 text-sm outline-none focus:border-[#4aa3ff] transition-all pr-12"
            placeholder="Сообщение..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            className="absolute right-2 top-2 w-8 h-8 bg-[#4aa3ff] text-white rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
          >
            <Send size={14}/>
          </button>
        </div>
      </div>
    </div>
  );
};
