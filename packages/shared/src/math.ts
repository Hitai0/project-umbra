import { Vector3D } from './types.js';

export function distance2D(x1: number, z1: number, x2: number, z2: number): number {
  const dx = x2 - x1;
  const dz = z2 - z1;
  return Math.sqrt(dx * dx + dz * dz);
}

export function distance3D(v1: Vector3D, v2: Vector3D): number {
  const dx = v2.x - v1.x;
  const dy = v2.y - v1.y;
  const dz = v2.z - v1.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.min(Math.max(t, 0), 1);
}

export function calculateDamage(
  attackerAtk: number,
  defenderDef: number,
  isCrit: boolean = false
): { damage: number; isCrit: boolean; isMiss: boolean } {
  // Ragnarok-inspired damage calculation
  const variance = (Math.random() * 0.2 - 0.1); // +/- 10%
  const baseDamage = attackerAtk * (1 + variance);

  if (isCrit) {
    // Critical bypasses defense
    return {
      damage: Math.max(1, Math.round(baseDamage * 1.4)),
      isCrit: true,
      isMiss: false
    };
  }

  // Damage reduction based on defense
  const reduced = baseDamage * (1 - defenderDef / (defenderDef + 100));
  const finalDamage = Math.max(1, Math.round(reduced));

  return {
    damage: finalDamage,
    isCrit: false,
    isMiss: false
  };
}
