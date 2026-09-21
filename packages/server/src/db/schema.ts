import { pgTable, serial, text, integer, timestamp, real } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const characters = pgTable('characters', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  name: text('name').notNull().unique(),
  jobClass: text('job_class').default('Novice').notNull(),
  baseLevel: integer('base_level').default(1).notNull(),
  jobLevel: integer('job_level').default(1).notNull(),
  baseExp: integer('base_exp').default(0).notNull(),
  jobExp: integer('job_exp').default(0).notNull(),
  hp: integer('hp').default(100).notNull(),
  maxHp: integer('max_hp').default(100).notNull(),
  sp: integer('sp').default(20).notNull(),
  maxSp: integer('max_sp').default(20).notNull(),
  x: real('x').default(0).notNull(),
  y: real('y').default(0).notNull(),
  z: real('z').default(0).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const inventory = pgTable('inventory', {
  id: serial('id').primaryKey(),
  characterId: integer('character_id').references(() => characters.id).notNull(),
  itemId: text('item_id').notNull(),
  quantity: integer('quantity').default(1).notNull(),
  isEquipped: integer('is_equipped').default(0).notNull()
});
