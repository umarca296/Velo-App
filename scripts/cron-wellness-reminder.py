#!/usr/bin/env python3
"""
Daily Wellness Reminder
Sends Telegram message prompting for wellness check-in.
Run at 8:00 PM daily.
"""

import json
from datetime import datetime
from pathlib import Path

# Paths
CONFIG_DIR = Path('/root/.openclaw/workspace/velocommand/config')
CONFIG_FILE = CONFIG_DIR / 'telegram.json'

REMINDER_MESSAGE = """🚴‍♂️ *Evening Wellness Check-in*

How was your day? Quick wellness log:

🔥 *Motivation* — Ready to train tomorrow?
⚠️ *Muscle Soreness* — 1=fresh, 5=very sore  
🧠 *Life Stress* — Work/life pressure
🔋 *Fatigue* — Physical tiredness
🛏️ *Sleep Quality* — How well you slept

*Reply with:*
`wellness: 4,3,2,3,4`

Or just 5 numbers: `4 3 2 3 4`"""

print(f"🕗 {datetime.now().strftime('%H:%M')}: Wellness reminder triggered")
print("Message to send:")
print(REMINDER_MESSAGE)
print("\n⚠️ Configure Telegram bot in config/telegram.json to enable sending")

# Check if already logged today
DATA_DIR = Path('/root/.openclaw/workspace/velocommand/data')
WELLNESS_FILE = DATA_DIR / 'wellness.json'

if WELLNESS_FILE.exists():
    with open(WELLNESS_FILE) as f:
        wellness = json.load(f)
    today = datetime.now().strftime('%Y-%m-%d')
    today_entries = [e for e in wellness if e.get('date', '').startswith(today)]
    if today_entries:
        print(f"✅ Wellness already logged today ({len(today_entries)} entries)")
        print("Skipping reminder...")
        exit(0)

print("📤 Would send Telegram reminder now (bot not yet configured)")
print("To enable: Set up bot token in config/telegram.json")
