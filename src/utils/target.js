/**
 * Extract target from mentions or quotes
 */
export function extractTargetFromMentions(msg) {
  if (!msg.message) return null;

  // Check for mentioned JIDs
  if (msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
    return msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
  }

  // Check for regular text message mentions
  if (msg.message.conversation) {
    const mentions = msg.message.conversation.match(/@(\d+)/g);
    if (mentions) {
      const number = mentions[0].replace('@', '');
      return `${number}@s.whatsapp.net`;
    }
  }

  return null;
}

/**
 * Extract target from quoted message
 */
export function extractTargetFromQuotedMessage(msg) {
  if (!msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
    return null;
  }

  const quotedMessage = msg.message.extendedTextMessage.contextInfo.quotedMessage;
  return msg.message.extendedTextMessage.contextInfo.participant || null;
}

/**
 * Get quoted message author JID
 */
export function getQuotedSender(msg) {
  return msg.message?.extendedTextMessage?.contextInfo?.participant || null;
}

/**
 * Resolve target JID from message
 */
export function resolveTargetJid(msg, args) {
  // Check mentions in command arguments
  if (args.length > 0) {
    const target = extractTargetFromMentions(msg);
    if (target) return target;
  }

  // Check quoted message
  const quotedTarget = extractTargetFromQuotedMessage(msg);
  if (quotedTarget) return quotedTarget;

  return null;
}

/**
 * Format phone number for WhatsApp JID
 */
export function formatPhoneToJid(phone) {
  const cleaned = phone.replace(/\D/g, '');
  if (!cleaned) return null;
  return `${cleaned}@s.whatsapp.net`;
}

export default {
  extractTargetFromMentions,
  extractTargetFromQuotedMessage,
  getQuotedSender,
  resolveTargetJid,
  formatPhoneToJid,
};
