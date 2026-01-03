
export type FateStressTrack = {
  id: string;
  name: string;
  count: number;
  values: boolean[];
  canDelete: boolean;
};

export type FateAspect = string;
export type FateTempAspect = {
  name: string;
  invokes: number;
};

export type FateSkillRow = {
  bonus: number;
  list: string[];
};

export type FateCharacter = {
  id: string;
  name: string;
  concept: string;
  trouble: string;
  fatePoints: number;
  image: string;
  extras: string;
  aspects: FateAspect[];
  tempAspects: FateTempAspect[];
  stunts: string[];
  consequences: { label: string; value: number; text: string }[];
  skills: FateSkillRow[];
  stress: FateStressTrack[];
  isNPC: boolean;
};

export type ChatMessage = {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
  type: 'message' | 'roll';
  rollData?: {
    dice: number[];
    modifier: number;
    total: number;
  };
};

export type Role = 'GM' | 'PLAYER';

export type RoomState = {
  roomName: string;
  inviteCode: string;
  myRole: Role;
  myName: string;
  players: FateCharacter[];
  npcs: FateCharacter[];
  messages: ChatMessage[];
};
