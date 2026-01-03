
import React, { useState } from 'react';
import { FateCharacter, FateStressTrack } from '../types';
import { COLORS } from '../constants';
import { Plus, X, Trash2, Upload, Dice5, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  character: FateCharacter;
  onChange: (updated: FateCharacter) => void;
  onRoll: (modifier: number, label?: string) => void;
}

export const CharacterSheet: React.FC<Props> = ({ character, onChange, onRoll }) => {
  const [modifier, setModifier] = useState(0);

  const updateField = (field: keyof FateCharacter, value: any) => {
    onChange({ ...character, [field]: value });
  };

  const handleListChange = (key: 'aspects' | 'stunts', index: number, value: string) => {
    const list = [...character[key]];
    list[index] = value;
    updateField(key, list);
  };

  const handleStressClick = (trackIndex: number, cellIndex: number) => {
    const newStress = [...character.stress];
    const track = { ...newStress[trackIndex] };
    track.values = [...track.values];
    track.values[cellIndex] = !track.values[cellIndex];
    newStress[trackIndex] = track;
    updateField('stress', newStress);
  };

  const updateStressCapacity = (index: number, delta: number) => {
    const newStress = [...character.stress];
    const track = { ...newStress[index] };
    const newCount = Math.max(1, Math.min(8, track.count + delta));
    const newValues = Array(newCount).fill(false);
    track.values.forEach((v, i) => { if(i < newCount) newValues[i] = v; });
    track.count = newCount;
    track.values = newValues;
    newStress[index] = track;
    updateField('stress', newStress);
  };

  const handleSkillChange = (level: string, index: number, value: string) => {
    const newSkills = { ...character.skills };
    newSkills[level] = [...newSkills[level]];
    newSkills[level][index] = value;
    updateField('skills', newSkills);
  };

  const addSkillToLevel = (level: string) => {
    const newSkills = { ...character.skills };
    newSkills[level] = [...(newSkills[level] || []), ''];
    updateField('skills', newSkills);
  };

  return (
    <div className="flex flex-col gap-6 p-8 bg-[#1e2128] border border-[#3a4a63] rounded-3xl shadow-2xl w-full max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row gap-8">
        <div className="flex flex-col items-center gap-4">
          <div className="w-48 h-48 bg-[#0f1115] rounded-2xl border-2 border-[#3a4a63] overflow-hidden flex items-center justify-center relative group shadow-inner">
            {character.image ? (
              <img src={character.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Portrait" />
            ) : (
              <Upload className="text-[#3a4a63] opacity-50" size={40} />
            )}
            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => updateField('image', reader.result);
                  reader.readAsDataURL(file);
                }
              }}
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-xs font-bold uppercase tracking-wider">Изменить фото</span>
            </div>
          </div>
          
          <div className="bg-[#0f1115] border border-[#3a4a63] rounded-2xl p-4 w-full flex flex-col items-center shadow-lg">
            <span className="text-[10px] uppercase text-[#9aa4b2] font-black tracking-widest mb-1">Очки судьбы</span>
            <div className="flex items-center gap-4">
              <button onClick={() => updateField('fatePoints', Math.max(0, character.fatePoints - 1))} className="w-8 h-8 rounded-full bg-[#3a4a63] hover:bg-[#4aa3ff] transition-all">-</button>
              <span className="text-3xl font-black text-[#4aa3ff] tabular-nums">{character.fatePoints}</span>
              <button onClick={() => updateField('fatePoints', character.fatePoints + 1)} className="w-8 h-8 rounded-full bg-[#3a4a63] hover:bg-[#4aa3ff] transition-all">+</button>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <input 
            className="bg-transparent border-b-2 border-[#3a4a63] hover:border-[#4aa3ff] focus:border-[#4aa3ff] p-2 text-4xl font-black w-full outline-none transition-all placeholder:opacity-20" 
            placeholder="ИМЯ ПЕРСОНАЖА" 
            value={character.name}
            onChange={(e) => updateField('name', e.target.value)}
          />
          <div className="grid grid-cols-1 gap-4">
            <div className="relative">
              <label className="absolute -top-2 left-3 bg-[#1e2128] px-1 text-[10px] font-black text-[#4aa3ff] tracking-widest">КОНЦЕПЦИЯ</label>
              <input 
                className="w-full bg-[#0f1115] border border-[#3a4a63] rounded-xl p-4 pt-5 outline-none focus:border-[#4aa3ff] transition-all" 
                value={character.concept}
                onChange={(e) => updateField('concept', e.target.value)}
              />
            </div>
            <div className="relative">
              <label className="absolute -top-2 left-3 bg-[#1e2128] px-1 text-[10px] font-black text-red-400 tracking-widest">ПРОБЛЕМА</label>
              <input 
                className="w-full bg-[#0f1115] border border-[#3a4a63] rounded-xl p-4 pt-5 outline-none focus:border-[#4aa3ff] transition-all" 
                value={character.trouble}
                onChange={(e) => updateField('trouble', e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Аспекты и Навыки */}
        <div className="lg:col-span-7 space-y-8">
          <section className="bg-[#15171b] p-6 rounded-3xl border border-[#3a4a63] shadow-inner">
            <h2 className="text-[#4aa3ff] text-xs font-black uppercase tracking-[0.2em] mb-4">Аспекты</h2>
            <div className="space-y-3">
              {character.aspects.map((aspect, i) => (
                <div key={i} className="flex gap-2 group">
                  <div className="w-1 bg-[#3a4a63] group-hover:bg-[#4aa3ff] transition-colors rounded-full"></div>
                  <input 
                    className="flex-1 bg-transparent border-none text-sm p-1 focus:ring-0 outline-none placeholder:opacity-20" 
                    placeholder={`Аспект ${i + 1}`} 
                    value={aspect}
                    onChange={(e) => handleListChange('aspects', i, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="bg-[#15171b] p-6 rounded-3xl border border-[#3a4a63]">
            <h2 className="text-[#4aa3ff] text-xs font-black uppercase tracking-[0.2em] mb-6">Навыки</h2>
            <div className="space-y-4">
              {Object.keys(character.skills).sort().reverse().map((level) => (
                <div key={level} className="flex gap-4 items-start">
                  <div className="w-12 h-12 flex items-center justify-center bg-[#4aa3ff] text-white font-black rounded-2xl shadow-lg shadow-[#4aa3ff]/20 shrink-0">
                    {level}
                  </div>
                  <div className="flex-1 flex flex-wrap gap-2 pt-1">
                    {character.skills[level].map((skill, idx) => (
                      <div key={idx} className="flex items-center bg-[#0f1115] border border-[#3a4a63] rounded-xl px-3 py-2 group hover:border-[#4aa3ff] transition-all">
                        <input 
                          className="bg-transparent border-none text-sm w-24 outline-none font-medium" 
                          value={skill} 
                          onChange={(e) => handleSkillChange(level, idx, e.target.value)}
                          placeholder="..."
                        />
                        <button 
                          onClick={() => onRoll(parseInt(level), skill)}
                          className="ml-2 text-[#9aa4b2] hover:text-[#4aa3ff] transition-colors"
                        >
                          <Dice5 size={14}/>
                        </button>
                        <button 
                          onClick={() => {
                            const ns = { ...character.skills };
                            ns[level] = ns[level].filter((_, i) => i !== idx);
                            updateField('skills', ns);
                          }}
                          className="ml-1 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12}/>
                        </button>
                      </div>
                    ))}
                    <button onClick={() => addSkillToLevel(level)} className="w-10 h-10 flex items-center justify-center rounded-xl border border-dashed border-[#3a4a63] text-[#3a4a63] hover:border-[#4aa3ff] hover:text-[#4aa3ff] transition-all">
                      <Plus size={16}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Стресс и Броски */}
        <div className="lg:col-span-5 space-y-8">
          <section className="bg-[#15171b] p-6 rounded-3xl border border-[#3a4a63]">
            <h2 className="text-[#4aa3ff] text-xs font-black uppercase tracking-[0.2em] mb-6">Состояние</h2>
            <div className="space-y-8">
              {character.stress.map((track, trackIdx) => (
                <div key={track.id} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-[#9aa4b2] uppercase tracking-wider">{track.name}</span>
                    <div className="flex gap-1">
                      <button onClick={() => updateStressCapacity(trackIdx, -1)} className="p-1 hover:text-[#4aa3ff]"><ChevronDown size={14}/></button>
                      <button onClick={() => updateStressCapacity(trackIdx, 1)} className="p-1 hover:text-[#4aa3ff]"><ChevronUp size={14}/></button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {track.values.map((val, i) => (
                      <div 
                        key={i} 
                        onClick={() => handleStressClick(trackIdx, i)}
                        className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center cursor-pointer transition-all font-black text-lg ${val ? 'bg-[#4aa3ff] border-[#4aa3ff] text-white shadow-[0_0_15px_rgba(74,163,255,0.4)]' : 'bg-[#0f1115] border-[#3a4a63] text-[#3a4a63]'}`}
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="space-y-3 pt-6 border-t border-[#3a4a63]/30">
                <span className="text-[10px] font-black text-[#9aa4b2] uppercase tracking-wider">Последствия</span>
                {character.consequences.map((cons, i) => (
                  <div key={i} className="flex items-stretch rounded-xl overflow-hidden border border-[#3a4a63] bg-[#0f1115]">
                    <div className="bg-red-500/10 text-red-400 w-12 flex items-center justify-center text-sm font-black border-r border-[#3a4a63]">{cons.value}</div>
                    <input 
                      className="flex-1 bg-transparent px-4 py-2 text-sm outline-none" 
                      placeholder={cons.label}
                      value={cons.text}
                      onChange={(e) => {
                        const nc = [...character.consequences];
                        nc[i].text = e.target.value;
                        updateField('consequences', nc);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-gradient-to-br from-[#1e2128] to-[#0f1115] p-6 rounded-3xl border border-[#4aa3ff]/30 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
               <Dice5 size={120} className="text-[#4aa3ff]"/>
            </div>
            <h2 className="text-[#4aa3ff] text-xs font-black uppercase tracking-[0.2em] mb-6 relative">Быстрый бросок</h2>
            <div className="flex flex-col gap-6 relative">
              <div className="flex items-center justify-center gap-6">
                 <button onClick={() => setModifier(m => m - 1)} className="w-12 h-12 rounded-2xl bg-[#0f1115] border border-[#3a4a63] flex items-center justify-center text-xl font-black hover:border-[#4aa3ff] transition-all">-</button>
                 <div className="text-center">
                    <span className="block text-[10px] font-black text-[#9aa4b2] uppercase mb-1">МОДИФИКАТОР</span>
                    <span className="text-4xl font-black text-[#e6e9ef] tabular-nums">{modifier >= 0 ? `+${modifier}` : modifier}</span>
                 </div>
                 <button onClick={() => setModifier(m => m + 1)} className="w-12 h-12 rounded-2xl bg-[#0f1115] border border-[#3a4a63] flex items-center justify-center text-xl font-black hover:border-[#4aa3ff] transition-all">+</button>
              </div>
              <button 
                onClick={() => onRoll(modifier)}
                className="w-full py-5 bg-[#4aa3ff] hover:bg-[#5bb4ff] text-white rounded-2xl font-black text-xl shadow-[0_0_20px_rgba(74,163,255,0.3)] transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                <Dice5 size={28}/> БРОСИТЬ 4DF
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
