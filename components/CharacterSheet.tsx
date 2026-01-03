
import React, { useState } from 'react';
import { FateCharacter, FateStressTrack, FateSkillRow } from '../types';
import { Plus, X, Trash2, Upload, Dice5, ChevronDown, ListPlus } from 'lucide-react';

interface Props {
  character: FateCharacter;
  onChange: (updated: FateCharacter) => void;
  onRoll: (modifier: number) => void;
  isGMView?: boolean;
}

export const CharacterSheet: React.FC<Props> = ({ character, onChange, onRoll, isGMView }) => {
  const [modifier, setModifier] = useState(0);

  const updateField = (field: keyof FateCharacter, value: any) => {
    onChange({ ...character, [field]: value });
  };

  const handleListChange = (key: 'aspects' | 'stunts', index: number, value: string) => {
    const list = [...character[key]];
    list[index] = value;
    updateField(key, list);
  };

  const addListItem = (key: 'aspects' | 'stunts') => {
    updateField(key, [...character[key], '']);
  };

  const removeListItem = (key: 'aspects' | 'stunts', index: number) => {
    const list = [...character[key]];
    list.splice(index, 1);
    updateField(key, list);
  };

  const handleStressClick = (trackIndex: number, cellIndex: number) => {
    const newStress = [...character.stress];
    const track = { ...newStress[trackIndex] };
    const values = [...track.values];
    values[cellIndex] = !values[cellIndex];
    track.values = values;
    newStress[trackIndex] = track;
    updateField('stress', newStress);
  };

  const updateStressCapacity = (index: number, delta: number) => {
    const newStress = [...character.stress];
    const track = { ...newStress[index] };
    const newCount = Math.max(1, Math.min(8, track.count + delta));
    const newValues = Array(newCount).fill(false).map((_, i) => track.values[i] || false);
    track.count = newCount;
    track.values = newValues;
    newStress[index] = track;
    updateField('stress', newStress);
  };

  const addStressTrack = () => {
    const newTrack: FateStressTrack = {
      id: Date.now().toString(),
      name: 'Новый стресс',
      count: 2,
      values: [false, false],
      canDelete: true
    };
    updateField('stress', [...character.stress, newTrack]);
  };

  const removeStressTrack = (index: number) => {
    const newStress = character.stress.filter((_, i) => i !== index);
    updateField('stress', newStress);
  };

  const addConsequenceSlot = () => {
    const labels = ['Лёгкое', 'Среднее', 'Тяжёлое', 'Экстремальное'];
    const values = [-2, -4, -6, -8];
    const currentLen = character.consequences.length;
    const nextIdx = Math.min(currentLen, labels.length - 1);
    
    const newCons = [
      ...character.consequences,
      { label: labels[nextIdx], value: values[nextIdx], text: '' }
    ];
    updateField('consequences', newCons);
  };

  const removeConsequenceSlot = (index: number) => {
    const newCons = character.consequences.filter((_, i) => i !== index);
    updateField('consequences', newCons);
  };

  const updateConsequenceSeverity = (index: number, value: number) => {
    const newCons = [...character.consequences];
    const labelsMap: Record<number, string> = { [-2]: 'Лёгкое', [-4]: 'Среднее', [-6]: 'Тяжёлое', [-8]: 'Экстр.' };
    newCons[index] = { ...newCons[index], value, label: labelsMap[value] || '???' };
    updateField('consequences', newCons);
  };

  // Skill row logic
  const handleSkillNameChange = (rowIndex: number, skillIndex: number, value: string) => {
    const newSkills = [...character.skills];
    const row = { ...newSkills[rowIndex] };
    const list = [...row.list];
    list[skillIndex] = value;
    row.list = list;
    newSkills[rowIndex] = row;
    updateField('skills', newSkills);
  };

  const addSkillToRow = (rowIndex: number) => {
    const newSkills = [...character.skills];
    const row = { ...newSkills[rowIndex] };
    row.list = [...row.list, ''];
    newSkills[rowIndex] = row;
    updateField('skills', newSkills);
  };

  const removeSkillFromRow = (rowIndex: number, skillIndex: number) => {
    const newSkills = [...character.skills];
    const row = { ...newSkills[rowIndex] };
    const list = [...row.list];
    list.splice(skillIndex, 1);
    row.list = list;
    newSkills[rowIndex] = row;
    updateField('skills', newSkills);
  };

  const updateSkillRowBonus = (rowIndex: number, value: number) => {
    const newSkills = [...character.skills];
    newSkills[rowIndex] = { ...newSkills[rowIndex], bonus: value };
    updateField('skills', newSkills);
  };

  const addSkillRow = () => {
    const lastBonus = character.skills.length > 0 ? character.skills[character.skills.length - 1].bonus : 0;
    const newRow: FateSkillRow = { bonus: lastBonus - 1, list: [''] };
    updateField('skills', [...character.skills, newRow]);
  };

  const removeSkillRow = (rowIndex: number) => {
    const newSkills = character.skills.filter((_, i) => i !== rowIndex);
    updateField('skills', newSkills);
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-[#24272d] border border-[#3a4a63] rounded-2xl shadow-2xl max-w-5xl mx-auto w-full">
      <header className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-56 flex flex-col items-center gap-3">
          <div className="w-full aspect-square bg-black/40 rounded-xl border border-[#3a4a63] overflow-hidden flex items-center justify-center relative group">
            {character.image ? (
              <img src={character.image} className="w-full h-full object-cover" alt="Portrait" />
            ) : (
              <Upload className="text-[#3a4a63]" size={48} />
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
          </div>
          <div className="bg-[#15181d] border border-[#3a4a63] rounded-lg p-3 w-full flex flex-col items-center">
            <span className="text-xs uppercase text-[#9aa4b2] font-bold">Очки судьбы</span>
            <div className="flex items-center gap-4 mt-1">
              <button onClick={() => updateField('fatePoints', Math.max(0, character.fatePoints - 1))} className="w-8 h-8 rounded-full bg-[#3a4a63] flex items-center justify-center hover:bg-[#4aa3ff] transition-colors">-</button>
              <span className="text-2xl font-black text-[#4aa3ff]">{character.fatePoints}</span>
              <button onClick={() => updateField('fatePoints', character.fatePoints + 1)} className="w-8 h-8 rounded-full bg-[#3a4a63] flex items-center justify-center hover:bg-[#4aa3ff] transition-colors">+</button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-3">
          <input 
            className="bg-[#15181d] border border-[#3a4a63] rounded-lg p-3 text-2xl font-bold w-full focus:outline-none focus:border-[#4aa3ff]" 
            placeholder="Имя персонажа" 
            value={character.name}
            onChange={(e) => updateField('name', e.target.value)}
          />
          <input 
            className="bg-[#15181d] border border-[#3a4a63] rounded-lg p-3 text-lg w-full focus:outline-none focus:border-[#4aa3ff]" 
            placeholder="Концепция" 
            value={character.concept}
            onChange={(e) => updateField('concept', e.target.value)}
          />
          <input 
            className="bg-[#15181d] border border-[#3a4a63] rounded-lg p-3 text-lg w-full focus:outline-none focus:border-[#4aa3ff]" 
            placeholder="Проблема" 
            value={character.trouble}
            onChange={(e) => updateField('trouble', e.target.value)}
          />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col gap-6">
          <section className="bg-[#1f2228] p-5 rounded-xl border border-[#3a4a63]">
            <h2 className="text-[#4aa3ff] font-bold mb-4 flex items-center gap-2">Аспекты</h2>
            <div className="space-y-2">
              {character.aspects.map((aspect, i) => (
                <div key={i} className="flex gap-2">
                  <input 
                    className="flex-1 bg-[#15181d] border border-[#3a4a63] rounded-lg p-2 text-sm" 
                    placeholder="Новый аспект" 
                    value={aspect}
                    onChange={(e) => handleListChange('aspects', i, e.target.value)}
                  />
                  <button onClick={() => removeListItem('aspects', i)} className="text-red-400 p-2 hover:bg-red-400/10 rounded"><Trash2 size={16}/></button>
                </div>
              ))}
              <button onClick={() => addListItem('aspects')} className="w-full py-2 bg-[#3a4a63]/30 rounded-lg text-xs hover:bg-[#3a4a63]/50 transition-colors">+ Добавить аспект</button>
            </div>
          </section>

          <section className="bg-[#1f2228] p-5 rounded-xl border border-[#3a4a63]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[#4aa3ff] font-bold">Навыки</h2>
              <button 
                onClick={addSkillRow}
                className="text-[10px] bg-[#3a4a63] px-2 py-1 rounded hover:bg-[#4aa3ff] transition-colors flex items-center gap-1"
              >
                <ListPlus size={12}/> + Ряд
              </button>
            </div>
            <div className="space-y-4">
              {character.skills.map((row, rowIndex) => (
                <div key={rowIndex} className="flex flex-col gap-2 p-3 rounded-xl bg-black/20 group/row border border-transparent hover:border-[#3a4a63] transition-all">
                  <div className="flex items-center gap-3">
                    <div className="relative group/bonus shrink-0">
                      <input 
                        type="number"
                        className="w-10 h-10 flex items-center justify-center bg-[#4aa3ff] text-white font-black rounded-lg text-center focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        value={row.bonus}
                        onChange={(e) => updateSkillRowBonus(rowIndex, parseInt(e.target.value) || 0)}
                      />
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center text-[8px] text-[#4aa3ff] font-bold">+</span>
                    </div>
                    <div className="flex-1 flex flex-wrap gap-2">
                      {row.list.map((skill, skillIndex) => (
                        <div key={skillIndex} className="flex gap-1 items-center bg-[#15181d] rounded-md border border-[#3a4a63] px-2 py-1.5 shadow-sm group/skill">
                          <input 
                            className="bg-transparent border-none text-xs w-24 focus:outline-none" 
                            value={skill} 
                            onChange={(e) => handleSkillNameChange(rowIndex, skillIndex, e.target.value)}
                            placeholder="Навык"
                          />
                          <button 
                            onClick={() => removeSkillFromRow(rowIndex, skillIndex)} 
                            className="text-red-500 opacity-0 group-hover/skill:opacity-100 transition-opacity hover:scale-110"
                          >
                            <X size={12}/>
                          </button>
                        </div>
                      ))}
                      <button 
                        onClick={() => addSkillToRow(rowIndex)} 
                        className="p-1.5 text-[#4aa3ff] hover:bg-[#4aa3ff]/10 rounded-md transition-colors"
                      >
                        <Plus size={16}/>
                      </button>
                    </div>
                    <button 
                      onClick={() => removeSkillRow(rowIndex)} 
                      className="text-red-400 opacity-0 group-hover/row:opacity-100 transition-opacity p-2 hover:bg-red-400/10 rounded-md"
                    >
                      <Trash2 size={16}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-[#1f2228] p-5 rounded-xl border border-[#3a4a63]">
            <h2 className="text-[#4aa3ff] font-bold mb-4">Трюки</h2>
            <div className="space-y-2">
              {character.stunts.map((stunt, i) => (
                <div key={i} className="flex gap-2">
                  <textarea 
                    className="flex-1 bg-[#15181d] border border-[#3a4a63] rounded-lg p-2 text-sm min-h-[60px]" 
                    placeholder="Описание трюка" 
                    value={stunt}
                    onChange={(e) => handleListChange('stunts', i, e.target.value)}
                  />
                  <button onClick={() => removeListItem('stunts', i)} className="text-red-400 p-2 hover:bg-red-400/10 rounded"><Trash2 size={16}/></button>
                </div>
              ))}
              <button onClick={() => addListItem('stunts')} className="w-full py-2 bg-[#3a4a63]/30 rounded-lg text-xs hover:bg-[#3a4a63]/50 transition-colors">+ Добавить трюк</button>
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-6">
          <section className="bg-[#1f2228] p-5 rounded-xl border border-[#3a4a63]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[#4aa3ff] font-bold">Стресс и Последствия</h2>
              <button 
                onClick={addStressTrack} 
                className="text-[10px] bg-[#3a4a63] px-2 py-1 rounded hover:bg-[#4aa3ff] transition-colors"
              >
                + Трек стресса
              </button>
            </div>
            <div className="space-y-6">
              {character.stress.map((track, trackIdx) => (
                <div key={track.id} className="p-3 bg-black/20 rounded-lg relative group/track">
                  <div className="flex justify-between items-center mb-2">
                    <input 
                      className="bg-transparent border-none font-bold text-sm focus:outline-none focus:text-[#4aa3ff] w-full mr-4" 
                      value={track.name}
                      onChange={(e) => {
                        const newStress = [...character.stress];
                        newStress[trackIdx].name = e.target.value;
                        updateField('stress', newStress);
                      }}
                    />
                    <div className="flex gap-2 items-center shrink-0">
                      <button onClick={() => updateStressCapacity(trackIdx, -1)} className="text-xs text-[#9aa4b2] w-5 h-5 flex items-center justify-center bg-[#15181d] rounded hover:text-white">-</button>
                      <button onClick={() => updateStressCapacity(trackIdx, 1)} className="text-xs text-[#9aa4b2] w-5 h-5 flex items-center justify-center bg-[#15181d] rounded hover:text-white">+</button>
                      <button onClick={() => removeStressTrack(trackIdx)} className="text-red-400 opacity-0 group-hover/track:opacity-100 transition-opacity ml-1"><Trash2 size={12}/></button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: track.count }).map((_, i) => (
                      <div 
                        key={i} 
                        onClick={() => handleStressClick(trackIdx, i)}
                        className={`w-8 h-8 rounded border-2 border-[#3a4a63] cursor-pointer transition-all flex items-center justify-center font-bold text-xs ${track.values[i] ? 'bg-[#4aa3ff] border-[#4aa3ff] shadow-[0_0_10px_rgba(74,163,255,0.5)] text-white' : 'bg-[#15181d] text-[#3a4a63]'}`}
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="space-y-3 pt-4 border-t border-[#3a4a63]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-[#9aa4b2] uppercase">Слоты последствий</span>
                  <button onClick={addConsequenceSlot} className="text-[10px] bg-[#3a4a63] px-2 py-1 rounded hover:bg-[#4aa3ff] transition-colors">+ Слот</button>
                </div>
                {character.consequences.map((cons, i) => (
                  <div key={i} className="flex items-stretch rounded-lg overflow-hidden border border-[#3a4a63] group/cons h-10">
                    <div className="relative group/severity shrink-0 bg-[#4aa3ff] flex items-center">
                        <select 
                            className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
                            value={cons.value}
                            onChange={(e) => updateConsequenceSeverity(i, parseInt(e.target.value))}
                        >
                            <option value="-2">Mild (-2)</option>
                            <option value="-4">Moderate (-4)</option>
                            <option value="-6">Severe (-6)</option>
                            <option value="-8">Extreme (-8)</option>
                        </select>
                        <div className="px-3 flex items-center text-[10px] font-black whitespace-nowrap text-white gap-1 uppercase tracking-tighter">
                            {cons.label} <span>{cons.value}</span> <ChevronDown size={10}/>
                        </div>
                    </div>
                    <input 
                      className="flex-1 bg-[#15181d] px-3 text-sm focus:outline-none min-w-0" 
                      placeholder="Заполните последствие..." 
                      value={cons.text}
                      onChange={(e) => {
                        const newCons = [...character.consequences];
                        newCons[i].text = e.target.value;
                        updateField('consequences', newCons);
                      }}
                    />
                    <button onClick={() => removeConsequenceSlot(i)} className="bg-[#15181d] text-red-400 px-3 opacity-0 group-hover/cons:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-400/10">
                      <Trash2 size={14}/>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-[#1f2228] p-5 rounded-xl border border-[#3a4a63]">
            <h2 className="text-[#4aa3ff] font-bold mb-4">Бросок FATE</h2>
            <div className="flex flex-col items-center gap-6">
              <div className="flex items-center gap-4 bg-[#15181d] p-3 rounded-lg border border-[#3a4a63]">
                <span className="text-xs font-bold text-[#9aa4b2]">МОД:</span>
                <button onClick={() => setModifier(m => m - 1)} className="w-8 h-8 rounded bg-[#3a4a63] hover:bg-[#3a4a63]/70">-</button>
                <span className="text-xl font-black min-w-[2.5rem] text-center">{modifier >= 0 ? `+${modifier}` : modifier}</span>
                <button onClick={() => setModifier(m => m + 1)} className="w-8 h-8 rounded bg-[#3a4a63] hover:bg-[#3a4a63]/70">+</button>
              </div>
              <button 
                onClick={() => onRoll(modifier)}
                className="w-full py-4 bg-gradient-to-r from-[#4aa3ff] to-[#2f6fa3] rounded-xl font-bold text-lg shadow-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Dice5 size={24}/> Бросить 4DF
              </button>
            </div>
          </section>

          <section className="bg-[#1f2228] p-5 rounded-xl border border-[#3a4a63] flex-1">
            <h2 className="text-[#4aa3ff] font-bold mb-2">Дополнительно</h2>
            <textarea 
              className="w-full h-40 bg-[#15181d] border border-[#3a4a63] rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-[#4aa3ff]"
              placeholder="Инвентарь, заметки, детали мира..."
              value={character.extras}
              onChange={(e) => updateField('extras', e.target.value)}
            />
          </section>
        </div>
      </div>
    </div>
  );
};
