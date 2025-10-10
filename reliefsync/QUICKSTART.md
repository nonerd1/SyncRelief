# 🚀 Quick Start Guide

## Start the App (2 minutes)

### Option 1: iOS Simulator

```bash
cd reliefsync
npm start
# Press 'i' when Metro bundler opens
```

### Option 2: Android Emulator

```bash
cd reliefsync
npm start
# Press 'a' when Metro bundler opens
```

### Option 3: Physical Device

```bash
cd reliefsync
npm start
# Scan QR code with Expo Go app
```

## What You'll See

### 1️⃣ Home Screen

- Welcome message
- Stats pills (This Week, Avg Severity)
- Quick action buttons
- Recent episodes list (empty initially)

### 2️⃣ Log Habits Tab

- Daily habit tracking
- Empty state with tip
- Toggle switches for each habit

### 3️⃣ Log Headache Tab

- Pain severity rating (1-10)
- Location selector
- Duration input
- Notes field
- Save button

### 4️⃣ Insights Tab

- Episode stats
- Week/Month toggle
- Chart placeholder
- Pattern analysis info

## Try It Out

1. **Log a headache**:
   - Tap "🤕 Headache" tab
   - Select severity: 7
   - Choose location: "Left"
   - Enter duration: 120
   - Add note: "After long screen time"
   - Tap "Save Headache Log"

2. **Check Home**:
   - Return to "🏠 Home" tab
   - See your logged episode in the list
   - Stats will update

3. **View Insights**:
   - Tap "📊 Insights" tab
   - See updated stats
   - Toggle between Week/Month

## Customize

### Add Default Habits

Edit `src/screens/LogHabitsScreen.tsx`:

```typescript
// Around line 40, add:
useEffect(() => {
  if (habits.length === 0) {
    addHabit({ name: 'Drank 8 glasses water', type: 'boolean', order: 1 });
    addHabit({ name: 'Slept 7+ hours', type: 'boolean', order: 2 });
    addHabit({ name: 'Limited screen time', type: 'boolean', order: 3 });
  }
}, []);
```

### Adjust Theme Colors

Edit `src/theme/tokens.ts`:

```typescript
export const colors = {
  primary: '#YOUR_COLOR', // Change brand color
  accent: '#YOUR_COLOR', // Change accent
  // ... rest
};
```

## Common Tasks

### Check for Errors

```bash
npm run typecheck  # TypeScript
npm run lint       # ESLint
```

### Format Code

```bash
npm run format
```

### Reset Storage (Dev)

In App.tsx, temporarily add:

```typescript
import { storage } from './src/lib/storage';
// In AppInitializer useEffect:
await storage.clear(); // ⚠️ Remove after testing!
```

## Troubleshooting

### Metro bundler won't start

```bash
rm -rf node_modules
npm install
npm start -- --clear
```

### TypeScript errors in editor

```bash
# Restart TS server in VS Code: Cmd+Shift+P → "Restart TS Server"
```

### "Module not found" errors

```bash
npx expo install --fix
```

## Next Steps

1. ✅ Run the app and explore all 4 screens
2. ✅ Log a test headache
3. ✅ Verify data persists (close app, reopen)
4. 📝 Customize colors/fonts to your liking
5. 📝 Add seed habits for testing
6. 📝 Integrate Victory charts in Insights
7. 📝 Add more validation rules

---

**Need Help?** Check `PROJECT_OVERVIEW.md` for architecture details.
