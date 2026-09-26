# Render Deployment Guide for CK-EROOR HACKER WhatsApp Bot

## Prerequisites

- GitHub account with access to this repository
- Render account (free tier available)
- WhatsApp account for bot pairing

## Deployment Steps

### 1. Connect Repository to Render

1. Go to [render.com](https://render.com)
2. Click **New +** → **Web Service**
3. Select **Build and deploy from a Git repository**
4. Connect your GitHub account
5. Select this repository: `najmakhtun337-cloud/CK-EROOR-HACKER-WhatsApp-Bot`
6. Choose branch: `main`

### 2. Configure Render Service

**Build Command:**
```bash
npm install
```

**Start Command:**
```bash
npm start
```

**Environment Variables:**

Add these in Render dashboard under **Environment**:

```
OWNER_NUMBERS=919876543210,919123456789
PREFIX=.
BOT_NAME=CK-EROOR HACKER
BOT_IMAGE_URL=https://files.catbox.moe/5gnxcw.png
NODE_ENV=production
LOG_LEVEL=error
```

**Instance Type:**
- Free or Paid (Standard)
- Node.js runtime

### 3. Persistent Storage (IMPORTANT)

⚠️ **Critical for Session Persistence**

Render instances restart periodically. To keep the bot's WhatsApp session:

1. Go to **Disks** tab in Render dashboard
2. Create a new disk:
   - **Name:** `auth_info`
   - **Mount Path:** `/opt/render/project/repo/auth_info`
   - **Size:** 1 GB (sufficient for bot sessions)

3. Render will mount this persistent disk on every restart
4. WhatsApp session saved in `auth_info/` survives restarts

**Without persistent disk:** Bot re-pairs on every Render restart (no session persistence)

### 4. Deploy

1. Click **Create Web Service**
2. Render builds and deploys automatically
3. Check **Logs** tab for startup status

### 5. Initial Pairing on Render

Once deployed, check logs in Render dashboard:

1. Look for:
   ```
   ╭━━━━━━━━━━━━━━━━━━━━╮
   ┃ ⚡ CK-EROOR HACKER
   ┃ 🔐 PAIRING MODE
   ╰━━━━━━━━━━━━━━━━━━━━╯

   Enter WhatsApp phone number:
   ```

2. **This is a limitation:** Render doesn't provide interactive terminal input
3. **Solution for first pairing:**
   - Pair locally first (see Local Setup below)
   - Copy `auth_info/` folder to Render persistent disk
   - Or use a local helper to pair, then deploy with session

**Recommended:** Pair locally, then deploy.

### 6. Monitor Bot

- Check **Logs** in Render dashboard
- Bot outputs connection status
- Session auto-saves to `auth_info/` disk

## Local Setup (Before Render Deployment)

Test and pair locally first:

```bash
git clone https://github.com/najmakhtun337-cloud/CK-EROOR-HACKER-WhatsApp-Bot.git
cd CK-EROOR-HACKER-WhatsApp-Bot
npm install
cp .env.example .env
# Edit .env with your values
npm start

# Enter phone number when prompted
# Pair via WhatsApp "Linked Devices" → "Link with phone number"
# auth_info/ is created locally with saved session
```

After successful local pairing, commit `auth_info/` as a snapshot (if needed for Render), or manually upload it.

## Environment Variables on Render

| Variable | Description | Example |
|----------|-------------|---------|
| `OWNER_NUMBERS` | Comma-separated WhatsApp numbers | `919876543210,919123456789` |
| `PREFIX` | Command prefix | `.` |
| `BOT_NAME` | Bot display name | `CK-EROOR HACKER` |
| `BOT_IMAGE_URL` | Bot profile picture URL | `https://files.catbox.moe/5gnxcw.png` |
| `NODE_ENV` | Environment | `production` |
| `LOG_LEVEL` | Log verbosity | `error` or `silent` |

## Security

- `.env` is excluded by `.gitignore` (never committed)
- `auth_info/` is mounted on persistent disk, not in Git
- Credentials never logged
- No sensitive data exposed

## Troubleshooting

### Bot crashes immediately
- Check logs for errors
- Verify environment variables are set
- Ensure persistent disk is mounted

### Bot disconnects after restart
- Without persistent disk: auth_info is lost (needs re-pairing)
- With persistent disk: auth_info persists (bot reconnects)

### Session lost
- Check if persistent disk quota exceeded
- Verify disk mount path is correct
- Re-pair if necessary

## 8 Commands Available

All commands work on Render after successful pairing:

- `.ping` - Bot latency
- `.menu` - Command menu
- `.tagall` - Tag all members (group admin)
- `.hidetag <text>` - Hidden tag (group admin)
- `.antilink on/off/status` - Link protection (group admin)
- `.kick @user` - Remove member (group admin)
- `.promote @user` - Make admin (group admin)
- `.demote @user` - Remove admin (group admin)

## Support

For issues, check:
1. Render logs
2. WhatsApp connection status
3. Persistent disk status
4. Environment variable configuration
