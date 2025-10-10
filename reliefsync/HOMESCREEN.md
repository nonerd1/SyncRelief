# HomeScreen Full Implementation

## ✅ Complete Implementation

Full-featured device control screen with session management, real-time controls, and effectiveness rating system.

---

## 🗂 **Session Store** (`src/store/session.ts`)

### State Management

```typescript
interface SessionState {
  // Session control
  sessionActive: boolean;
  mode: 'Tension' | 'Migraine' | 'Sinus' | 'Cluster' | 'Custom';
  pressure: number; // 0-10
  massage: number; // 0-10
  massagePattern: 'Wave' | 'Pulse' | 'Knead';
  heat: boolean;
  cold: boolean;
  temperatureC: number; // 20-42
  elapsedSec: number;
  sessionStartTime: number | null;
  sessionDurationMin: number | null;

  // Actions
  setMode(mode: HeadacheMode): void;
  setPressure(pressure: number): void;
  setMassage(massage: number): void;
  setMassagePattern(pattern: MassagePattern): void;
  setHeat(heat: boolean): void;
  setCold(cold: boolean): void;
  setTemperature(temp: number): void;

  startSession(durationMin?: number): void;
  pauseSession(): void;
  stopSession(): void;
  updateElapsed(): void;
  resetElapsed(): void;

  persistSettings(): void;
}
```

### Key Features

- **Auto-increment timer**: Updates `elapsedSec` every second when active
- **Mutual exclusion**: Heat/cold toggle - one turns off when the other activates
- **Persistence**: Settings auto-save to AsyncStorage on change (debounced)
- **Session tracking**: Tracks start time, duration, and elapsed time

---

## 📡 **Barometric Pressure** (`src/lib/baro.ts`)

### API

```typescript
export const getBarometricSnapshot = async (): Promise<{
  hPa: number;
  label: string;
}>;
```

### Mock Implementation

- Returns `1013 hPa` with label `"Neutral"`
- Labels: "Low" (<1000), "Neutral" (1000-1020), "High" (>1020)
- Ready for real weather API or device sensor integration

---

## 🏠 **HomeScreen Layout**

### Top Bar

- App title: "ReliefSync"
- BT status dot (gray placeholder)
- Settings icon (no-op tap)

### Summary Row

3 `StatPill` components:

1. **Session** - `mm:ss` elapsed time
2. **Mode** - Current headache mode
3. **Temp** - Temperature in °C

### Controls Card

**Mode Selection**

- `SegmentedControl` with 5 options: Tension, Migraine, Sinus, Cluster, Custom

**Pressure Control**

- `SliderRow` (0-10) with numeric chip display

**Massage Control**

- `SliderRow` (0-10) with numeric chip
- Pattern selector: `SegmentedControl` (Wave, Pulse, Knead)

**Temperature Control**

- Heat/Cold toggles (mutually exclusive)
- Temperature slider (20-42°C)
- Safety warning: "⚠️ Start low, increase gradually. Max 20 min sessions."

### Quick Actions

**Primary Row** (3 buttons):

- Start 10 min
- Start 20 min
- Start 30 min

**Secondary Row** (2 buttons):

- Start Custom (uses custom duration)
- Save As Preset (no-op)

### Barometric Card

- Current pressure in hPa
- Label (Low/Neutral/High)
- Auto-loads on mount

### Sticky Footer

**When Inactive**:

- Single "Start Session" button (starts with default duration)

**When Active**:

- Elapsed time display (mm:ss)
- Pause button (pauses timer)
- Stop button (opens rating modal if ≥10 min)

---

## ⭐ **Rating Modal**

### Trigger Conditions

1. **Manual**: User taps "Stop" button after 10+ min session
2. **Auto**: Session reaches 10 minutes (600 seconds)

### Modal Content

- Title: "Rate Effectiveness"
- Subtitle: "How effective was this session?"
- `RatingBar` (1-10 scale)
- Value display: "X/10"
- Notes `TextInput` (optional, multiline)
- Buttons: "Skip" | "Save"

### Data Persistence

**On Save**:

```typescript
await addEpisode({
  date: today,
  severity: 0,
  duration: sessionDurationMinutes,
  location: 'front',
  triggers: [],
  notes: `Device session: ${mode}`,
  barometricPressure: currentHPa,
  deviceEffectiveness: {
    rating: 1 - 10,
    notes: 'optional string',
    sessionDuration: elapsedSeconds,
    mode: 'Tension' | etc,
  },
});
```

**On Skip**:

- Modal closes
- Rating state resets
- No data saved

---

## 🔄 **State Persistence**

### Session Settings (AsyncStorage)

Auto-saved on change:

- `mode`
- `pressure`
- `massage`
- `massagePattern`
- `heat`
- `cold`
- `temperatureC`

Storage key: `'session_settings'`

### Episode with Effectiveness (AsyncStorage)

Saved on rating modal submit:

- Standard episode fields
- **New**: `deviceEffectiveness` object with rating, notes, duration, mode

Storage key: `STORAGE_KEYS.EPISODES`

---

## 🎨 **UI Details**

### Colors Used

- Surface: `rsSurface` (#151923)
- Background: `rsBg` (#0F1115)
- Primary: `rsPrimary` (#7DD3FC) / `rsPrimary600` (#38BDF8)
- Text: `rsText` (#E5E7EB), `rsTextDim` (#9CA3AF)
- Borders: `rsBorder` (#253042)
- Warning: `rsWarn` (#F59E0B)

### Layout

- Vertical spacing: `gap: 12` (AutoLayout-style)
- Card padding: `16px`
- Section padding: `20px`
- Dividers: 1px solid with `rsBorder`
- Modal overlay: `rgba(0, 0, 0, 0.8)`

### Sticky Footer

- `position: absolute`
- `bottom: 0`, `left: 0`, `right: 0`
- Border top: 1px `rsBorder`
- Padding: `16px`

---

## 📊 **Episode Type Extension**

Updated `src/types/episode.ts`:

```typescript
export const EpisodeSchema = z.object({
  // ... existing fields
  deviceEffectiveness: z
    .object({
      rating: z.number().min(1).max(10),
      notes: z.string().optional(),
      sessionDuration: z.number(),
      mode: z.string(),
    })
    .optional(),
});
```

---

## 🔧 **Timer Implementation**

### Interval Management

```typescript
let intervalId: NodeJS.Timeout | null = null;

startSession: () => {
  intervalId = setInterval(() => {
    updateElapsed();
  }, 1000);
};

pauseSession: () => {
  clearInterval(intervalId);
  intervalId = null;
};

stopSession: () => {
  clearInterval(intervalId);
  intervalId = null;
  // Clear session data
};
```

### Elapsed Display

- Format: `MM:SS` (zero-padded)
- Updates every second
- Shown in summary pill and footer

---

## ✅ **Testing Checklist**

### Basic Controls

- [ ] Mode switcher updates state
- [ ] Pressure slider works (0-10)
- [ ] Massage slider works (0-10)
- [ ] Pattern selector updates (Wave/Pulse/Knead)
- [ ] Heat toggle works (turns off cold)
- [ ] Cold toggle works (turns off heat)
- [ ] Temperature slider works (20-42°C)

### Session Management

- [ ] Quick action buttons start timer (10/20/30 min)
- [ ] Custom duration starts session
- [ ] Timer increments every second
- [ ] Pause button stops timer
- [ ] Resume continues from paused time
- [ ] Stop button ends session

### Rating Modal

- [ ] Modal appears when stopping ≥10 min session
- [ ] Modal appears auto at 10 min mark
- [ ] Rating bar updates value
- [ ] Notes input accepts text
- [ ] Save button persists to episodes store
- [ ] Skip button closes without saving

### Persistence

- [ ] Settings persist across app restarts
- [ ] Last mode/pressure/massage restored
- [ ] Episodes saved with deviceEffectiveness field

### UI/UX

- [ ] Barometric data loads on mount
- [ ] Footer sticks to bottom
- [ ] ScrollView scrolls properly
- [ ] Modal overlay darkens screen
- [ ] All text readable with theme colors

---

## 🚀 **Status**

✅ **Session Store**: Fully implemented with timer  
✅ **Barometric API**: Mock ready for real integration  
✅ **HomeScreen UI**: Complete with all controls  
✅ **Rating Modal**: 10+ min trigger with persistence  
✅ **State Persistence**: Auto-save settings to AsyncStorage  
✅ **TypeScript**: All types defined and validated  
✅ **Formatting**: Code auto-formatted with Prettier

**Ready to test!** The app should now have a fully functional home screen with device control.
