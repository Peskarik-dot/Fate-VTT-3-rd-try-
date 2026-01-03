
export type FateStressTrack = {
  id: string;
  name: string;
  count: number;
  values: boolean[];
};

export type FateAspect = string;

export type FateCharacter = {
  id: string;
  name: string;
  concept: string;
  trouble: string;
  fatePoints: number;
  image: string;
  extras: string;
  aspects: FateAspect[];
  stunts: string[];
  consequences: { label: string; value: number; text: string }[];
  skills: Record<string, string[]>; // e.g., { "+4": ["Athletics"], "+3": ["Notice", "Will"] }
  stress: FateStressTrack[];
  isNPC: boolean;
  isGMMain?: boolean;
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
    skillName?: string;
  };
};

export type Role = 'GM' | 'PLAYER';

export type RoomState = {
  roomName: string;
  inviteCode: string;
  myRole: Role;
  myName: string;
  characters: FateCharacter[]; // All characters owned by this session
  messages: ChatMessage[];
};
