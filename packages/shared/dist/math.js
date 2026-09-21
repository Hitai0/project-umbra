export function distance2D(x1, z1, x2, z2) {
    const dx = x2 - x1;
    const dz = z2 - z1;
    return Math.sqrt(dx * dx + dz * dz);
}
export function distance3D(v1, v2) {
    const dx = v2.x - v1.x;
    const dy = v2.y - v1.y;
    const dz = v2.z - v1.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
export function lerp(a, b, t) {
    return a + (b - a) * Math.min(Math.max(t, 0), 1);
}
export function calculateDamage(attackerAtk, defenderDef, isCrit = false) {
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
//# sourceMappingURL=math.js.map