/**
 * .menu command - Show command menu
 */
export async function handleMenu(sock, msg, commands, config) {
  const cmdList = Array.from(commands.keys()).map(cmd => {
    const icons = {
      ping: '⚡',
      menu: '📋',
      tagall: '👥',
      hidetag: '🫥',
      antilink: '🔗',
      kick: '👢',
      promote: '⬆️',
      demote: '⬇️',
    };
    return `┃ ${icons[cmd] || '•'} .${cmd}`;
  }).join('\n');

  const menu = `╭━━━━━━━━━━━━━━━━━━━━╮
┃   ⚡ ${config.botName}
┃   🤖 WhatsApp Bot
╰━━━━━━━━━━━━━━━━━━━━╯

╭━━━「 COMMANDS 」━━━╮
┃
${cmdList}
┃
╰━━━━━━━━━━━━━━━━━━━━╯`;

  try {
    await sock.sendMessage(msg.key.remoteJid, { text: menu });
  } catch (error) {
    console.error('Error in menu command:', error.message);
  }
}

export default handleMenu;
