import makeWASocket, {
  Browsers,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  useMultiFileAuthState,
} from '@whiskeysockets/baileys';
import pino from 'pino';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { mkdir } from 'node:fs/promises';
import config from './config.js';
import { handleMessage } from './handler.js';

const logger = pino({ level: process.env.LOG_LEVEL || 'silent' });

function normalizePhoneNumber(value) {
  const digits = String(value || '').replace(/\D/g, '');
  return digits.length >= 8 && digits.length <= 15 ? digits : null;
}

async function requestPhoneNumber() {
  const rl = readline.createInterface({ input, output });
  try {
    console.log('\n╭━━━━━━━━━━━━━━━━━━━━╮');
    console.log(`┃ ⚡ ${config.botName}`);
    console.log('┃ 🔐 PAIRING MODE');
    console.log('╰━━━━━━━━━━━━━━━━━━━━╯\n');
    const answer = await rl.question('Enter WhatsApp phone number: ');
    return normalizePhoneNumber(answer);
  } finally {
    rl.close();
  }
}

/**
 * Download image from URL and return as Buffer
 */
async function downloadImageBuffer(imageUrl) {
  if (!imageUrl) return null;

  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer);
  } catch (error) {
    console.error(`⚠️ Error downloading image from ${imageUrl}:`, error.message);
    return null;
  }
}

/**
 * Update bot profile picture after successful connection
 */
async function updateBotProfilePicture(sock) {
  if (!config.botImageUrl) {
    return;
  }

  try {
    const botJid = sock.user?.id;
    if (!botJid) {
      console.warn('⚠️ Bot JID not available, skipping profile picture update.');
      return;
    }

    const imageBuffer = await downloadImageBuffer(config.botImageUrl);
    if (!imageBuffer) {
      console.warn('⚠️ Could not download profile picture image.');
      return;
    }

    await sock.updateProfilePicture(botJid, imageBuffer);
    console.log('✅ Bot profile picture updated successfully.');
  } catch (error) {
    console.error('⚠️ Error updating bot profile picture:', error.message);
  }
}

export async function createConnection() {
  await mkdir(config.authPath, { recursive: true });
  const { state, saveCreds } = await useMultiFileAuthState(config.authPath);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    logger,
    browser: Browsers.macOS('Chrome'),
    printQRInTerminal: false,
    generateHighQualityLinkPreview: false,
    markOnlineOnConnect: false,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async ({ messages }) => {
    for (const message of messages || []) {
      if (!message?.message) continue;
      try {
        await handleMessage(sock, message);
      } catch (error) {
        console.error('Message handling error:', error.message);
      }
    }
  });

  let hasConnected = false;

  sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
    if (connection === 'open') {
      hasConnected = true;
      console.log(`✅ ${config.botName} connected.`);
      
      try {
        await updateBotProfilePicture(sock);
      } catch (error) {
        console.error('Profile picture update error:', error.message);
      }
      return;
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const loggedOut = statusCode === DisconnectReason.loggedOut;

      if (loggedOut) {
        console.error('❌ WhatsApp session logged out. Remove auth_info/ and pair again.');
        process.exit(1);
      }

      // Only reconnect if we've successfully connected at least once
      // Don't reconnect during initial pairing phase
      if (hasConnected) {
        console.log('⚠️ Connection interrupted; reconnecting...');
        setTimeout(() => createConnection().catch(err => console.error('Reconnect error:', err.message)), 3000);
      }
    }
  });

  // Handle pairing for unregistered connections
  if (!state.creds.registered) {
    const phoneNumber = await requestPhoneNumber();
    if (!phoneNumber) {
      throw new Error('Invalid phone number. Use country code plus number, for example 919876543210.');
    }

    console.log('\nWhatsApp');
    console.log('→ Linked Devices');
    console.log('→ Link a device');
    console.log('→ Link with phone number\n');

    // Request pairing code asynchronously without awaiting
    // This allows the socket to stay alive during pairing
    (async () => {
      try {
        const pairingCode = await sock.requestPairingCode(phoneNumber);
        console.log(`🔐 Pairing code: ${pairingCode}`);
        console.log('Enter this code in WhatsApp to link the bot.\n');
      } catch (error) {
        console.error('⚠️ Error requesting pairing code:', error.message);
      }
    })();
  }

  return sock;
}

export { normalizePhoneNumber };
