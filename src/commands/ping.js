/**
 * .ping command - Show bot latency
 */
export async function handlePing(sock, msg) {
  const startTime = Date.now();
  
  try {
    await sock.sendMessage(msg.key.remoteJid, {
      text: '🏓 PONG!\n⚡ Latency: ' + (Date.now() - startTime) + 'ms',
    });
  } catch (error) {
    console.error('Error in ping command:', error.message);
  }
}

export default handlePing;
