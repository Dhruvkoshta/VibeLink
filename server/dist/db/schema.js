"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatMessagesRelations = exports.chatGroupsRelations = exports.userRelations = exports.chatMessages = exports.chatGroups = exports.user = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
exports.user = (0, pg_core_1.pgTable)("user", {
    id: (0, pg_core_1.text)('id').primaryKey(),
    name: (0, pg_core_1.text)('name').notNull(),
    email: (0, pg_core_1.text)('email').notNull().unique(),
    emailVerified: (0, pg_core_1.boolean)('email_verified').notNull(),
    image: (0, pg_core_1.text)('image'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
    avatar: (0, pg_core_1.text)('avatar'),
});
exports.chatGroups = (0, pg_core_1.pgTable)('chat_groups', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    userId: (0, pg_core_1.text)('userId').notNull().references(() => exports.user.id, { onDelete: 'cascade' }),
    title: (0, pg_core_1.varchar)('title', { length: 100 }).notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt').defaultNow().$onUpdate(() => new Date()),
});
exports.chatMessages = (0, pg_core_1.pgTable)('chat_messages', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    chatGroupId: (0, pg_core_1.uuid)('chatGroupId').notNull().references(() => exports.chatGroups.id, { onDelete: 'cascade' }),
    sender: (0, pg_core_1.text)('sender').notNull(),
    message: (0, pg_core_1.text)('message').notNull(),
    userId: (0, pg_core_1.text)('userId').notNull().references(() => exports.user.id, { onDelete: 'cascade' }),
    userEmail: (0, pg_core_1.text)('userEmail').notNull(),
    userAvatar: (0, pg_core_1.text)('userAvatar'),
    createdAt: (0, pg_core_1.timestamp)('createdAt').defaultNow().notNull(),
});
exports.userRelations = (0, drizzle_orm_1.relations)(exports.user, ({ many }) => ({
    chatGroups: many(exports.chatGroups),
    chatMessages: many(exports.chatMessages),
}));
exports.chatGroupsRelations = (0, drizzle_orm_1.relations)(exports.chatGroups, ({ one, many }) => ({
    user: one(exports.user, {
        fields: [exports.chatGroups.userId],
        references: [exports.user.id],
    }),
    chatMessages: many(exports.chatMessages),
}));
exports.chatMessagesRelations = (0, drizzle_orm_1.relations)(exports.chatMessages, ({ one }) => ({
    user: one(exports.user, {
        fields: [exports.chatMessages.userId],
        references: [exports.user.id],
    }),
    chatGroup: one(exports.chatGroups, {
        fields: [exports.chatMessages.chatGroupId],
        references: [exports.chatGroups.id],
    }),
}));
