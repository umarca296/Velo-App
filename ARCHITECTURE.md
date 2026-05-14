# VeloCommand Architecture & Automation Plan

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    VLOCOMMAND SYSTEM                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐      ┌──────────────┐      ┌───────────┐ │
│  │ TrainingPeaks │      │   Telegram   │      │  VeloApp  │ │
│  │   (Source)    │─────▶│    (Chat)    │◀────▶│ (React)   │ │
│  └──────────────┘      └──────────────┘      └───────────┘ │
│         │                       │                  │        │
│         ▼                       ▼                  ▼        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              SYNC & AUTOMATION ENGINE                     │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │ │
│  │  │ TP Sync Job │  │ Wellness    │  │  Adjustment     │  │ │
│  │  │ (6 AM Daily)│  │ Check-in    │  │  Calculator     │  │ │
│  │  │             │  │ (8 PM Daily)│  │                 │  │ │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Components

### 1. TrainingPeaks Sync Pipeline

**Authentication**: Cookie-based (no API approval needed)
- Uses `Production_tpAuth` cookie from browser
- Stored in `~/.trainingpeaks/cookie`
- Auto-refreshes OAuth token (1hr expiry)

**Daily Sync (6 AM)**:
1. Check auth status
2. Fetch workouts from last 24h
3. Fetch fitness metrics (CTL/ATL/TSB)
4. Update local data store
5. Recalculate adjustments

**Data Retrieved**:
- Workouts: date, duration, TSS, NP, IF, power zones, HR
- Fitness: CTL, ATL, TSB trends
- Profile: FTP, weight, zones
- Metrics: weight, HRV, sleep, steps

### 2. Telegram Bot Integration

**Bot Setup**:
- Create via @BotFather
- Get token: `123456789:ABCdefGHIjklMNOpqrSTUvwxyz`
- Webhook or long-polling mode

**Daily Commands**:
```
8:00 AM - Morning briefing (optional)
"Good morning Uros! 🌅
CTL: 81 (+2) | ATL: 87 | TSB: -6
Today's workout: Threshold Intervals 75min
Wellness check-in at 8 PM 💪"

8:00 PM - Wellness check-in
"How are you feeling today? 🤔
Tap to rate (1-5):"
[Motivation] [Soreness] [Stress] [Fatigue] [Sleep]

Or quick reply:
"wellness: 4,3,2,3,4" 
```

**Bot Commands**:
- `/start` - Initialize bot
- `/wellness` - Log wellness scores
- `/stats` - Show current fitness metrics
- `/plan` - Show today's adjusted workout
- `/skip` - Mark workout as skipped
- `/sync` - Force TP sync

### 3. Automation Schedule

**Cron Jobs**:
```cron
# 6:00 AM - TrainingPeaks sync
0 6 * * * cd /velocommand && npm run sync:tp

# 8:00 PM - Wellness check-in reminder
0 20 * * * cd /velocommand && npm run remind:wellness

# 11:00 PM - Daily summary
0 23 * * * cd /velocommand && npm run summary:daily
```

### 4. Data Flow

**TrainingPeaks → App**:
```
TP API → Workout Data → Calculate Metrics → Store JSON
                    ↓
              Calculate CTL/ATL/TSB
                    ↓
              Update Dashboard
```

**Wellness Input → App**:
```
Telegram Input → Parse Scores → Store Wellness Entry
                              ↓
                        Calculate Modifier (-20% to +10%)
                              ↓
                        Fetch TP Fatigue (ATL)
                              ↓
                        Calculate Total Adjustment (max ±20%)
                              ↓
                        Adjust Tomorrow's Workout
                              ↓
                        Send Confirmation Message
```

### 5. File Structure

```
velocommand/
├── src/
│   ├── components/        # React UI
│   ├── utils/
│   │   ├── fitness.ts     # CTL/ATL/TSB calculations
│   │   ├── wellness.ts    # Wellness scoring
│   │   └── adjustments.ts # Workout adjustment logic
│   ├── services/
│   │   ├── trainingpeaks.ts  # TP API client
│   │   ├── telegram.ts       # Telegram bot
│   │   └── storage.ts        # Local data persistence
│   └── types/
├── scripts/
│   ├── sync-tp.sh         # Daily TP sync
│   ├── wellness-reminder.sh # Wellness prompt
│   └── daily-summary.sh   # Daily report
├── data/
│   ├── workouts.json      # Cached workout data
│   ├── wellness.json      # Wellness history
│   └── metrics.json       # Calculated fitness metrics
└── config/
    ├── telegram.json      # Bot token & settings
    ├── trainingpeaks.json # Auth & athlete ID
    └── schedule.json      # Cron configuration
```

## Implementation Steps

### Phase 1: TrainingPeaks Connection
1. Install TrainingPeaks skill
2. Authenticate with browser cookie
3. Test fetching workouts and metrics
4. Build sync script

### Phase 2: Telegram Bot
1. Create bot via BotFather
2. Set up webhook/polling
3. Build command handlers
4. Test wellness input flow

### Phase 3: Automation
1. Set up cron jobs
2. Build daily sync pipeline
3. Create wellness reminder system
4. Test full end-to-end flow

### Phase 4: Integration
1. Connect TP data to dashboard
2. Show adjusted workouts in plan
3. Wellness chart with trends
4. Notification system

## Security Notes

- TP cookie stored securely (file permissions 600)
- Telegram token in environment variable
- No sensitive data logged
- Local data encrypted at rest (optional)

## Next Actions

1. **Install TP skill** → `clawhub install trainingpeaks`
2. **Create Telegram bot** → Message @BotFather
3. **Auth with TP** → Extract cookie from browser
4. **Test sync** → Run manual sync job
5. **Schedule cron** → Set up daily automation
