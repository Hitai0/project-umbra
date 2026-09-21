var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Schema, type, MapSchema } from '@colyseus/schema';
export class PlayerSchema extends Schema {
    constructor() {
        super(...arguments);
        this.id = '';
        this.name = '';
        this.jobClass = 'Novice';
        // Current Position
        this.x = 0;
        this.y = 0;
        this.z = 0;
        // Move target (Point-and-click)
        this.targetX = 0;
        this.targetZ = 0;
        this.isMoving = false;
        this.speed = 4.5;
        // Combat Stats
        this.hp = 100;
        this.maxHp = 100;
        this.sp = 30;
        this.maxSp = 30;
        this.baseLevel = 1;
        this.jobLevel = 1;
        this.atk = 18;
        this.def = 5;
        this.aspd = 1.0; // attacks per second
        // Target entity currently locked on
        this.targetEntityId = '';
    }
}
__decorate([
    type('string')
], PlayerSchema.prototype, "id", void 0);
__decorate([
    type('string')
], PlayerSchema.prototype, "name", void 0);
__decorate([
    type('string')
], PlayerSchema.prototype, "jobClass", void 0);
__decorate([
    type('number')
], PlayerSchema.prototype, "x", void 0);
__decorate([
    type('number')
], PlayerSchema.prototype, "y", void 0);
__decorate([
    type('number')
], PlayerSchema.prototype, "z", void 0);
__decorate([
    type('number')
], PlayerSchema.prototype, "targetX", void 0);
__decorate([
    type('number')
], PlayerSchema.prototype, "targetZ", void 0);
__decorate([
    type('boolean')
], PlayerSchema.prototype, "isMoving", void 0);
__decorate([
    type('number')
], PlayerSchema.prototype, "speed", void 0);
__decorate([
    type('number')
], PlayerSchema.prototype, "hp", void 0);
__decorate([
    type('number')
], PlayerSchema.prototype, "maxHp", void 0);
__decorate([
    type('number')
], PlayerSchema.prototype, "sp", void 0);
__decorate([
    type('number')
], PlayerSchema.prototype, "maxSp", void 0);
__decorate([
    type('number')
], PlayerSchema.prototype, "baseLevel", void 0);
__decorate([
    type('number')
], PlayerSchema.prototype, "jobLevel", void 0);
__decorate([
    type('number')
], PlayerSchema.prototype, "atk", void 0);
__decorate([
    type('number')
], PlayerSchema.prototype, "def", void 0);
__decorate([
    type('number')
], PlayerSchema.prototype, "aspd", void 0);
__decorate([
    type('string')
], PlayerSchema.prototype, "targetEntityId", void 0);
export class MonsterSchema extends Schema {
    constructor() {
        super(...arguments);
        this.id = '';
        this.name = 'Poring';
        this.monsterType = 'Poring';
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.targetX = 0;
        this.targetZ = 0;
        this.isMoving = false;
        this.speed = 2.0;
        this.hp = 50;
        this.maxHp = 50;
        this.isDead = false;
        this.targetPlayerId = '';
    }
}
__decorate([
    type('string')
], MonsterSchema.prototype, "id", void 0);
__decorate([
    type('string')
], MonsterSchema.prototype, "name", void 0);
__decorate([
    type('string')
], MonsterSchema.prototype, "monsterType", void 0);
__decorate([
    type('number')
], MonsterSchema.prototype, "x", void 0);
__decorate([
    type('number')
], MonsterSchema.prototype, "y", void 0);
__decorate([
    type('number')
], MonsterSchema.prototype, "z", void 0);
__decorate([
    type('number')
], MonsterSchema.prototype, "targetX", void 0);
__decorate([
    type('number')
], MonsterSchema.prototype, "targetZ", void 0);
__decorate([
    type('boolean')
], MonsterSchema.prototype, "isMoving", void 0);
__decorate([
    type('number')
], MonsterSchema.prototype, "speed", void 0);
__decorate([
    type('number')
], MonsterSchema.prototype, "hp", void 0);
__decorate([
    type('number')
], MonsterSchema.prototype, "maxHp", void 0);
__decorate([
    type('boolean')
], MonsterSchema.prototype, "isDead", void 0);
__decorate([
    type('string')
], MonsterSchema.prototype, "targetPlayerId", void 0);
export class WorldState extends Schema {
    constructor() {
        super(...arguments);
        this.players = new MapSchema();
        this.monsters = new MapSchema();
    }
}
__decorate([
    type({ map: PlayerSchema })
], WorldState.prototype, "players", void 0);
__decorate([
    type({ map: MonsterSchema })
], WorldState.prototype, "monsters", void 0);
