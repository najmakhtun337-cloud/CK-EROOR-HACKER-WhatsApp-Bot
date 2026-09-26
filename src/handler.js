import { config } from './config.js';
import { handlePing } from './commands/ping.js';
import { handleMenu } from './commands/menu.js';
import { handleTagAll } from './commands/tagall.js';
import { handleHideTag } from './commands/hidetag.js';
import { handleAntiLink, checkAntiLink } from './commands/antilink.js';
import { handleKick } from './commands/kick.js';
import { handlePromote } from './commands/promote.js';
import { handleDemote } from './commands/demote.js';
import { isGroup } from './utils/permissions.js';

const commands = new Map([
  ['ping', handlePing],
  ['menu', handleMenu],
  ['tagall', handleTagAll],
  ['hidetag', handleHideTag],
  ['antilink', handleAntiLink],
  ['kick', handleKick],
  ['promote', handlePromote],
  ['demote', handleDemote],
]);

/**
 * Main message handler
 */
export async function handleMessage(sock, msg) {
  try {
    // Get message content
    const messageText = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
    const chatId = msg.key.remoteJid;
    const senderId = msg.key.participant;

    // Skip if empty
    if (!messageText) return;

    // Check antilink
    if (isGroup(chatId)) {
      try {
        await checkAntiLink(sock, msg);
      } catch (error) {
        console.error('Error checking antilink:', error.message);
      }
    }

    // Check if message starts with prefix
    if (!messageText.startsWith(config.prefix)) return;

    // Parse command and arguments
    const parts = messageText.slice(config.prefix.length).trim().split(/\s+/);
    const commandName = parts[0].toLowerCase();
    const args = parts.slice(1);

    // Check if command exists
    if (!commands.has(commandName)) return;

    // Get group metadata if in group
    let groupMetadata = null;
    if (isGroup(chatId)) {
      try {
        groupMetadata = await sock.groupMetadata(chatId);
      } catch (error) {
        console.error('Error fetching group metadata:', error.message);
        return;
      }
    }

    // Execute command
    const handler = commands.get(commandName);
    try {
      if (commandName === 'ping') {
        await handler(sock, msg);
      } else if (commandName === 'menu') {
        await handler(sock, msg, commands, config);
      } else if (['tagall', 'hidetag', 'antilink', 'kick', 'promote', 'demote'].includes(commandName)) {
        await handler(sock, msg, args, groupMetadata);
      }
    } catch (error) {
      console.error(`Error executing command ${commandName}:`, error.message);
    }
  } catch (error) {
    console.error('Error handling message:', error.message);
  }
}

export { commands };
export default handleMessage;
