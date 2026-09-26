import { isGroup, isAdmin } from '../utils/permissions.js';
import { loadAntiLinkSettings, saveAntiLinkSettings } from '../utils/permissions.js';

const linkRegex = /(https?:\/\/|www\.)[^\s]+/gi;
const commonLinkPatterns = [
  /http(s)?:\/\//i,
  /www\./i,
  /\.com\b/i,
  /\.net\b/i,
  /\.org\b/i,
];

function containsLink(text) {
  if (!text) return false;
  return commonLinkPatterns.some(pattern => pattern.test(text));
}

/**
 * .antilink on/off/status command
 */
export async function handleAntiLink(sock, msg, args, groupMetadata) {
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

  if (!args || args.length === 0) {
    try {
      await sock.sendMessage(chatId, { text: '❌ Usage: .antilink on/off/status' });
    } catch (error) {
      console.error('Error sending message:', error.message);
    }
    return;
  }

  const action = args[0].toLowerCase();
  const settings = loadAntiLinkSettings();

  try {
    if (action === 'on') {
      settings[chatId] = true;
      saveAntiLinkSettings(settings);
      await sock.sendMessage(chatId, { text: '✅ Anti-link protection enabled.' });
    } else if (action === 'off') {
      settings[chatId] = false;
      saveAntiLinkSettings(settings);
      await sock.sendMessage(chatId, { text: '✅ Anti-link protection disabled.' });
    } else if (action === 'status') {
      const status = settings[chatId] ? 'enabled ✅' : 'disabled ❌';
      await sock.sendMessage(chatId, { text: `🔗 Anti-link protection: ${status}` });
    } else {
      await sock.sendMessage(chatId, { text: '❌ Usage: .antilink on/off/status' });
    }
  } catch (error) {
    console.error('Error in antilink command:', error.message);
    try {
      await sock.sendMessage(chatId, { text: '❌ Error updating anti-link settings.' });
    } catch (e) {
      console.error('Error sending error message:', e.message);
    }
  }
}

/**
 * Check and handle antilink violation
 */
export async function checkAntiLink(sock, msg) {
  const chatId = msg.key.remoteJid;
  const senderId = msg.key.participant;

  if (!isGroup(chatId)) return;

  const settings = loadAntiLinkSettings();
  if (!settings[chatId]) return; // Anti-link disabled

  // Don't process bot's own messages
  if (msg.key.fromMe) return;

  const messageText = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';

  if (containsLink(messageText)) {
    try {
      // Try to delete the message
      await sock.sendMessage(chatId, {
        delete: msg.key,
      });
      
      // Notify
      await sock.sendMessage(chatId, {
        text: `⚠️ Message from ${senderId} deleted for containing a link.`,
      });
    } catch (error) {
      console.error('Error deleting antilink message:', error.message);
      try {
        await sock.sendMessage(chatId, {
          text: `⚠️ Link detected but couldn't delete message. Check bot permissions.`,
        });
      } catch (e) {
        console.error('Error sending warning:', e.message);
      }
    }
  }
}

export default handleAntiLink;
