export const MONSTER_CONFIGS = {
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
export var NetworkAction;
(function (NetworkAction) {
    NetworkAction["MOVE_TO"] = "MOVE_TO";
    NetworkAction["ATTACK_TARGET"] = "ATTACK_TARGET";
    NetworkAction["CHAT_MESSAGE"] = "CHAT_MESSAGE";
    NetworkAction["EMOTE"] = "EMOTE";
})(NetworkAction || (NetworkAction = {}));
//# sourceMappingURL=types.js.map