import cron from 'node-cron';
import db from './lib/db.server';
import { chatGroups, chatMessages } from './db/schema';
import { lt, inArray } from 'drizzle-orm';

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
    
    // Delete messages and groups in parallel for better performance
    const [deletedMessages, deletedGroups] = await Promise.all([
      db
        .delete(chatMessages)
        .where(inArray(chatMessages.chatGroupId, oldGroupIds))
        .returning(),
      db
        .delete(chatGroups)
        .where(inArray(chatGroups.id, oldGroupIds))
        .returning()
    ]);
    
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