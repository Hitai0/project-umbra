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
export declare const MONSTER_CONFIGS: Record<MonsterType, MonsterConfig>;
export declare enum NetworkAction {
    MOVE_TO = "MOVE_TO",
    ATTACK_TARGET = "ATTACK_TARGET",
    CHAT_MESSAGE = "CHAT_MESSAGE",
    EMOTE = "EMOTE"
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
//# sourceMappingURL=types.d.ts.map