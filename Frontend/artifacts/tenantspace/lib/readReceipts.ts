import AsyncStorage from '@react-native-async-storage/async-storage';

const READ_RECEIPTS_KEY = '@tenantspace_read_receipts';

/**
 * Marks a specific chat (room or property) as read right now.
 * @param chatId The ID of the room or property
 */
export async function markChatAsRead(chatId: string): Promise<void> {
  try {
    const data = await AsyncStorage.getItem(READ_RECEIPTS_KEY);
    const receipts = data ? JSON.parse(data) : {};
    
    receipts[chatId] = new Date().toISOString();
    
    await AsyncStorage.setItem(READ_RECEIPTS_KEY, JSON.stringify(receipts));
  } catch (error) {
    console.error('Error saving read receipt:', error);
  }
}

/**
 * Gets the last read timestamp for a specific chat.
 * @param chatId The ID of the room or property
 * @returns ISO date string or null if never read
 */
export async function getChatLastRead(chatId: string): Promise<string | null> {
  try {
    const data = await AsyncStorage.getItem(READ_RECEIPTS_KEY);
    if (!data) return null;
    
    const receipts = JSON.parse(data);
    return receipts[chatId] || null;
  } catch (error) {
    console.error('Error getting read receipt:', error);
    return null;
  }
}

/**
 * Gets all read receipts at once.
 * @returns Dictionary of chatId -> ISO string
 */
export async function getAllReadReceipts(): Promise<Record<string, string>> {
  try {
    const data = await AsyncStorage.getItem(READ_RECEIPTS_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error getting all read receipts:', error);
    return {};
  }
}
