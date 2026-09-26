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
import { config } from './config.js';
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

  sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
    if (connection === 'open') {
      console.log(`✅ ${config.botName} connected.`);
      return;
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const loggedOut = statusCode === DisconnectReason.loggedOut;
      if (loggedOut) {
        console.error('❌ WhatsApp session logged out. Remove auth_info/ and pair again.');
        return;
      }
      console.log('⚠️ Connection interrupted; reconnecting...');
      setTimeout(() => createConnection().catch(err => console.error('Reconnect error:', err.message)), 3000);
    }
  });

  if (!state.creds.registered) {
    const phoneNumber = await requestPhoneNumber();
    if (!phoneNumber) {
      throw new Error('Invalid phone number. Use country code plus number, for example 919876543210.');
    }

    console.log('\nWhatsApp');
    console.log('→ Linked Devices');
    console.log('→ Link a device');
    console.log('→ Link with phone number\n');

    const pairingCode = await sock.requestPairingCode(phoneNumber);
    console.log(`🔐 Pairing code: ${pairingCode}`);
    console.log('Enter this code in WhatsApp to link the bot.\n');
  }

  return sock;
}

export { normalizePhoneNumber };
