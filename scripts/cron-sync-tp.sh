#!/bin/bash
# Daily TrainingPeaks Sync - Run at 6:00 AM
# Fetches latest workouts and fitness metrics from TrainingPeaks

cd /root/.openclaw/workspace/velocommand

# Check if authenticated
python3 scripts/tp.py auth-status > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ TrainingPeaks not authenticated. Run: python3 scripts/tp.py auth <cookie>"
    exit 1
fi

# Run sync
echo "🚴‍♂️ $(date): Starting TrainingPeaks sync..."
python3 scripts/sync-tp.py

# Log result
if [ $? -eq 0 ]; then
    echo "✅ $(date): TP sync complete"
else
    echo "❌ $(date): TP sync failed"
fi