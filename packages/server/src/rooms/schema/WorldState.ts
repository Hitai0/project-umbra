import { Schema, type, MapSchema } from '@colyseus/schema';

export class PlayerSchema extends Schema {
  @type('string') id: string = '';
  @type('string') name: string = '';
  @type('string') jobClass: string = 'Novice';
  
  // Current Position
  @type('number') x: number = 0;
  @type('number') y: number = 0;
  @type('number') z: number = 0;

  // Move target (Point-and-click)
  @type('number') targetX: number = 0;
  @type('number') targetZ: number = 0;
  @type('boolean') isMoving: boolean = false;
  @type('number') speed: number = 4.5;

  // Combat Stats
  @type('number') hp: number = 100;
  @type('number') maxHp: number = 100;
  @type('number') sp: number = 30;
  @type('number') maxSp: number = 30;
  @type('number') baseLevel: number = 1;
  @type('number') jobLevel: number = 1;
  @type('number') atk: number = 18;
  @type('number') def: number = 5;
  @type('number') aspd: number = 1.0; // attacks per second

  // Target entity currently locked on
  @type('string') targetEntityId: string = '';
}

export class MonsterSchema extends Schema {
  @type('string') id: string = '';
  @type('string') name: string = 'Poring';
  @type('string') monsterType: string = 'Poring';

  @type('number') x: number = 0;
  @type('number') y: number = 0;
  @type('number') z: number = 0;

  @type('number') targetX: number = 0;
  @type('number') targetZ: number = 0;
  @type('boolean') isMoving: boolean = false;
  @type('number') speed: number = 2.0;

  @type('number') hp: number = 50;
  @type('number') maxHp: number = 50;
  @type('boolean') isDead: boolean = false;

  @type('string') targetPlayerId: string = '';
}

export class WorldState extends Schema {
  @type({ map: PlayerSchema }) players = new MapSchema<PlayerSchema>();
  @type({ map: MonsterSchema }) monsters = new MapSchema<MonsterSchema>();
}
