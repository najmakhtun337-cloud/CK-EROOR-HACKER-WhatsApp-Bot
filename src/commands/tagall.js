import { isGroup, isAdmin, isBotAdmin } from '../utils/permissions.js';

/**
 * .tagall command - Mention all group members
 */
export async function handleTagAll(sock, msg, groupMetadata) {
  const chatId = msg.key.remoteJid;
  const senderId = msg.key.participant;

  // Check if group
  if (!isGroup(chatId)) {
    try {
      await sock.sendMessage(chatId, { text: '❌ This command only works in groups.' });
    } catch (error) {
      console.error('Error sending message:', error.message);
    }
    return;
  }

  // Check if sender is admin
  const groupAdmins = (groupMetadata.participants || [])
    .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
    .map(p => p.id);

  if (!isAdmin(senderId, groupAdmins)) {
    try {
      await sock.sendMessage(chatId, { text: '❌ Only group admins can use this command.' });
    } catch (error) {
      console.error('Error sending message:', error.message);
    }
    return;
  }

  try {
    const participants = (groupMetadata.participants || []).map(p => p.id);
    
    const mentions = participants.map(jid => ({
      key: { remoteJid: chatId, fromMe: false, id: '' },
      message: { extendedTextMessage: { text: jid } },
    }));

    const message = `👥 Tagged all ${participants.length} members!`;

    await sock.sendMessage(chatId, {
      text: message,
      mentions: participants,
    });
  } catch (error) {
    console.error('Error in tagall command:', error.message);
    try {
      await sock.sendMessage(chatId, { text: '❌ Error tagging all members. Check bot permissions.' });
    } catch (e) {
      console.error('Error sending error message:', e.message);
    }
  }
}

export default handleTagAll;
