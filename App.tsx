
import React, { useState, useEffect, useCallback } from 'react';
import { RoomState, FateCharacter, ChatMessage, Role } from './types.ts';
import { INITIAL_CHARACTER } from './constants.tsx';
import { CharacterSheet } from './components/CharacterSheet.tsx';
import { Chat } from './components/Chat.tsx';
import { Shield, User, LogOut, PlusCircle, Users, Trash2 } from 'lucide-react';

// Обновили версию ключа для GitHub Pages
const LOCAL_STORAGE_KEY = 'fate_tabletop_gh_v1';

const App: React.FC = () => {
  const [view, setView] = useState<'LOGIN' | 'TABLE'>('LOGIN');
  const [room, setRoom] = useState<RoomState | null>(null);
  const [activeTab, setActiveTab] = useState<'MY_SHEET' | 'GM_TOOLS'>('MY_SHEET');
  
  // Функция для безопасного копирования начальных данных (чтобы не было общих ссылок)
  const createNewCharacter = (overrides = {}): FateCharacter => {
    return {
      ...JSON.parse(JSON.stringify(INITIAL_CHARACTER)),
      ...overrides
    };
  };

  // Загрузка состояния
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.roomName) {
          setRoom(parsed);
          setView('TABLE');
        }
      } catch (e) {
        console.error("Failed to load save", e);
      }
    }
  }, []);

  // Сохранение состояния
  useEffect(() => {
    if (room) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(room));
    }
  }, [room]);

  const handleCreateRoom = useCallback((roomName: string) => {
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const initialState: RoomState = {
      roomName,
      inviteCode,
      myRole: 'GM',
      myName: 'Master',
      players: [],
      npcs: [createNewCharacter({ id: 'npc_1', name: 'Безымянный NPC', isNPC: true })],
      messages: [{ id: '1', sender: 'System', text: `Комната "${roomName}" создана. Код: ${inviteCode}`, timestamp: Date.now(), type: 'message' }]
    };
    setRoom(initialState);
    setView('TABLE');
    setActiveTab('GM_TOOLS');
  }, []);

  const handleJoinRoom = useCallback((name: string, code: string) => {
    const initialState: RoomState = {
      roomName: 'Игровая комната',
      inviteCode: code,
      myRole: 'PLAYER',
      myName: name,
      players: [createNewCharacter({ id: 'player_me', name: name })],
      npcs: [],
      messages: [{ id: '1', sender: 'System', text: `${name} присоединился к игре.`, timestamp: Date.now(), type: 'message' }]
    };
    setRoom(initialState);
    setView('TABLE');
    setActiveTab('MY_SHEET');
  }, []);

  const handleSendMessage = useCallback((text: string) => {
    setRoom(prev => {
      if (!prev) return null;
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: prev.myName,
        text,
        timestamp: Date.now(),
        type: 'message'
      };
      return { ...prev, messages: [...prev.messages, newMessage] };
    });
  }, []);

  const handleRoll = useCallback((modifier: number) => {
    setRoom(prev => {
      if (!prev) return null;
      const dice = Array.from({ length: 4 }).map(() => Math.floor(Math.random() * 3) - 1);
      const sum = dice.reduce((a, b) => a + b, 0);
      const total = sum + modifier;

      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: prev.myName,
        text: `бросил 4df`,
        timestamp: Date.now(),
        type: 'roll',
        rollData: { dice, modifier, total }
      };
      return { ...prev, messages: [...prev.messages, newMessage] };
    });
  }, []);

  const updateCharacter = useCallback((id: string, updated: FateCharacter) => {
    setRoom(prev => {
      if (!prev) return null;
      if (prev.myRole === 'PLAYER') {
        const players = prev.players.map(p => p.id === id ? updated : p);
        return { ...prev, players };
      } else {
        const npcs = prev.npcs.map(n => n.id === id ? updated : n);
        return { ...prev, npcs };
      }
    });
  }, []);

  const handleLogout = useCallback(() => {
    if (window.confirm("Выйти в меню? Прогресс останется в памяти браузера.")) {
      setRoom(null);
      setView('LOGIN');
      setActiveTab('MY_SHEET');
    }
  }, []);

  if (view === 'LOGIN') {
    return <LoginView onCreate={handleCreateRoom} onJoin={handleJoinRoom} />;
  }

  return (
    <div className="flex h-screen w-screen bg-[#15171b] text-[#e6e9ef] overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-[#3a4a63] bg-[#1b1d21] flex items-center justify-between px-6 shrink-0 shadow-xl relative z-50">
          <div className="flex items-center gap-4">
            <h1 className="font-black text-xl text-[#4aa3ff] tracking-tight">{room?.roomName}</h1>
            <div className="px-3 py-1 bg-[#24272d] border border-[#3a4a63] rounded-full text-xs font-bold text-[#9aa4b2]">
              КОД: {room?.inviteCode}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setActiveTab('MY_SHEET')} 
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'MY_SHEET' ? 'bg-[#4aa3ff] text-white' : 'hover:bg-[#3a4a63]'}`}
            >
              <User size={16}/> {room?.myRole === 'GM' ? 'Мастер-лист' : 'Мой персонаж'}
            </button>
            {room?.myRole === 'GM' && (
              <button 
                onClick={() => setActiveTab('GM_TOOLS')} 
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'GM_TOOLS' ? 'bg-[#4aa3ff] text-white' : 'hover:bg-[#3a4a63]'}`}
              >
                <Shield size={16}/> NPC & Мир
              </button>
            )}
            <div className="w-px h-6 bg-[#3a4a63] mx-2"></div>
            <button 
              onClick={handleLogout} 
              className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-all cursor-pointer"
              title="Выйти"
            >
              <LogOut size={20}/>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 relative z-10">
          {activeTab === 'MY_SHEET' && room && (room.myRole === 'PLAYER' ? room.players[0] : room.npcs[0]) && (
            <CharacterSheet 
              character={room.myRole === 'PLAYER' ? room.players[0] : room.npcs[0]} 
              onChange={(updated) => updateCharacter(updated.id, updated)} 
              onRoll={handleRoll}
              isGMView={room.myRole === 'GM'}
            />
          )}

          {activeTab === 'GM_TOOLS' && room && (
            <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full pb-20">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-[#4aa3ff]">Список NPC</h2>
                <button 
                  onClick={() => setRoom(prev => prev ? ({...prev, npcs: [...prev.npcs, createNewCharacter({ id: `npc_${Date.now()}`, name: 'Новый NPC', isNPC: true })]}) : null)}
                  className="bg-[#28a745] hover:bg-[#218838] px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shadow-md"
                >
                  <PlusCircle size={20}/> Добавить NPC
                </button>
              </div>
              <div className="flex flex-col gap-12">
                {room.npcs.map((npc) => (
                  <div key={npc.id} className="relative">
                     <div className="absolute top-4 right-4 z-10">
                        <button 
                          onClick={() => setRoom(prev => prev ? ({...prev, npcs: prev.npcs.filter(n => n.id !== npc.id)}) : null)}
                          className="bg-red-500/20 text-red-400 p-2 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                        >
                          <Trash2 size={20}/>
                        </button>
                     </div>
                     <CharacterSheet 
                        character={npc} 
                        onChange={(updated) => updateCharacter(updated.id, updated)} 
                        onRoll={handleRoll}
                        isGMView={true}
                      />
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      <Chat 
        messages={room?.messages || []} 
        onSendMessage={handleSendMessage} 
        currentUser={room?.myName || ''} 
      />
    </div>
  );
};

const LoginView: React.FC<{ onCreate: (name: string) => void, onJoin: (name: string, code: string) => void }> = ({ onCreate, onJoin }) => {
  const [mode, setMode] = useState<'CHOICE' | 'CREATE' | 'JOIN'>('CHOICE');
  const [roomName, setRoomName] = useState('');
  const [userName, setUserName] = useState('');
  const [code, setCode] = useState('');

  return (
    <div className="h-screen w-screen flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top,_#20242b,_#15171b)]">
      <div className="w-full max-w-md bg-[#24272d] border border-[#3a4a63] rounded-3xl p-8 shadow-2xl flex flex-col gap-8">
        <div className="text-center">
          <h1 className="text-4xl font-black text-[#4aa3ff] mb-2 tracking-tight">FATE TABLE</h1>
          <p className="text-[#9aa4b2] text-sm font-medium">Интерактивный стол для ваших приключений</p>
        </div>

        {mode === 'CHOICE' && (
          <div className="flex flex-col gap-4">
            <button onClick={() => setMode('CREATE')} className="group flex items-center justify-between p-6 bg-[#1b1d21] border border-[#3a4a63] rounded-2xl hover:border-[#4aa3ff] hover:bg-[#1f2228] transition-all">
              <div className="text-left">
                <span className="block text-lg font-bold mb-1">Стать Мастером</span>
                <span className="text-xs text-[#9aa4b2]">Создать комнату и получить код</span>
              </div>
              <Shield className="text-[#4aa3ff]" size={32}/>
            </button>
            <button onClick={() => setMode('JOIN')} className="group flex items-center justify-between p-6 bg-[#1b1d21] border border-[#3a4a63] rounded-2xl hover:border-[#4aa3ff] hover:bg-[#1f2228] transition-all">
              <div className="text-left">
                <span className="block text-lg font-bold mb-1">Присоединиться</span>
                <span className="text-xs text-[#9aa4b2]">Войти как игрок по коду</span>
              </div>
              <Users className="text-[#4aa3ff]" size={32}/>
            </button>
          </div>
        )}

        {mode === 'CREATE' && (
          <div className="flex flex-col gap-6">
            <div>
              <label className="block text-xs font-bold text-[#9aa4b2] uppercase mb-2">Название комнаты</label>
              <input autoFocus className="w-full bg-[#15181d] border border-[#3a4a63] rounded-xl p-4 focus:outline-none focus:border-[#4aa3ff]" placeholder="Напр: Хроники Акаши" value={roomName} onChange={(e) => setRoomName(e.target.value)}/>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setMode('CHOICE')} className="flex-1 py-4 text-[#9aa4b2] font-bold">Назад</button>
              <button onClick={() => roomName && onCreate(roomName)} className="flex-[2] py-4 bg-[#4aa3ff] text-white rounded-xl font-bold hover:brightness-110 active:scale-95 transition-all">Создать</button>
            </div>
          </div>
        )}

        {mode === 'JOIN' && (
          <div className="flex flex-col gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#9aa4b2] uppercase mb-2">Ваше имя</label>
                <input autoFocus className="w-full bg-[#15181d] border border-[#3a4a63] rounded-xl p-4 focus:outline-none focus:border-[#4aa3ff]" placeholder="Напр: Арагорн" value={userName} onChange={(e) => setUserName(e.target.value)}/>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#9aa4b2] uppercase mb-2">Код приглашения</label>
                <input className="w-full bg-[#15181d] border border-[#3a4a63] rounded-xl p-4 font-mono text-center tracking-widest uppercase focus:outline-none focus:border-[#4aa3ff]" placeholder="XXXXXX" value={code} onChange={(e) => setCode(e.target.value)}/>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setMode('CHOICE')} className="flex-1 py-4 text-[#9aa4b2] font-bold">Назад</button>
              <button onClick={() => userName && code && onJoin(userName, code)} className="flex-[2] py-4 bg-[#4aa3ff] text-white rounded-xl font-bold hover:brightness-110 active:scale-95 transition-all">Войти</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
