
import React, { useState, useEffect } from 'react';
import { RoomState, FateCharacter, ChatMessage } from './types';
import { createDefaultCharacter } from './constants';
import { CharacterSheet } from './components/CharacterSheet';
import { Chat } from './components/Chat';
// Fixed: Added Dice5 to the lucide-react imports
import { Shield, User, LogOut, PlusCircle, Trash2, Users, Dice5 } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'fate_table_data_v2';

const App: React.FC = () => {
  const [view, setView] = useState<'LOGIN' | 'TABLE'>('LOGIN');
  const [room, setRoom] = useState<RoomState | null>(null);
  const [activeTab, setActiveTab] = useState<'MY_SHEET' | 'NPC_TOOLS' | 'MEMBERS'>('MY_SHEET');
  
  // Persist State
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setRoom(parsed);
        setView('TABLE');
      } catch (e) { console.error("Save load failed", e); }
    }
  }, []);

  useEffect(() => {
    if (room) localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(room));
  }, [room]);

  const handleCreateRoom = (roomName: string) => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const gmMain = createDefaultCharacter('gm_main', 'Гейм-мастер', false);
    gmMain.isGMMain = true;
    
    setRoom({
      roomName,
      inviteCode: code,
      myRole: 'GM',
      myName: 'Master',
      characters: [gmMain],
      messages: [{ id: '1', sender: 'System', text: `Стол "${roomName}" развернут. Код: ${code}`, timestamp: Date.now(), type: 'message' }]
    });
    setView('TABLE');
  };

  const handleJoinRoom = (name: string, code: string) => {
    const playerChar = createDefaultCharacter('player_self', name, false);
    setRoom({
      roomName: 'Игровой стол',
      inviteCode: code,
      myRole: 'PLAYER',
      myName: name,
      characters: [playerChar],
      messages: [{ id: '1', sender: 'System', text: `${name} за столом.`, timestamp: Date.now(), type: 'message' }]
    });
    setView('TABLE');
  };

  const onSendMessage = (text: string) => {
    if (!room) return;
    setRoom({ ...room, messages: [...room.messages, { id: Date.now().toString(), sender: room.myName, text, timestamp: Date.now(), type: 'message' }] });
  };

  const onRoll = (modifier: number, skillName?: string) => {
    if (!room) return;
    const dice = Array.from({ length: 4 }).map(() => Math.floor(Math.random() * 3) - 1);
    const total = dice.reduce((a, b) => a + b, 0) + modifier;
    setRoom({ ...room, messages: [...room.messages, { id: Date.now().toString(), sender: room.myName, text: '', timestamp: Date.now(), type: 'roll', rollData: { dice, modifier, total, skillName } }] });
  };

  const updateCharacter = (id: string, updated: FateCharacter) => {
    if (!room) return;
    setRoom({ ...room, characters: room.characters.map(c => c.id === id ? updated : c) });
  };

  const addNPC = () => {
    if (!room) return;
    const npc = createDefaultCharacter(`npc_${Date.now()}`, 'Новый NPC', true);
    setRoom({ ...room, characters: [...room.characters, npc] });
  };

  const deleteNPC = (id: string) => {
    if (!room) return;
    setRoom({ ...room, characters: room.characters.filter(c => c.id !== id) });
  };

  if (view === 'LOGIN') return <LoginView onCreate={handleCreateRoom} onJoin={handleJoinRoom} />;

  const myMainSheet = room?.characters.find(c => c.id === (room.myRole === 'GM' ? 'gm_main' : 'player_self'));
  const npcs = room?.characters.filter(c => c.isNPC) || [];

  return (
    <div className="flex h-screen w-screen bg-[#0f1115] text-[#e6e9ef] overflow-hidden font-sans selection:bg-[#4aa3ff]/30">
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-[#3a4a63] bg-[#15171b] flex items-center justify-between px-8 shrink-0 z-10 shadow-lg">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-[#4aa3ff] uppercase tracking-[0.2em]">{room?.myRole === 'GM' ? 'МАСТЕР-ПАНЕЛЬ' : 'СТОЛ ИГРОКА'}</span>
              <h1 className="font-black text-2xl tracking-tight leading-none">{room?.roomName}</h1>
            </div>
            <div className="px-4 py-1.5 bg-[#1e2128] border border-[#3a4a63] rounded-full text-xs font-black text-[#9aa4b2] flex items-center gap-2">
              <span className="opacity-50 tracking-widest">КОД:</span> {room?.inviteCode}
            </div>
          </div>
          
          <nav className="flex items-center gap-2">
            <button 
              onClick={() => setActiveTab('MY_SHEET')} 
              className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'MY_SHEET' ? 'bg-[#4aa3ff] text-white shadow-lg shadow-[#4aa3ff]/20' : 'text-[#9aa4b2] hover:bg-[#1e2128]'}`}
            >
              <User size={14}/> {room?.myRole === 'GM' ? 'Мой Лист' : 'Лист'}
            </button>
            {room?.myRole === 'GM' && (
              <button 
                onClick={() => setActiveTab('NPC_TOOLS')} 
                className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'NPC_TOOLS' ? 'bg-[#4aa3ff] text-white shadow-lg shadow-[#4aa3ff]/20' : 'text-[#9aa4b2] hover:bg-[#1e2128]'}`}
              >
                <Shield size={14}/> NPC & Мир
              </button>
            )}
            <button 
              onClick={() => { if(confirm("Выйти? Все данные хранятся локально.")) { localStorage.removeItem(LOCAL_STORAGE_KEY); setView('LOGIN'); } }}
              className="p-3 text-red-400 hover:bg-red-400/10 rounded-2xl transition-all"
            >
              <LogOut size={20}/>
            </button>
          </nav>
        </header>

        <main className="flex-1 overflow-y-auto p-10 bg-[radial-gradient(circle_at_center,_#15171b_0%,_#0f1115_100%)]">
          {activeTab === 'MY_SHEET' && myMainSheet && (
             <CharacterSheet character={myMainSheet} onChange={(u) => updateCharacter(u.id, u)} onRoll={onRoll} />
          )}

          {activeTab === 'NPC_TOOLS' && room?.myRole === 'GM' && (
            <div className="flex flex-col gap-12 max-w-5xl mx-auto w-full">
              <div className="flex items-center justify-between bg-[#1e2128] p-6 rounded-3xl border border-[#3a4a63]">
                <div>
                  <h2 className="text-3xl font-black text-[#e6e9ef] tracking-tight">Библиотека персонажей</h2>
                  <p className="text-[#9aa4b2] text-sm font-medium">Ваши NPC и сюжетные антагонисты</p>
                </div>
                <button 
                  onClick={addNPC}
                  className="bg-[#00e676] hover:bg-[#00c853] text-black px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl shadow-[#00e676]/20"
                >
                  <PlusCircle size={18}/> Создать NPC
                </button>
              </div>
              
              <div className="grid grid-cols-1 gap-16">
                {npcs.map(npc => (
                  <div key={npc.id} className="relative group">
                     <button 
                        onClick={() => deleteNPC(npc.id)}
                        className="absolute top-4 right-4 z-20 bg-red-500 hover:bg-red-600 text-white p-3 rounded-2xl shadow-xl transition-all scale-0 group-hover:scale-100"
                      >
                        <Trash2 size={20}/>
                      </button>
                     <CharacterSheet character={npc} onChange={(u) => updateCharacter(u.id, u)} onRoll={onRoll} />
                  </div>
                ))}
                {npcs.length === 0 && (
                   <div className="py-20 text-center border-4 border-dashed border-[#3a4a63]/20 rounded-[4rem]">
                      <Shield size={64} className="mx-auto text-[#3a4a63] opacity-20 mb-4"/>
                      <p className="text-xl font-black text-[#3a4a63] opacity-30 uppercase tracking-[0.3em]">Список NPC пуст</p>
                   </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      <Chat messages={room?.messages || []} onSendMessage={onSendMessage} currentUser={room?.myName || ''} />
    </div>
  );
};

const LoginView: React.FC<{ onCreate: (n: string) => void, onJoin: (n: string, c: string) => void }> = ({ onCreate, onJoin }) => {
  const [mode, setMode] = useState<'CHOICE' | 'CREATE' | 'JOIN'>('CHOICE');
  const [roomName, setRoomName] = useState('');
  const [userName, setUserName] = useState('');
  const [code, setCode] = useState('');

  const inputClass = "w-full bg-[#0f1115] border border-[#3a4a63] rounded-2xl p-5 outline-none focus:border-[#4aa3ff] transition-all text-lg font-medium";
  const labelClass = "block text-[10px] font-black text-[#9aa4b2] uppercase tracking-[0.2em] mb-3 ml-2";

  return (
    <div className="h-screen w-screen flex items-center justify-center p-6 bg-[#0f1115] overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
         <div className="grid grid-cols-6 gap-2 rotate-12 -translate-y-1/2">
            {Array.from({length: 48}).map((_, i) => <Dice5 key={i} size={80} className="text-[#4aa3ff]"/>)}
         </div>
      </div>

      <div className="w-full max-w-lg bg-[#1e2128] border border-[#3a4a63] rounded-[3rem] p-12 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] flex flex-col gap-10 relative z-10 animate-in zoom-in duration-700">
        <div className="text-center space-y-2">
          <h1 className="text-6xl font-black text-[#4aa3ff] tracking-tighter italic">FATE.NET</h1>
          <div className="h-1 w-24 bg-[#4aa3ff] mx-auto rounded-full"></div>
          <p className="text-[#9aa4b2] text-sm font-bold uppercase tracking-[0.2em]">Интерактивный игровой стол</p>
        </div>

        {mode === 'CHOICE' && (
          <div className="flex flex-col gap-5">
            <button onClick={() => setMode('CREATE')} className="group flex items-center justify-between p-8 bg-[#15171b] border border-[#3a4a63] rounded-3xl hover:border-[#4aa3ff] hover:bg-[#1e2128] transition-all text-left shadow-lg">
              <div>
                <span className="block text-2xl font-black mb-1">МАСТЕР</span>
                <span className="text-xs text-[#9aa4b2] font-medium tracking-wide">Создать новую сессию и код комнаты</span>
              </div>
              <Shield className="text-[#4aa3ff] group-hover:scale-125 transition-transform duration-500" size={48}/>
            </button>
            <button onClick={() => setMode('JOIN')} className="group flex items-center justify-between p-8 bg-[#15171b] border border-[#3a4a63] rounded-3xl hover:border-[#4aa3ff] hover:bg-[#1e2128] transition-all text-left shadow-lg">
              <div>
                <span className="block text-2xl font-black mb-1">ИГРОК</span>
                <span className="text-xs text-[#9aa4b2] font-medium tracking-wide">Войти в существующий мир по коду</span>
              </div>
              <Users className="text-[#4aa3ff] group-hover:scale-125 transition-transform duration-500" size={48}/>
            </button>
          </div>
        )}

        {mode === 'CREATE' && (
          <div className="space-y-8">
            <div className="animate-in slide-in-from-right-4 duration-300">
              <label className={labelClass}>Название кампании</label>
              <input autoFocus className={inputClass} placeholder="Напр: Хроники Акаши" value={roomName} onChange={(e) => setRoomName(e.target.value)} />
            </div>
            <div className="flex gap-4">
              <button onClick={() => setMode('CHOICE')} className="flex-1 py-5 text-[#9aa4b2] font-black uppercase tracking-widest text-xs">Назад</button>
              <button onClick={() => roomName && onCreate(roomName)} className="flex-[2] py-5 bg-[#4aa3ff] text-white rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl shadow-[#4aa3ff]/20 hover:scale-[1.02] active:scale-95 transition-all">Запустить</button>
            </div>
          </div>
        )}

        {mode === 'JOIN' && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
            <div className="space-y-6">
              <div>
                <label className={labelClass}>Ваше имя</label>
                <input autoFocus className={inputClass} placeholder="Напр: Арагорн" value={userName} onChange={(e) => setUserName(e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Код приглашения</label>
                <input className={`${inputClass} font-mono tracking-[0.5em] text-center uppercase`} placeholder="XXXXXX" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} maxLength={6} />
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setMode('CHOICE')} className="flex-1 py-5 text-[#9aa4b2] font-black uppercase tracking-widest text-xs">Назад</button>
              <button onClick={() => userName && code && onJoin(userName, code)} className="flex-[2] py-5 bg-[#4aa3ff] text-white rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl shadow-[#4aa3ff]/20 hover:scale-[1.02] active:scale-95 transition-all">Присоединиться</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
