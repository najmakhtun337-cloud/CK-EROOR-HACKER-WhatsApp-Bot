import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const config = {
  ownerNumbers: (process.env.OWNER_NUMBERS || '').split(',').map(n => n.trim()),
  prefix: process.env.PREFIX || '.',
  botName: process.env.BOT_NAME || 'CK-EROOR HACKER',
  botImageUrl: process.env.BOT_IMAGE_URL || '',
  authPath: path.join(__dirname, '..', 'auth_info'),
};

export default config;
