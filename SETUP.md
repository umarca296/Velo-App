# VeloCommand Setup Guide — TP + Telegram + Automation

## What You're Getting

Fully automated cycling coaching system:
- ✅ **6 AM**: TrainingPeaks auto-sync (workouts + fitness metrics)
- ✅ **8 PM**: Telegram wellness check-in reminder
- ✅ **Real-time**: Training plan auto-adjusts based on TP fatigue + wellness

---

## Step 1: TrainingPeaks Authentication 🔐

### Get Your Auth Cookie
1. Open [TrainingPeaks](https://app.trainingpeaks.com) in Chrome
2. Log in with your account
3. Press `F12` → DevTools → **Application** tab
4. Left sidebar → **Cookies** → `https://app.trainingpeaks.com`
5. Find cookie named: `Production_tpAuth`
6. Copy its value (long string starting with `eyJhbGci...`)

### Authenticate the Skill
```bash
cd /root/.openclaw/workspace/velocommand
python3 scripts/tp.py auth "<paste_cookie_here>"
```

Expected output:
```
✓ Authenticated successfully!
  Account: uros@email.com
  Athlete ID: 12345
  Token expires in: 60 minutes
```

### Test It
```bash
python3 scripts/tp.py profile
python3 scripts/tp.py fitness
python3 scripts/tp.py workouts 2026-04-20 2026-04-25
```

---

## Step 2: Telegram Bot Setup 🤖

### Create Your Bot
1. Open Telegram → Search for **@BotFather**
2. Message: `/newbot`
3. Name it: `VeloCommand_Bot`
4. Username: `velocommand_uros_bot`
5. **Copy the bot token** (looks like: `123456789:ABCdefGHIjklMNOpqrSTUvwxyz`)

### Configure in VeloCommand
```bash
cd /root/.openclaw/workspace/velocommand
mkdir -p config
```

Create `config/telegram.json`:
```json
{
  "botToken": "123456789:YOUR_TOKEN_HERE",
  "chatId": "YOUR_TELEGRAM_CHAT_ID",
  "enabled": true,
  "reminderTime": "20:00",
  "timezone": "Europe/Ljubljana"
}
```

### Get Your Chat ID
1. Message your new bot
2. Visit: `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates`
3. Look for `"chat":{"id":12345678` — that's your chat ID!

---

## Step 3: Test Daily Sync ⚡

### Manual Test
```bash
cd /root/.openclaw/workspace/velocommand

# Sync TP data
python3 scripts/sync-tp.py

# Check the output
cat data/trainingpeaks_sync.json | head -50
```

### Expected Output
```
🚴‍♂️ Starting TrainingPeaks sync...
✓ Authenticated
Fetching workouts from 2026-04-18 to 2026-04-25...
✓ Fetched 8 workouts
Fetching fitness metrics...
✓ CTL: 81.2 | ATL: 87.1 | TSB: -5.9
Fetching athlete profile...
✓ Profile: Uros Pantani
✓ Data saved to /root/.../velocommand/data/trainingpeaks_sync.json
🎉 Sync complete!
```

---

## Step 4: Enable Automation (Cron) ⏰

### Option A: OpenClaw Cron (Recommended)
Add to your OpenClaw cron config:
```bash
openclaw cron add --schedule "0 6 * * *" --name "tp-sync" --command "cd /root/.openclaw/workspace/velocommand && python3 scripts/sync-tp.py"

openclaw cron add --schedule "0 20 * * *" --name "wellness-reminder" --command "cd /root/.openclaw/workspace/velocommand && python3 scripts/cron-wellness-reminder.py"
```

### Option B: System Cron
```bash
# Edit crontab
crontab -e

# Add these lines:
0 6 * * * cd /root/.openclaw/workspace/velocommand && python3 scripts/sync-tp.py >> logs/tp-sync.log 2>&1
0 20 * * * cd /root/.openclaw/workspace/velocommand && python3 scripts/cron-wellness-reminder.py >> logs/wellness.log 2>&1
```

---

## Step 5: Telegram Commands 📱

Once the bot is running, you can send:

| Command | What It Does |
|---------|-------------|
| `/start` | Initialize the bot |
| `wellness: 4,3,2,3,4` | Log today's wellness scores |
| `4 3 2 3 4` | Quick wellness (5 numbers) |
| `/stats` | Show current CTL/ATL/TSB |
| `/plan` | Show today's adjusted workout |
| `/skip` | Skip today's workout |
| `/sync` | Force TP sync now |

---

## Daily Flow 🔄

```
6:00 AM  → TP sync runs automatically
           Dashboard updates with latest data
           
7:00 AM  → You check dashboard
           See adjusted workout for today
           
...      → You train!

8:00 PM  → Telegram reminder (if no wellness logged)
           "How are you feeling? wellness: _,_,_,_,_"
           
8:05 PM  → You reply: "wellness: 4,3,2,3,4"
           
8:06 PM  → Bot calculates adjustment
           Tomorrow's workout auto-adjusted
           Confirmation message sent
           
11:00 PM → Daily summary (optional)
           TSS, hours, wellness score, tomorrow's plan
```

---

## Troubleshooting 🛠️

### "Not authenticated" Error
- Cookie expired (lasts ~2 weeks)
- Re-run: `python3 scripts/tp.py auth "<new_cookie>"`
- Get fresh cookie from browser

### "No workouts found"
- Check date range
- Verify TP has data for those dates
- Try: `python3 scripts/tp.py workouts 2026-01-01 2026-04-25`

### Telegram bot not responding
- Check bot token is correct
- Verify chat ID
- Make sure you messaged the bot first
- Check bot privacy settings (BotFather → /mybots → Privacy)

---

## Next Features Coming 🔮

- [ ] Auto-sync from Garmin/Wahoo (via TP webhook)
- [ ] Sleep data from Whoop/Oura
- [ ] Nutrition logging
- [ ] Weather-based workout adjustments
- [ ] Race result import
- [ ] Power PR tracking
- [ ] Season planning (macro cycles)

---

**Ready? Start with Step 1 — get that TrainingPeaks cookie!** 🔥
