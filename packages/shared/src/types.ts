export type JobClass = 'Novice' | 'Swordsman' | 'Mage' | 'Archer' | 'Thief' | 'Acolyte';

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface PlayerStats {
  str: number;
  agi: number;
  vit: number;
  int: number;
  dex: number;
  luk: number;
  hp: number;
  maxHp: number;
  sp: number;
  maxSp: number;
  baseLevel: number;
  jobLevel: number;
  baseExp: number;
  jobExp: number;
  atk: number;
  matk: number;
  def: number;
  mdef: number;
  hit: number;
  flee: number;
  aspd: number;
  speed: number;
}

export type MonsterType = 'Poring' | 'Lunatic' | 'Fabre' | 'BaphometJr';

export interface MonsterConfig {
  name: string;
  type: MonsterType;
  maxHp: number;
  atk: number;
  def: number;
  exp: number;
  jobExp: number;
  speed: number;
  attackRange: number;
  aggroRange: number;
  respawnTimeMs: number;
}

export const MONSTER_CONFIGS: Record<MonsterType, MonsterConfig> = {
  Poring: {
    name: 'Poring',
    type: 'Poring',
    maxHp: 50,
    atk: 8,
    def: 2,
    exp: 15,
    jobExp: 10,
    speed: 2.0,
    attackRange: 1.5,
    aggroRange: 0, // Passive
    respawnTimeMs: 4000
  },
  Lunatic: {
    name: 'Lunatic',
    type: 'Lunatic',
    maxHp: 65,
    atk: 11,
    def: 3,
    exp: 22,
    jobExp: 15,
    speed: 2.5,
    attackRange: 1.5,
    aggroRange: 0, // Passive
    respawnTimeMs: 5000
  },
  Fabre: {
    name: 'Fabre',
    type: 'Fabre',
    maxHp: 75,
    atk: 9,
    def: 5,
    exp: 20,
    jobExp: 12,
    speed: 1.8,
    attackRange: 1.5,
    aggroRange: 0, // Passive
    respawnTimeMs: 4500
  },
  BaphometJr: {
    name: 'Baphomet Jr.',
    type: 'BaphometJr',
    maxHp: 350,
    atk: 32,
    def: 12,
    exp: 150,
    jobExp: 110,
    speed: 3.5,
    attackRange: 2.0,
    aggroRange: 7.0, // Aggressive
    respawnTimeMs: 12000
  }
};

export enum NetworkAction {
  MOVE_TO = 'MOVE_TO',
  ATTACK_TARGET = 'ATTACK_TARGET',
  CHAT_MESSAGE = 'CHAT_MESSAGE',
  EMOTE = 'EMOTE'
}

export interface MoveToPayload {
  x: number;
  z: number;
}

export interface AttackTargetPayload {
  targetId: string;
}

export interface ChatMessagePayload {
  senderId?: string;
  senderName: string;
  text: string;
  channel?: 'all' | 'party' | 'whisper';
  timestamp?: number;
}

export interface DamageEventPayload {
  sourceId: string;
  targetId: string;
  damage: number;
  isCritical: boolean;
  isMiss: boolean;
  x: number;
  y: number;
  z: number;
}
