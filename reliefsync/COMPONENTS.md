# ReliefSync Components Documentation

## ✅ All 7 Components Built & Integrated

---

## 1️⃣ CTAButton

**File**: `src/components/CTAButton.tsx`

**Props**:

```typescript
{
  variant: 'primary' | 'secondary';
  title: string;
  onPress: () => void;
  fullWidth?: boolean;
  disabled?: boolean;
}
```

**Specs**:

- **Primary**: Fill `rsPrimary600`, text `rsBg`
- **Secondary**: Stroke `rsBorder`, text `rsText`
- Border radius: `12px`
- Height: `48px`

**Usage**:

```tsx
<CTAButton variant="primary" title="Save" onPress={handleSave} fullWidth />
<CTAButton variant="secondary" title="Cancel" onPress={handleCancel} />
```

---

## 2️⃣ StatPill

**File**: `src/components/StatPill.tsx`

**Props**:

```typescript
{
  value: string;
  icon?: ReactNode;
}
```

**Specs**:

- Height: `28px`
- Pill radius (`999px`)
- Stroke `rsBorder`, bg `rsSurface`
- Text `rsTextDim`
- Optional icon slot (16×16)

**Usage**:

```tsx
<StatPill value="7 episodes" />
<StatPill value="Avg 5/10" icon={<Icon />} />
```

---

## 3️⃣ SegmentedControl

**File**: `src/components/SegmentedControl.tsx`

**Props**:

```typescript
{
  options: string[];
  value: string;
  onChange: (value: string) => void;
}
```

**Specs**:

- Pill-shaped items
- **Active**: Fill `rsPrimary`, text `rsBg`
- **Inactive**: Stroke `rsBorder`, text `rsText`
- Height: `32px`

**Usage**:

```tsx
<SegmentedControl options={['Week', 'Month', 'Year']} value={timeRange} onChange={setTimeRange} />
```

---

## 4️⃣ ToggleRow

**File**: `src/components/ToggleRow.tsx`

**Props**:

```typescript
{
  label: string;
  sublabel?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}
```

**Specs**:

- Height: `56px`
- Divider bottom using `rsBorder`
- Switch with `rsPrimary` active, `rsBorder` inactive
- Thumb: `rsPrimary600` when on, `rsTextDim` when off

**Usage**:

```tsx
<ToggleRow
  label="Enable Notifications"
  sublabel="Get daily reminders"
  value={enabled}
  onValueChange={setEnabled}
/>
```

---

## 5️⃣ SliderRow

**File**: `src/components/SliderRow.tsx`

**Props**:

```typescript
{
  label: string;
  value: number;
  onChange: (value: number) => void;
  sublabel?: string;
}
```

**Specs**:

- Range: `0-10`
- Numeric chip on right with `rsPrimary600` background
- Track: `rsPrimary` (filled), `rsBorder` (unfilled)
- Thumb: `rsPrimary600`

**Usage**:

```tsx
<SliderRow label="Pain Level" sublabel="Current intensity" value={pain} onChange={setPain} />
```

---

## 6️⃣ RatingBar

**File**: `src/components/RatingBar.tsx`

**Props**:

```typescript
{
  value: number;
  onChange: (value: number) => void;
}
```

**Specs**:

- Row of 10 dots (8×8px each)
- **Selected**: Fill `rsPrimary600`
- **Unselected**: Stroke `rsBorder`, transparent fill
- Gap: `8px` between dots

**Usage**:

```tsx
<RatingBar value={severity} onChange={setSeverity} />
```

---

## 7️⃣ BottomNav (Tab Bar Integration)

**File**: `src/components/BottomNav.tsx`

**Exports**:

- `createTabIcon()` - Factory for icon components
- `TextTabIcon` - Text/emoji based icons
- `getTabBarOptions()` - Tab bar styling helper

**Implementation in App.tsx**:

```tsx
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

<Tab.Navigator
  screenOptions={{
    tabBarActiveTintColor: theme.colors.rsPrimary600,
    tabBarInactiveTintColor: theme.colors.rsTextDim,
    tabBarStyle: {
      backgroundColor: theme.colors.rsSurface,
      borderTopColor: theme.colors.rsBorder,
    },
  }}
>
  <Tab.Screen
    name="Home"
    component={HomeScreen}
    options={{
      tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} />,
    }}
  />
</Tab.Navigator>;
```

---

## 🎨 Design System Integration

All components use:

- **Colors**: From `theme.colors` (rsBg, rsSurface, rsPrimary, etc.)
- **Radius**: From `theme.radius` (sm: 8, md: 12, lg: 16, pill: 999)
- **Spacing**: From `theme.spacing` (xs: 4, sm: 8, md: 12, lg: 16, xl: 20, 2xl: 24)
- **Typography**: Via `<Text variant="..." />` component

---

## 📱 Screens Layout

All screens use:

```tsx
<Screen>
  <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
    {/* Auto-layout with vertical gap: 12 */}
  </ScrollView>
</Screen>
```

---

## 🔄 Tab Navigation

**4 Tabs Configured**:

1. **Home** (🏠)
   - Icon: `Feather/home`
   - Shows stats, recent episodes, quick actions

2. **LogHabits** (📝)
   - Icon: `MaterialCommunityIcons/notebook-outline`
   - Daily habit tracking with toggles

3. **LogHeadache** (🤕)
   - Icon: `MaterialCommunityIcons/head-alert-outline`
   - Full episode logging form

4. **Insights** (📊)
   - Icon: `Feather/bar-chart-2`
   - Analytics and trends

---

## ✅ Implementation Status

| Component        | Built | Typed | Integrated | Tested |
| ---------------- | ----- | ----- | ---------- | ------ |
| CTAButton        | ✅    | ✅    | ✅         | ✅     |
| StatPill         | ✅    | ✅    | ✅         | ✅     |
| SegmentedControl | ✅    | ✅    | ✅         | ✅     |
| ToggleRow        | ✅    | ✅    | ✅         | ✅     |
| SliderRow        | ✅    | ✅    | ✅         | ✅     |
| RatingBar        | ✅    | ✅    | ✅         | ✅     |
| BottomNav        | ✅    | ✅    | ✅         | ✅     |

---

## 🚀 Running the App

```bash
npm start
```

Then:

- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan QR code for physical device

**Verify**:

1. All 4 tabs appear at bottom
2. Tab icons change color when selected
3. Tapping tabs switches screens
4. Each screen shows placeholder content

---

**Status**: ✅ All components built to spec and fully functional!
