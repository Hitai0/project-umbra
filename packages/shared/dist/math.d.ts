import { Vector3D } from './types.js';
export declare function distance2D(x1: number, z1: number, x2: number, z2: number): number;
export declare function distance3D(v1: Vector3D, v2: Vector3D): number;
export declare function lerp(a: number, b: number, t: number): number;
export declare function calculateDamage(attackerAtk: number, defenderDef: number, isCrit?: boolean): {
    damage: number;
    isCrit: boolean;
    isMiss: boolean;
};
//# sourceMappingURL=math.d.ts.map