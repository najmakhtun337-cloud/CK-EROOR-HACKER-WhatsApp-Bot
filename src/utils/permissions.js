import fs from 'fs';
import path from 'path';

/**
 * Check if message is from a group
 */
export function isGroup(jid) {
  return jid.endsWith('@g.us');
}

/**
 * Check if sender is group admin
 */
export function isAdmin(senderJid, admins) {
  return admins.includes(senderJid);
}

/**
 * Check if bot is group admin
 */
export function isBotAdmin(botJid, admins) {
  return admins.includes(botJid);
}

/**
 * Check if sender is bot owner
 */
export function isOwner(senderNumber, ownerNumbers) {
  const senderClean = senderNumber.replace(/\D/g, '');
  return ownerNumbers.some(n => n.replace(/\D/g, '') === senderClean);
}

/**
 * Load antilink settings from file
 */
export function loadAntiLinkSettings() {
  try {
    const settingsPath = path.join(process.cwd(), 'antilink_settings.json');
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading antilink settings:', error.message);
  }
  return {};
}

/**
 * Save antilink settings to file
 */
export function saveAntiLinkSettings(settings) {
  try {
    const settingsPath = path.join(process.cwd(), 'antilink_settings.json');
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  } catch (error) {
    console.error('Error saving antilink settings:', error.message);
  }
}

export default {
  isGroup,
  isAdmin,
  isBotAdmin,
  isOwner,
  loadAntiLinkSettings,
  saveAntiLinkSettings,
};
