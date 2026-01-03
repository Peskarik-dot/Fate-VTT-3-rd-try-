
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types.ts';
import { COLORS } from '../constants.tsx';
import { Send, Hash, Dice3 } from 'lucide-react';

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

  const formatDie = (val: number) => {
    if (val === 1) return '+';
    if (val === -1) return '-';
    return '0';
  };

  return (
    <div className="flex flex-col h-full bg-[#1b1d21] border-l border-[#3a4a63] w-full max-w-sm">
      <div className="p-4 border-b border-[#3a4a63] flex items-center gap-2">
        <Hash size={20} className="text-[#4aa3ff]"/>
        <h3 className="font-bold text-[#e6e9ef]">Игровой чат</h3>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === currentUser ? 'items-end' : 'items-start'}`}>
            <span className="text-[10px] text-[#9aa4b2] font-bold uppercase mb-1">{msg.sender}</span>
            <div className={`p-3 rounded-2xl max-w-[90%] text-sm shadow-sm ${
              msg.type === 'roll' 
                ? 'bg-gradient-to-br from-[#2f6fa3] to-[#1b1d21] border border-[#4aa3ff]/30 w-full'
                : msg.sender === currentUser 
                  ? 'bg-[#4aa3ff] text-white rounded-tr-none' 
                  : 'bg-[#24272d] text-[#e6e9ef] rounded-tl-none border border-[#3a4a63]'
            }`}>
              {msg.type === 'roll' ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 font-bold"><Dice3 size={14}/> Бросок FATE</span>
                    <span className="text-xs opacity-70">Мод: {msg.rollData?.modifier}</span>
                  </div>
                  <div className="flex justify-center gap-1">
                    {msg.rollData?.dice.map((d, i) => (
                      <span key={i} className={`w-6 h-6 flex items-center justify-center rounded bg-black/40 font-bold ${d > 0 ? 'text-green-400' : d < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                        {formatDie(d)}
                      </span>
                    ))}
                  </div>
                  <div className="text-center text-2xl font-black pt-1 border-t border-white/10">
                    Итог: {msg.rollData?.total! >= 0 ? `+${msg.rollData?.total}` : msg.rollData?.total}
                  </div>
                </div>
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-[#3a4a63] bg-[#24272d]">
        <div className="flex gap-2">
          <input 
            className="flex-1 bg-[#15181d] border border-[#3a4a63] rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#4aa3ff]"
            placeholder="Напишите сообщение..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            className="w-10 h-10 bg-[#4aa3ff] text-white rounded-xl flex items-center justify-center hover:brightness-110 active:scale-90 transition-all shadow-md shadow-[#4aa3ff]/20"
          >
            <Send size={18}/>
          </button>
        </div>
      </div>
    </div>
  );
};
