import { isGroup, isAdmin, isBotAdmin } from '../utils/permissions.js';
import { resolveTargetJid } from '../utils/target.js';

/**
 * .demote @user command - Remove admin status from user
 */
export async function handleDemote(sock, msg, args, groupMetadata) {
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

  // Check permissions
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

  const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
  if (!isAdmin(botJid, groupAdmins)) {
    try {
      await sock.sendMessage(chatId, { text: '❌ Bot must be a group admin to demote members.' });
    } catch (error) {
      console.error('Error sending message:', error.message);
    }
    return;
  }

  // Resolve target
  let targetJid = resolveTargetJid(msg, args);

  if (!targetJid) {
    try {
      await sock.sendMessage(chatId, { text: '❌ Please mention or reply to the user you want to demote.' });
    } catch (error) {
      console.error('Error sending message:', error.message);
    }
    return;
  }

  try {
    await sock.groupParticipantsUpdate(chatId, [targetJid], 'demote');
    await sock.sendMessage(chatId, { text: `✅ User demoted from admin.` });
  } catch (error) {
    console.error('Error in demote command:', error.message);
    try {
      await sock.sendMessage(chatId, { text: '❌ Error demoting user. Check bot permissions and user status.' });
    } catch (e) {
      console.error('Error sending error message:', e.message);
    }
  }
}

export default handleDemote;
