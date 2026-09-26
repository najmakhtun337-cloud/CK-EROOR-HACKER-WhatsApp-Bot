import { isGroup, isAdmin } from '../utils/permissions.js';

/**
 * .hidetag <message> command - Mention members in hidden style
 */
export async function handleHideTag(sock, msg, args, groupMetadata) {
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

  // Check if message provided
  if (!args || args.length === 0) {
    try {
      await sock.sendMessage(chatId, { text: '❌ Usage: .hidetag <message>' });
    } catch (error) {
      console.error('Error sending message:', error.message);
    }
    return;
  }

  try {
    const message = args.join(' ');
    const participants = (groupMetadata.participants || []).map(p => p.id);

    await sock.sendMessage(chatId, {
      text: message,
      mentions: participants,
    });
  } catch (error) {
    console.error('Error in hidetag command:', error.message);
    try {
      await sock.sendMessage(chatId, { text: '❌ Error sending hidden tag message. Check bot permissions.' });
    } catch (e) {
      console.error('Error sending error message:', e.message);
    }
  }
}

export default handleHideTag;
