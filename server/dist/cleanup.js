"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupCleanupJob = setupCleanupJob;
const node_cron_1 = __importDefault(require("node-cron"));
const db_server_1 = __importDefault(require("./lib/db.server"));
const schema_1 = require("./db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const CHAT_GROUP_RETENTION_DAYS = 60;
function cleanupOldChatGroups() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - CHAT_GROUP_RETENTION_DAYS);
            const oldGroups = yield db_server_1.default
                .select({ id: schema_1.chatGroups.id })
                .from(schema_1.chatGroups)
                .where((0, drizzle_orm_1.lt)(schema_1.chatGroups.updatedAt, cutoffDate));
            const oldGroupIds = oldGroups.map(group => group.id);
            if (oldGroupIds.length === 0) {
                console.log('No old chat groups to delete');
                return;
            }
            console.log(`Found ${oldGroupIds.length} chat groups older than ${CHAT_GROUP_RETENTION_DAYS} days`);
            const deletedMessages = yield db_server_1.default
                .delete(schema_1.chatMessages)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.inArray)(schema_1.chatMessages.chatGroupId, oldGroupIds)))
                .returning();
            const deletedGroups = yield db_server_1.default
                .delete(schema_1.chatGroups)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.inArray)(schema_1.chatGroups.id, oldGroupIds)))
                .returning();
            console.log(`Deleted ${deletedMessages.length} messages and ${deletedGroups.length} chat groups`);
        }
        catch (error) {
            console.error('Error cleaning up old chat groups:', error);
        }
    });
}
function setupCleanupJob() {
    node_cron_1.default.schedule('0 2 1 */2 *', () => __awaiter(this, void 0, void 0, function* () {
        console.log('Running chat group cleanup job');
        yield cleanupOldChatGroups();
    }));
    console.log('Chat group cleanup job scheduled: runs every 2 months');
}
