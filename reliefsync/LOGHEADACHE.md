# LogHeadacheScreen Implementation

## ✅ Comprehensive Episode Tracking with Device Integration

Full-featured headache episode logging with detailed tracking, device usage, and habit log integration.

---

## 📋 **HeadacheEpisode Type** (`src/types/episode.ts`)

```typescript
interface HeadacheEpisode {
  id: string;
  startTime: string; // ISO datetime
  durationMin: number; // 0-1440 (24 hours in minutes)
  intensity: number; // 0-10
  timestamp: number;

  // Multi-select arrays
  location: HeadacheLocation[]; // Frontal, Temporal, Occipital, Diffuse, One-sided
  quality: HeadacheQuality[]; // Throbbing, Pressure, Sharp, Dull, Aura
  triggers: Trigger[]; // 12 possible triggers

  // Device usage
  usedDevice: boolean;
  deviceMode?: string; // Mode from session (Tension, Migraine, etc.)
  deviceDuration?: number; // Session duration in minutes
  deviceTemp?: number; // Temperature in celsius
  devicePressure?: number; // 0-10 scale
  devicePattern?: string; // Wave, Pulse, Knead
  deviceEffectiveness?: number; // 1-10 rating
  deviceNotes?: string;

  // Additional context
  barometricPressure?: number;
  habitLogAttached?: boolean;
  notes?: string;
}
```

### Enums

**HeadacheLocation**

- Frontal
- Temporal
- Occipital
- Diffuse
- One-sided

**HeadacheQuality**

- Throbbing
- Pressure
- Sharp
- Dull
- Aura

**Trigger** (12 options)

- Sugar
- Caffeine
- Starch
- Dairy
- Skipped meal
- Stress
- Sleep loss
- Barometric
- Dehydration
- Hormonal
- Screen time
- Other

---

## 🗄 **Episodes Store** (`src/store/episodes.ts`)

### Methods

```typescript
interface EpisodesState {
  headacheEpisodes: HeadacheEpisode[];

  // Add new episode
  addHeadacheEpisode(episode: Omit<HeadacheEpisode, 'id' | 'timestamp'>): Promise<void>;

  // Update existing episode
  updateHeadacheEpisode(id: string, updates: Partial<HeadacheEpisode>): Promise<void>;

  // Delete episode
  deleteHeadacheEpisode(id: string): Promise<void>;

  // Get episodes for specific date
  getHeadacheEpisodesForDate(date: string): HeadacheEpisode[];

  // Get all episodes sorted by timestamp
  getAllHeadacheEpisodes(): HeadacheEpisode[];

  // Initialize from AsyncStorage
  initialize(): Promise<void>;

  // Persist to AsyncStorage
  persist(): Promise<void>;
}
```

### Persistence

- **Storage Key**: `'headache_episodes'`
- **Format**: JSON array of HeadacheEpisode objects
- **Auto-save**: On add/update/delete operations
- **Sorted**: By timestamp (newest first)

---

## 🎨 **UI Layout**

### When Section 📅

**Date Picker**

- Tappable button showing: "Dec 9, 2025"
- Opens native date picker on tap
- iOS: Spinner style
- Android: Default calendar

**Time Picker**

- Tappable button showing: "2:30 PM"
- Opens native time picker on tap
- Updates startTime with selected value

**Duration Slider**

- Range: 0-24 hours
- Display: "X hours"
- Internal: Converts to minutes for storage

### Intensity Section 🔥

**Auto Badge**

- **Mild** (0-3): Green (`rsSecondary`)
- **Moderate** (4-7): Orange (`rsWarn`)
- **Severe** (8-10): Red (`rsAlert`)
- Updates in real-time as slider moves

**Pain Level Slider**

- Range: 0-10
- Display: "X/10"

### Location Section 📍

**Multi-select Chips**

- All 5 location options
- Can select multiple (e.g., "Temporal" + "One-sided")
- Selected: `rsPrimary` background, `rsBg` text
- Unselected: `rsBg` background, `rsText` text

### Quality Section 💫

**Multi-select Chips**

- All 5 quality descriptors
- Can select multiple (e.g., "Throbbing" + "Sharp")
- Same styling as location chips

### Triggers Section ⚠️

**Multi-select Chips**

- All 12 possible triggers
- Select as many as applicable
- Wraps to multiple rows
- Same chip styling pattern

### Device Usage Section 🎧

**Toggle**

- "Used Relief Device" with sublabel
- When OFF: Only toggle shown
- When ON: Full device details appear

**Device Details** (conditional, shown when usedDevice = true)

Display Summary:

```
Mode: Tension
Duration: 20 min

Temp: 30°C    Pressure: 5/10    Pattern: Wave
```

**Effectiveness Rating**

- Label: "Effectiveness Rating"
- RatingBar: 1-10 dots
- Updates in real-time

**Device Notes**

- Multiline TextInput (2 lines minimum)
- Placeholder: "Device session notes..."
- Optional field

### Notes Section 📝

**General Notes**

- Multiline TextInput (4 lines minimum)
- Placeholder: "Additional observations..."
- Optional field

### Actions

**Primary**

- "Save Episode" button
- Validates: At least one location must be selected
- Shows success/error alert
- Persists to AsyncStorage

**Primary Alternative**

- "Save & Add Another" button
- Same validation as Save
- After successful save: Resets form to defaults
- Allows quick logging of multiple episodes

**Secondary (Ghost)**

- "Attach Today's Habit Log" button
- Checks if habit log exists for startTime date
- If exists: Sets habitLogAttached flag + success alert
- If not exists: Shows "No Habit Log" alert
- Button text changes to "Habit Log Attached ✓" when attached

---

## 🔄 **Data Flow**

### On Screen Load

```
1. Initialize episodes store from AsyncStorage
2. Load barometric snapshot
3. Set defaults:
   - startTime: now
   - duration: 2 hours
   - intensity: 5
   - All arrays: empty
   - usedDevice: false
```

### On Save

```
1. Validate: location.length > 0
2. Build HeadacheEpisode object
3. Convert duration from hours to minutes
4. Include device fields only if usedDevice = true
5. Call addHeadacheEpisode(episode)
6. Store persists to AsyncStorage
7. Show success alert
```

### On Save & Add Another

```
1-7. Same as Save
8. Reset form to defaults
9. User can immediately log another episode
```

### On Attach Habit Log

```
1. Extract date from startTime
2. Call getLogForDate(date)
3. If log exists:
   - Set habitLogAttached = true
   - Show success alert
4. If no log:
   - Show "No Habit Log" alert
```

---

## 🎯 **Form Defaults**

```typescript
startTime: new Date();
durationMin: 2; // hours (120 minutes stored)
intensity: 5;
location: [];
quality: [];
triggers: [];
usedDevice: false;
notes: '';
habitLogAttached: false;

// Device defaults (used when enabled)
deviceMode: 'Tension';
deviceDuration: 20;
deviceTemp: 30;
devicePressure: 5;
devicePattern: 'Wave';
deviceEffectiveness: 5;
deviceNotes: '';
```

---

## 🎨 **UI Styling**

### Card Structure

```typescript
backgroundColor: theme.colors.rsSurface (#151923)
borderRadius: theme.radius.md (12px)
padding: 16px
gap: 16px
```

### Date/Time Buttons

```typescript
backgroundColor: theme.colors.rsBg (#0F1115)
borderColor: theme.colors.rsBorder (#253042)
borderRadius: theme.radius.sm (8px)
borderWidth: 1
padding: 12px 16px
```

### Intensity Badge

```typescript
// Dynamic based on intensity level
borderRadius: theme.radius.pill (999px)
paddingHorizontal: 12px
paddingVertical: 4px
fontWeight: 600
```

### Chips (Location/Quality/Triggers)

```typescript
// Selected
backgroundColor: theme.colors.rsPrimary (#7DD3FC)
color: theme.colors.rsBg (#0F1115)
borderRadius: theme.radius.pill (999px)
borderWidth: 1

// Unselected
backgroundColor: theme.colors.rsBg (#0F1115)
color: theme.colors.rsText (#E5E7EB)
borderColor: theme.colors.rsBorder (#253042)
```

### Section Dividers

```typescript
height: 1px
backgroundColor: '#27272F'
```

---

## 📊 **Integration Points**

### With Device Session (HomeScreen)

When user logs effectiveness rating on HomeScreen:

- Episode created with deviceEffectiveness field
- Captures mode, duration, temp, pressure, pattern
- Links device session to headache tracking

### With Habit Log (LogHabitsScreen)

"Attach Today's Habit Log" button:

- Searches for habit log matching episode date
- If found: Sets habitLogAttached = true
- Enables correlation analysis later
- E.g., "Did skipping meals + poor sleep trigger this headache?"

### With Barometric Data

Auto-captures pressure:

- Calls `getBarometricSnapshot()` on load
- Stores hPa value with episode
- Useful for identifying barometric pressure triggers

---

## ✅ **Validation Rules**

### Required Fields

- **Location**: At least one must be selected
- Validation error: "Please select at least one location."

### Optional Fields

- Quality (can be empty array)
- Triggers (can be empty array)
- Device fields (only when usedDevice = true)
- Notes (optional text)
- Habit log (optional attachment)

### Date/Time

- startTime: Cannot be in the future (not enforced yet)
- Duration: 0-24 hours

---

## 🔍 **Example Usage**

### Logging a Migraine with Device

```typescript
await addHeadacheEpisode({
  startTime: '2025-01-10T14:30:00.000Z',
  durationMin: 180, // 3 hours
  intensity: 8,
  location: ['Temporal', 'One-sided'],
  quality: ['Throbbing', 'Aura'],
  triggers: ['Stress', 'Sleep loss', 'Screen time'],
  usedDevice: true,
  deviceMode: 'Migraine',
  deviceDuration: 30,
  deviceTemp: 28,
  devicePressure: 7,
  devicePattern: 'Pulse',
  deviceEffectiveness: 7,
  deviceNotes: 'Relief after 20 minutes',
  barometricPressure: 1008,
  habitLogAttached: true,
  notes: 'Stressful day at work, too much screen time',
});
```

### Logging a Tension Headache

```typescript
await addHeadacheEpisode({
  startTime: '2025-01-10T09:00:00.000Z',
  durationMin: 120, // 2 hours
  intensity: 4,
  location: ['Frontal', 'Occipital'],
  quality: ['Pressure', 'Dull'],
  triggers: ['Stress', 'Dehydration'],
  usedDevice: false,
  barometricPressure: 1013,
  habitLogAttached: false,
  notes: 'Drank water and it helped',
});
```

---

## 📱 **Platform Considerations**

### iOS

- DateTimePicker: Spinner style (inline)
- Better native feel
- Scrollable picker wheels

### Android

- DateTimePicker: Default calendar/clock
- Modal dialogs
- Native material design

### Both

- Full keyboard support
- Accessibility labels
- Touch targets: 48x48 minimum

---

## 🚀 **Status**

✅ **Types defined** with Zod validation  
✅ **Store implemented** with AsyncStorage  
✅ **UI complete** with all sections  
✅ **DateTime pickers** working (iOS/Android)  
✅ **Multi-select chips** for location/quality/triggers  
✅ **Device integration** with conditional display  
✅ **Effectiveness rating** with RatingBar  
✅ **Habit log attachment** feature  
✅ **Auto badge** for intensity levels  
✅ **Validation** for required fields  
✅ **Alerts** for user feedback  
✅ **TypeScript** fully typed and validated

**Ready to track detailed headache episodes with device integration!**
