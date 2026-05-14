#!/usr/bin/env python3
"""
TrainingPeaks Daily Sync Script
Fetches latest workouts, fitness metrics, and athlete profile.
Stores data in JSON format for the VeloCommand dashboard.
"""

import json
import subprocess
import sys
import os
from datetime import datetime, timedelta
from pathlib import Path

# Paths
DATA_DIR = Path('/root/.openclaw/workspace/velocommand/data')
TP_SCRIPT = Path('/root/.openclaw/workspace/skills/trainingpeaks/scripts/tp.py')
CONFIG_FILE = DATA_DIR / 'tp_config.json'

# Ensure data directory exists
DATA_DIR.mkdir(parents=True, exist_ok=True)

def run_tp_command(cmd, *args):
    """Run a TrainingPeaks CLI command."""
    full_cmd = [sys.executable, str(TP_SCRIPT), cmd] + list(args)
    result = subprocess.run(full_cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error running tp.py {cmd}: {result.stderr}")
        return None
    return result.stdout

def check_auth():
    """Check if TP auth is valid."""
    output = run_tp_command('auth-status')
    if output and '✓ Ready' in output:
        return True
    return False

def fetch_workouts(start_date, end_date):
    """Fetch workouts for a date range."""
    output = run_tp_command('workouts', start_date, end_date, '--json')
    if not output:
        return []
    try:
        return json.loads(output)
    except json.JSONDecodeError:
        print("Failed to parse workouts JSON")
        return []

def fetch_fitness(days=90):
    """Fetch fitness metrics (CTL/ATL/TSB)."""
    output = run_tp_command('fitness', '--days', str(days), '--json')
    if not output:
        return None
    try:
        return json.loads(output)
    except json.JSONDecodeError:
        print("Failed to parse fitness JSON")
        return None

def fetch_profile():
    """Fetch athlete profile."""
    output = run_tp_command('profile', '--json')
    if not output:
        return None
    try:
        return json.loads(output)
    except json.JSONDecodeError:
        print("Failed to parse profile JSON")
        return None

def sync():
    """Main sync function."""
    print("🚴‍♂️ Starting TrainingPeaks sync...")
    
    # Check auth
    if not check_auth():
        print("❌ Not authenticated. Please run: python3 scripts/tp.py auth <cookie>")
        sys.exit(1)
    
    print("✓ Authenticated")
    
    # Calculate date range (last 7 days for incremental sync)
    end_date = datetime.now()
    start_date = end_date - timedelta(days=7)
    
    start_str = start_date.strftime('%Y-%m-%d')
    end_str = end_date.strftime('%Y-%m-%d')
    
    print(f"Fetching workouts from {start_str} to {end_str}...")
    workouts = fetch_workouts(start_str, end_str)
    print(f"✓ Fetched {len(workouts)} workouts")
    
    print("Fetching fitness metrics...")
    fitness = fetch_fitness(days=90)
    if fitness:
        print(f"✓ CTL: {fitness.get('ctl', 'N/A')} | ATL: {fitness.get('atl', 'N/A')} | TSB: {fitness.get('tsb', 'N/A')}")
    
    print("Fetching athlete profile...")
    profile = fetch_profile()
    if profile:
        print(f"✓ Profile: {profile.get('firstName', '')} {profile.get('lastName', '')}")
    
    # Save to JSON
    sync_data = {
        'lastSync': datetime.now().isoformat(),
        'workouts': workouts,
        'fitness': fitness,
        'profile': profile,
    }
    
    output_file = DATA_DIR / 'trainingpeaks_sync.json'
    with open(output_file, 'w') as f:
        json.dump(sync_data, f, indent=2)
    
    print(f"✓ Data saved to {output_file}")
    print("🎉 Sync complete!")
    
    return sync_data

if __name__ == '__main__':
    sync()
