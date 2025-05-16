import cron from 'node-cron';
import db from './lib/db.server';
import { chatGroups, chatMessages } from './db/schema';
import { and, lt, inArray } from 'drizzle-orm';

const CHAT_GROUP_RETENTION_DAYS = 60;

async function cleanupOldChatGroups(): Promise<void> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - CHAT_GROUP_RETENTION_DAYS);
    
    const oldGroups = await db
      .select({ id: chatGroups.id })
      .from(chatGroups)
      .where(lt(chatGroups.updatedAt, cutoffDate));
    
    const oldGroupIds = oldGroups.map(group => group.id);
    
    if (oldGroupIds.length === 0) {
      console.log('No old chat groups to delete');
      return;
    }
    
    console.log(`Found ${oldGroupIds.length} chat groups older than ${CHAT_GROUP_RETENTION_DAYS} days`);
    
    const deletedMessages = await db
      .delete(chatMessages)
      .where(and(inArray(chatMessages.chatGroupId, oldGroupIds)))
      .returning();
    
    const deletedGroups = await db
      .delete(chatGroups)
      .where(and(inArray(chatGroups.id, oldGroupIds)))
      .returning();
    
    console.log(`Deleted ${deletedMessages.length} messages and ${deletedGroups.length} chat groups`);
  } catch (error) {
    console.error('Error cleaning up old chat groups:', error);
  }
}

export function setupCleanupJob(): void {
  cron.schedule('0 2 1 */2 *', async () => {
    console.log('Running chat group cleanup job');
    await cleanupOldChatGroups();
  });
  
  console.log('Chat group cleanup job scheduled: runs every 2 months');
}