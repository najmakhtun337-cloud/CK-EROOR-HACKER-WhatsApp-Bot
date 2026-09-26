# ⚡ CK-EROOR HACKER WhatsApp Bot

A professional WhatsApp bot built with Node.js and Baileys.

## Features

- **Phone Number Pairing** (No QR Code)
- **8 Core Commands**
- **Group Admin Controls**
- **Anti-Link Protection**
- **Multi-File Authentication**
- **Persistent Settings**

## Requirements

- Node.js v18 or higher
- WhatsApp account
- Terminal/Command line access

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/najmakhtun337-cloud/CK-EROOR-HACKER-WhatsApp-Bot.git
   cd CK-EROOR-HACKER-WhatsApp-Bot
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create .env file:**
   ```bash
   cp .env.example .env
   ```

4. **Configure .env:**
   ```
   OWNER_NUMBERS=919876543210
   PREFIX=.
   BOT_NAME=CK-EROOR HACKER
   BOT_IMAGE_URL=
   ```

## Running the Bot

Start the bot with phone number pairing:

```bash
npm start
```

### Pairing Instructions

1. Bot will display:
   ```
   ╭━━━━━━━━━━━━━━━━━━━━╮
   ┃ ⚡ CK-EROOR HACKER
   ┃ 🔐 PAIRING MODE
   ╰━━━━━━━━━━━━━━━━━━━━╯

   Enter WhatsApp phone number:
   ```

2. Enter your phone number (any format accepted):
   - `919876543210`
   - `+91 98765 43210`
   - `91-98765-43210`

3. Bot will generate a **pairing code** - copy it exactly

4. On WhatsApp:
   - Go to **Settings**
   - Tap **Linked Devices** (or Connected devices)
   - Tap **Link a device**
   - Select **Link with phone number**
   - Paste the pairing code

5. Approve on your phone

6. Bot connects and session is saved to `auth_info/`

## Commands

| Command | Usage | Permission |
|---------|-------|-----------|
| `.ping` | Shows bot latency | Everyone |
| `.menu` | Displays command menu | Everyone |
| `.tagall` | Mention all group members | Group Admin |
| `.hidetag` | Mention members (hidden style) | Group Admin |
| `.antilink on` | Enable link deletion | Group Admin |
| `.antilink off` | Disable link deletion | Group Admin |
| `.antilink status` | Show link protection status | Group Admin |
| `.kick @user` | Remove member (reply also works) | Group Admin |
| `.promote @user` | Make admin (reply also works) | Group Admin |
| `.demote @user` | Remove admin (reply also works) | Group Admin |

## Project Structure

```
CK-EROOR-HACKER-WhatsApp-Bot/
├── src/
│   ├── index.js           # Main entry point
│   ├── connection.js      # Baileys connection setup
│   ├── handler.js         # Message handler
│   ├── config.js          # Configuration loader
│   ├── commands/          # Command modules
│   │   ├── ping.js
│   │   ├── menu.js
│   │   ├── tagall.js
│   │   ├── hidetag.js
│   │   ├── antilink.js
│   │   ├── kick.js
│   │   ├── promote.js
│   │   └── demote.js
│   └── utils/
│       ├── permissions.js # Permission checks
│       └── target.js      # Target resolution
├── assets/
│   └── bot.jpg           # Bot profile picture
├── auth_info/            # Session storage (auto-created)
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## Bot Photo

Replace `assets/bot.jpg` with your desired bot profile picture (JPEG format recommended).

## Security

- Session data stored securely in `auth_info/`
- Credentials never logged or exposed
- No eval() or shell execution
- Command injection protection
- Proper error handling to prevent crashes

## Troubleshooting

### Bot won't connect
- Check internet connection
- Verify phone number format
- Delete `auth_info/` folder and re-pair

### Commands not working
- Verify you have group admin rights (for admin commands)
- Check bot has admin rights in the group
- Use correct prefix (default: `.`)

### Permission errors
- Bot must be admin in the group for kick/promote/demote
- You must be admin to use admin commands

## License

MIT

## Support

For issues or questions, please visit the repository.
