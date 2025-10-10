# ReliefSync

A React Native app for tracking headache episodes, daily habits, and device therapy sessions with intelligent insights and correlations.

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- iOS Simulator (macOS) or Android Emulator
- Expo Go app (optional, for physical device testing)

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npm start
```

### Running the App

```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Web Browser
npm run web
```

---

## 📱 Features

### 1. **Home Screen**

- Real-time device session control (Tension, Migraine, Sinus, Cluster, Custom modes)
- Adjustable pressure, massage, temperature, and heat/cold therapy
- Quick-start presets (10/20/30 min sessions)
- Live barometric pressure monitoring
- Session timer with pause/resume
- Post-session effectiveness rating (auto-prompted after 10+ min)

### 2. **Log Habits Screen**

- Daily habit tracking across multiple categories:
  - **Diet**: Sugar, starch, dairy, caffeine, hydration, skipped meals
  - **Sleep**: Duration and quality
  - **Stress**: 0-10 scale
  - **Exercise**: Activity and intensity
  - **Environment**: Barometric pressure, weather conditions
  - **Menstruation**: Tracking and phase
- Date navigation with ability to log past days
- "Duplicate Yesterday" feature for efficient logging

### 3. **Log Headache Screen**

- Detailed episode tracking:
  - Start time and duration
  - Intensity (0-10 with auto-labeling: Mild/Moderate/Severe)
  - Location (Frontal, Temporal, Occipital, Diffuse, One-sided)
  - Quality (Throbbing, Pressure, Sharp, Dull, Aura)
  - Possible triggers (multi-select)
- Optional device usage logging:
  - Mode, duration, temperature, pressure, pattern
  - Effectiveness rating and notes
- Link to habit logs for correlation analysis

### 4. **Insights Screen**

- **Weekly Chart**: Bar graph of episodes (last 7 days) with average intensity
- **Monthly Trend**: 30-day aggregated statistics (tap weekly chart to open)
- **Top 3 Triggers**: Ranked by correlation strength vs baseline
- **Smart Suggestions**: AI-like pattern-based recommendations:
  - Barometric pressure alerts
  - Caffeine timing advice
  - Meal schedule reminders
- **Quick Links**: Navigate to logging screens
- **Demo Data** (Dev only): Load 14 days of sample data for testing

---

## 📦 Architecture

### Tech Stack

- **Framework**: React Native (Expo SDK 54)
- **Language**: TypeScript (strict mode)
- **Navigation**: React Navigation (bottom tabs)
- **State Management**: Zustand (persistent stores)
- **Storage**: AsyncStorage (encrypted with expo-secure-store for sensitive data)
- **Validation**: Zod schemas
- **Charts**: Custom bar charts (Victory Native available but not actively used)
- **Icons**: @expo/vector-icons (Feather + MaterialCommunityIcons)
- **Haptics**: expo-haptics for tactile feedback

### Folder Structure

```
reliefsync/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── CTAButton.tsx          # Primary/Secondary/Ghost buttons
│   │   ├── StatPill.tsx           # Compact stat display
│   │   ├── SegmentedControl.tsx   # Multi-option selector
│   │   ├── ToggleRow.tsx          # Switch with label
│   │   ├── SliderRow.tsx          # Labeled slider (0-10)
│   │   ├── RatingBar.tsx          # 1-10 dot rating
│   │   └── index.ts               # Component exports
│   │
│   ├── screens/            # Main app screens
│   │   ├── HomeScreen.tsx         # Device control + session management
│   │   ├── LogHabitsScreen.tsx    # Daily habit logging
│   │   ├── LogHeadacheScreen.tsx  # Episode tracking
│   │   └── InsightsScreen.tsx     # Analytics + correlations
│   │
│   ├── store/              # Zustand state stores
│   │   ├── session.ts             # Active session state
│   │   ├── habits.ts              # Habit logs (persistent)
│   │   └── episodes.ts            # Headache episodes (persistent)
│   │
│   ├── types/              # TypeScript definitions
│   │   ├── habit.ts               # HabitLog + Zod schema
│   │   ├── episode.ts             # HeadacheEpisode + Zod schema
│   │   └── index.ts               # Type exports
│   │
│   ├── theme/              # Design system
│   │   ├── tokens.ts              # Colors, spacing, typography
│   │   └── index.tsx              # ThemeProvider + hooks
│   │
│   ├── lib/                # Utilities
│   │   ├── storage.ts             # AsyncStorage wrapper
│   │   └── baro.ts                # Barometric pressure mock API
│   │
│   └── data/               # Seed data
│       └── seed.ts                # Demo data generator
│
├── App.tsx                 # Root component + navigation
├── .eslintrc.js            # ESLint configuration
├── .prettierrc             # Prettier configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies + scripts
```

### Design System

**Color Tokens** (Dark Theme):

```typescript
{
  rsBg: "#0F1115",           // Background
  rsSurface: "#151923",      // Cards/Surfaces
  rsPrimary: "#7DD3FC",      // Primary actions
  rsPrimary600: "#38BDF8",   // Primary fills
  rsSecondary: "#A3E635",    // Success/Secondary
  rsAlert: "#F43F5E",        // Warnings/Errors
  rsWarn: "#F59E0B",         // Caution
  rsText: "#E5E7EB",         // Primary text
  rsTextDim: "#9CA3AF",      // Secondary text
  rsBorder: "#253042"        // Dividers/Borders
}
```

**Typography**:

- **H1**: 28px / 600 weight
- **H2**: 20px / 600 weight
- **Title**: 18px / 500 weight
- **Body**: 15px / 400 weight
- **Caption**: 12px / 400 weight

**Spacing**: 4, 8, 12, 16, 20, 24px

**Border Radius**: sm (8), md (12), lg (16), pill (999)

### State Management

#### Session Store (`store/session.ts`)

- **Purpose**: Manage active device therapy session
- **State**: mode, pressure, massage, heat, cold, temperature, elapsed time
- **Actions**: startSession, pauseSession, stopSession, rateEffectiveness
- **Persistence**: Debounced AsyncStorage writes

#### Habits Store (`store/habits.ts`)

- **Purpose**: Track daily habit logs
- **State**: Array of HabitLog objects
- **Actions**: addHabitLog, getLogForDate, getAllLogs, deleteLog
- **Persistence**: AsyncStorage with Zod validation

#### Episodes Store (`store/episodes.ts`)

- **Purpose**: Store headache episodes
- **State**: Array of HeadacheEpisode objects
- **Actions**: addHeadacheEpisode, getAllHeadacheEpisodes, getEpisodesByDateRange
- **Persistence**: AsyncStorage with Zod validation

### Data Flow

```
User Input → Component → Store Action → State Update → AsyncStorage → UI Re-render
                            ↓
                    Zod Validation
```

---

## 🛠 Development Scripts

### TypeScript

```bash
# Type checking
npm run typecheck
```

### Linting & Formatting

```bash
# Run ESLint
npm run lint

# Format code with Prettier
npm run format

# Check formatting (CI)
npm run format:check
```

### Platform-Specific Builds

```bash
# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on Web
npm run web
```

---

## ♿️ Accessibility

### Hit Targets

- All interactive elements ≥ 44x44 points (iOS HIG compliant)
- `CTAButton`: 48px height
- `ToggleRow`: 56px height
- `RatingBar`: 44x44 touch targets with 12px visual dots

### Haptic Feedback

- **Primary buttons**: Medium impact
- **Secondary buttons**: Light impact
- **Toggles/Switches**: Light impact
- **Rating selections**: Light impact

### Text & Colors

- All text uses theme `Text` component for consistency
- Colors bound to theme tokens (easy to swap themes)
- WCAG AA contrast ratios for dark theme (not yet tested)

---

## 🧪 Testing & Demo Data

### Loading Demo Data

In development mode, the Insights screen shows a "🧪 Load Demo Data (Dev)" button.

**What it generates**:

- 8-12 headache episodes over 14 days
- 14 daily habit logs
- Realistic intensity, triggers, and device usage
- Barometric pressure variations
- Randomized patterns for testing correlations

**How to use**:

1. Run the app in development mode
2. Navigate to the **Insights** tab
3. Scroll to bottom and tap "🧪 Load Demo Data (Dev)"
4. Confirm the alert
5. Data is immediately persisted to AsyncStorage

**Clearing demo data**:

- Uninstall and reinstall the app, or
- Manually clear AsyncStorage via dev tools

---

## 📊 Analytics & Insights

### Correlation Algorithm (Naive v1)

**Baseline Calculation**:

```typescript
baseline = total episodes / 30 days
```

**Trigger Lift**:

```typescript
P(episode|trigger) = episodes with trigger / days with trigger
lift = (P(episode|trigger) / baseline - 1) * 100
```

**Example**:

- Total episodes: 15
- Baseline: 0.5 episodes/day
- "Stress" episodes: 12
- Days with stress: 20
- P(episode|stress) = 0.6
- Lift = (0.6/0.5 - 1) \* 100 = +20%

### Suggestions Engine

**Rule-Based System** (v1):

1. **Barometric Pressure**: If ≥3 episodes with pressure <1000 hPa → Suggest "Sinus" preset
2. **Caffeine Timing**: If ≥5 habit logs with caffeine → Suggest decaf after 3pm
3. **Skipped Meals**: If ≥3 episodes with "Skipped meal" trigger → Suggest backup snack

**Future Improvements**:

- Temporal lag analysis (triggers 1-3 days before episode)
- Multi-trigger combinations (e.g., Stress + Caffeine)
- Statistical significance testing (Chi-square, Fisher's exact)
- Machine learning for pattern recognition
- Personalized thresholds per user

---

## 🔐 Privacy & Security

- All data stored **locally** on device (AsyncStorage)
- No cloud sync or external APIs (except mock baro.ts)
- Sensitive session data can use expo-secure-store (currently using AsyncStorage)
- No third-party analytics or tracking

---

## 🚧 Known Limitations

1. **Barometric Pressure**: Currently mocked (requires device sensor or weather API)
2. **Bluetooth**: "BT" status is placeholder (requires actual device pairing)
3. **Charts**: Using simple bar charts (Victory Native installed but not fully utilized)
4. **Correlations**: Naive v1 algorithm (no statistical significance testing)
5. **Multi-device**: No sync between devices
6. **Export**: No CSV/PDF export yet

---

## 🗺 Roadmap

### v1.1 (Polish)

- [ ] Add CSV export for episodes + habits
- [ ] Implement real barometric pressure API (OpenWeatherMap)
- [ ] Add dark/light theme toggle
- [ ] Improve chart interactivity (zoom, pan)

### v1.2 (Features)

- [ ] Medication tracking
- [ ] Photo journal for aura/visual symptoms
- [ ] Voice notes for quick logging
- [ ] Bluetooth device pairing (if hardware exists)

### v1.3 (Analytics)

- [ ] Temporal lag analysis (1-3 day delay triggers)
- [ ] Multi-trigger combinations
- [ ] Statistical significance testing
- [ ] Predictive alerts ("High risk day tomorrow")

### v2.0 (Cloud)

- [ ] Optional cloud backup (encrypted)
- [ ] Multi-device sync
- [ ] Share reports with doctor (PDF)
- [ ] Community anonymized insights (opt-in)

---

## 📄 License

Private project. All rights reserved.

---

## 👨‍💻 Author

Built with ❤️ using Expo + TypeScript

---

## 🙏 Acknowledgments

- **Expo Team**: For the amazing SDK
- **React Navigation**: For seamless navigation
- **Zustand**: For simple, powerful state management
- **Zod**: For runtime type safety

---

## 📞 Support

For issues or feature requests, contact the development team.

---

## 🔄 Version History

- **v1.0.0** (2025-10-08): Initial release with full feature set
  - Home screen with device control
  - Log Habits screen
  - Log Headache screen with device tracking
  - Insights screen with analytics
  - Demo data generator
  - Full TypeScript + ESLint + Prettier setup
  - Haptic feedback on all primary actions
  - Accessibility-compliant hit targets (≥44x44)
