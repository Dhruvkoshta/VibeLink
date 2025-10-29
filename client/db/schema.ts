import { pgTable, text, varchar, timestamp, uuid, boolean, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const user = pgTable("user", {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: boolean('email_verified').notNull(),
    image: text('image'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
    avatar: text('avatar'),
});

export const chatGroups = pgTable('chat_groups', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 100 }).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().$onUpdate(() => new Date()),
}, (table) => ({
  // Index for sorting rooms by creation date
  createdAtIdx: index('chat_groups_created_at_idx').on(table.createdAt),
  // Index for cleanup queries
  updatedAtIdx: index('chat_groups_updated_at_idx').on(table.updatedAt),
  // Index for user's rooms lookup
  userIdIdx: index('chat_groups_user_id_idx').on(table.userId),
}));

export const chatMessages = pgTable('chat_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  chatGroupId: uuid('chatGroupId').notNull().references(() => chatGroups.id, { onDelete: 'cascade' }),
  sender: text('sender').notNull(),
  message: text('message').notNull(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  userEmail: text('userEmail').notNull(),
  userAvatar: text('userAvatar'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
}, (table) => ({
  // Index for fetching messages by room (most critical)
  chatGroupIdIdx: index('chat_messages_chat_group_id_idx').on(table.chatGroupId),
  // Composite index for room + timestamp for efficient message ordering
  chatGroupCreatedAtIdx: index('chat_messages_chat_group_created_at_idx').on(table.chatGroupId, table.createdAt),
  // Index for user lookup (used in send_message)
  userEmailIdx: index('chat_messages_user_email_idx').on(table.userEmail),
}));

export const userRelations = relations(user, ({ many }) => ({
  chatGroups: many(chatGroups),
  chatMessages: many(chatMessages),
}));

export const chatGroupsRelations = relations(chatGroups, ({ one, many }) => ({
  user: one(user, {
    fields: [chatGroups.userId],
    references: [user.id],
  }),
  chatMessages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  user: one(user, {
    fields: [chatMessages.userId],
    references: [user.id],
  }),
  chatGroup: one(chatGroups, {
    fields: [chatMessages.chatGroupId],
    references: [chatGroups.id],
  }),
}));

//auth

export const session = pgTable("session", {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
});

export const account = pgTable("account", {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull(),
});

export const verification = pgTable("verification", {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
});
