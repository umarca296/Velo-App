#!/usr/bin/env python3
"""
Telegram Bot for VeloCommand Wellness Check-ins
Sends daily wellness prompts and receives responses.
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path

# Config paths
CONFIG_DIR = Path('/root/.openclaw/workspace/velocommand/config')
DATA_DIR = Path('/root/.openclaw/workspace/velocommand/data')
WELLNESS_FILE = DATA_DIR / 'wellness.json'
CONFIG_FILE = CONFIG_DIR / 'telegram.json'

def load_config():
    """Load Telegram bot configuration."""
    if not CONFIG_FILE.exists():
        return None
    with open(CONFIG_FILE) as f:
        return json.load(f)

def save_config(config):
    """Save Telegram bot configuration."""
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    with open(CONFIG_FILE, 'w') as f:
        json.dump(config, f, indent=2)

def load_wellness_data():
    """Load wellness history."""
    if not WELLNESS_FILE.exists():
        return []
    with open(WELLNESS_FILE) as f:
        return json.load(f)

def save_wellness_data(data):
    """Save wellness history."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(WELLNESS_FILE, 'w') as f:
        json.dump(data, f, indent=2)

def parse_wellness_message(text):
    """Parse wellness input from text message.
    
    Expected formats:
    - "wellness: 4,3,2,3,4"
    - "m:4 s:3 stress:2 f:3 sleep:4"
    - "4 3 2 3 4"
    """
    text = text.lower().strip()
    
    # Format: "wellness: 4,3,2,3,4"
    if 'wellness:' in text or 'w:' in text:
        parts = text.split(':')[1].strip().split(',')
        if len(parts) == 5:
            return {
                'motivation': int(parts[0].strip()),
                'muscleSoreness': int(parts[1].strip()),
                'lifeStress': int(parts[2].strip()),
                'fatigueLevel': int(parts[3].strip()),
                'sleepQuality': int(parts[4].strip()),
            }
    
    # Format: "m:4 s:3 stress:2 f:3 sleep:4"
    scores = {}
    for part in text.split():
        if ':' in part:
            key, val = part.split(':', 1)
            key = key.strip()
            val = int(val.strip())
            if key in ('m', 'motivation', 'mot'):
                scores['motivation'] = val
            elif key in ('s', 'soreness', 'ms', 'musclesoreness'):
                scores['muscleSoreness'] = val
            elif key in ('stress', 'ls', 'lifestress'):
                scores['lifeStress'] = val
            elif key in ('f', 'fatigue', 'fat'):
                scores['fatigueLevel'] = val
            elif key in ('sleep', 'sq', 'sleepquality'):
                scores['sleepQuality'] = val
    
    if len(scores) == 5:
        return scores
    
    # Format: "4 3 2 3 4" (space separated, in order)
    parts = text.split()
    if len(parts) == 5 and all(p.isdigit() for p in parts):
        return {
            'motivation': int(parts[0]),
            'muscleSoreness': int(parts[1]),
            'lifeStress': int(parts[2]),
            'fatigueLevel': int(parts[3]),
            'sleepQuality': int(parts[4]),
        }
    
    return None

def create_wellness_entry(scores, notes=''):
    """Create a wellness entry from parsed scores."""
    entry = {
        'id': f"w{datetime.now().strftime('%Y-%m-%d')}",
        'date': datetime.now().isoformat(),
        'motivation': scores['motivation'],
        'muscleSoreness': scores['muscleSoreness'],
        'lifeStress': scores['lifeStress'],
        'fatigueLevel': scores['fatigueLevel'],
        'sleepQuality': scores['sleepQuality'],
        'sleepHours': None,
        'notes': notes,
    }
    return entry

def generate_reminder_message():
    """Generate daily wellness check-in message."""
    message = """🚴‍♂️ *Daily Wellness Check-in*

How are you feeling today? Rate each from 1-5:

🔥 *Motivation* — Ready to train?
⚠️ *Muscle Soreness* — 1=fresh, 5=very sore
🧠 *Life Stress* — Work/life pressure
🔋 *Fatigue* — Physical tiredness  
🛏️ *Sleep Quality* — How well you slept

*Quick reply:*
`wellness: 4,3,2,3,4`

Or just send 5 numbers: `4 3 2 3 4`"""
    return message

def generate_summary_message(wellness_entry, adjustment):
    """Generate summary after wellness input."""
    total_score = (
        wellness_entry['motivation'] +
        wellness_entry['sleepQuality'] +
        (6 - wellness_entry['muscleSoreness']) +
        (6 - wellness_entry['lifeStress']) +
        (6 - wellness_entry['fatigueLevel'])
    )
    
    message = f"""✅ *Wellness Logged!*

📊 *Score: {total_score}/25*
• Motivation: {'🔥' * wellness_entry['motivation']}{'○' * (5 - wellness_entry['motivation'])}
• Soreness: {'⚠️' * wellness_entry['muscleSoreness']}{'○' * (5 - wellness_entry['muscleSoreness'])}
• Stress: {'🧠' * wellness_entry['lifeStress']}{'○' * (5 - wellness_entry['lifeStress'])}
• Fatigue: {'🔋' * wellness_entry['fatigueLevel']}{'○' * (5 - wellness_entry['fatigueLevel'])}
• Sleep: {'🛏️' * wellness_entry['sleepQuality']}{'○' * (5 - wellness_entry['sleepQuality'])}

{adjustment.get('reason', '')}

Tomorrow's workout adjusted: *{adjustment.get('adjustedDuration', 0)}min* ({adjustment.get('adjustedZone', 'Z2')})
"""
    return message

if __name__ == '__main__':
    print("VeloCommand Telegram Bot Setup")
    print("=" * 50)
    print("\nTo set up the Telegram bot:")
    print("1. Message @BotFather on Telegram")
    print("2. Create a new bot with /newbot")
    print("3. Copy the bot token")
    print("4. Save it to:", CONFIG_FILE)
    print("\nThen set up webhooks or polling in your OpenClaw config.")
