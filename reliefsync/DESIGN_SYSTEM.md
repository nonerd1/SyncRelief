# ReliefSync Design System

## ✅ Implementation Complete

The ReliefSync design system has been fully implemented with dark theme tokens, typography, and spacing system.

---

## 🎨 Design Tokens

### Colors (Dark Theme)

```typescript
rsBg: '#0F1115'; // Background
rsSurface: '#151923'; // Cards & surfaces
rsPrimary: '#7DD3FC'; // Primary cyan
rsPrimary600: '#38BDF8'; // Primary darker
rsSecondary: '#A3E635'; // Secondary lime
rsAlert: '#F43F5E'; // Error/alert red
rsWarn: '#F59E0B'; // Warning orange
rsText: '#E5E7EB'; // Primary text
rsTextDim: '#9CA3AF'; // Secondary text
rsBorder: '#253042'; // Borders
```

### Spacing

```typescript
xs: 4px
sm: 8px
md: 12px
lg: 16px
xl: 20px
2xl: 24px
```

### Border Radius

```typescript
sm: 8px
md: 12px
lg: 16px
pill: 999px
```

### Text Styles

```typescript
H1:      { size: 28, lineHeight: 34, weight: "600" }
H2:      { size: 20, lineHeight: 26, weight: "600" }
Title:   { size: 18, lineHeight: 24, weight: "500" }
Body:    { size: 15, lineHeight: 22, weight: "400" }
Caption: { size: 12, lineHeight: 16, weight: "400" }
```

---

## 🛠 Theme System

### ThemeProvider

Wraps the entire app and provides theme context:

```tsx
import { ThemeProvider } from './src/theme';

function App() {
  return <ThemeProvider>{/* Your app */}</ThemeProvider>;
}
```

### useTheme Hook

Access theme tokens anywhere:

```tsx
import { useTheme } from './src/theme';

function MyComponent() {
  const theme = useTheme();

  return (
    <View style={{ backgroundColor: theme.colors.rsSurface }}>
      <Text style={{ color: theme.colors.rsText }}>Hello</Text>
    </View>
  );
}
```

---

## 📦 Components

### Screen Container

Safe area wrapper with background:

```tsx
import { Screen } from './src/theme';

function MyScreen() {
  return <Screen>{/* Content automatically has rsBg and safe area */}</Screen>;
}
```

### Text with Variants

Typography-aware text component:

```tsx
import { Text } from './src/theme';

<Text variant="H1">Heading</Text>
<Text variant="H2">Subheading</Text>
<Text variant="Title">Title</Text>
<Text variant="Body">Body text</Text>
<Text variant="Caption" color="#custom">Small text</Text>
```

**Available Variants:**

- `H1` - Large headings (28px, 600 weight)
- `H2` - Medium headings (20px, 600 weight)
- `Title` - Section titles (18px, 500 weight)
- `Body` - Default text (15px, 400 weight)
- `Caption` - Small text (12px, 400 weight)

---

## 🎯 Component Library

All components use the design system automatically:

### CTAButton

```tsx
<CTAButton
  title="Save"
  onPress={handleSave}
  variant="primary" // primary | secondary | outline
  fullWidth
  loading={isLoading}
/>
```

### StatPill

```tsx
<StatPill
  label="This Week"
  value={7}
  variant="error" // default | success | warning | error
  trend="up" // up | down | neutral
/>
```

### ToggleRow

```tsx
<ToggleRow
  label="Enable Notifications"
  description="Get reminders to log"
  value={enabled}
  onValueChange={setEnabled}
/>
```

### SliderRow

```tsx
<SliderRow
  label="Pain Level"
  value={pain}
  onValueChange={setPain}
  minimumValue={1}
  maximumValue={10}
  showValue
/>
```

### SegmentedControl

```tsx
<SegmentedControl
  options={['Week', 'Month', 'Year']}
  selectedIndex={selected}
  onIndexChange={setSelected}
/>
```

### RatingBar

```tsx
<RatingBar
  label="Severity"
  value={severity}
  onValueChange={setSeverity}
  minValue={1}
  maxValue={10}
/>
```

---

## 🎨 Color Usage Guide

### Backgrounds

- **rsBg** - Main app background
- **rsSurface** - Cards, containers, elevated surfaces

### Text

- **rsText** - Primary content text
- **rsTextDim** - Secondary, less important text

### Interaction Colors

- **rsPrimary** - Main actions, selected states, links (cyan)
- **rsPrimary600** - Hover/pressed states
- **rsSecondary** - Success states, positive actions (lime)
- **rsAlert** - Errors, destructive actions, high severity (red)
- **rsWarn** - Warnings, medium severity (orange)

### Borders

- **rsBorder** - Dividers, input borders, subtle separators

---

## 📏 Spacing Guidelines

Use theme spacing for consistency:

```tsx
const theme = useTheme();

<View style={{ padding: theme.spacing.md }}>        // 12px
<View style={{ marginBottom: theme.spacing.lg }}>  // 16px
<View style={{ gap: theme.spacing.sm }}>           // 8px
```

**Common Patterns:**

- Card padding: `md` (12px) or `lg` (16px)
- Section margins: `lg` (16px) or `xl` (20px)
- Element gaps: `sm` (8px) or `md` (12px)
- Tight spacing: `xs` (4px)

---

## 🔄 Border Radius

Apply consistent corner rounding:

```tsx
<View style={{ borderRadius: theme.radius.md }}>   // 12px - default
<View style={{ borderRadius: theme.radius.sm }}>   // 8px - small
<View style={{ borderRadius: theme.radius.lg }}>   // 16px - large
<View style={{ borderRadius: theme.radius.pill }}> // 999px - fully rounded
```

**Usage:**

- Cards/containers: `md` (12px)
- Buttons: `md` (12px)
- Small elements: `sm` (8px)
- Pills/tags: `pill` (999px)

---

## ✨ Examples

### Themed Card

```tsx
const theme = useTheme();

<View
  style={{
    backgroundColor: theme.colors.rsSurface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  }}
>
  <Text variant="Title">Card Title</Text>
  <Text variant="Body" color={theme.colors.rsTextDim}>
    Card content goes here
  </Text>
</View>;
```

### Themed Input

```tsx
<TextInput
  style={{
    backgroundColor: theme.colors.rsBg,
    borderColor: theme.colors.rsBorder,
    borderWidth: 1,
    borderRadius: theme.radius.sm,
    color: theme.colors.rsText,
    padding: theme.spacing.md,
    fontSize: theme.textStyles.Body.size,
  }}
  placeholderTextColor={theme.colors.rsTextDim}
/>
```

---

## 📋 Migration Checklist

All components have been updated to use the new design system:

✅ **Theme System**

- [x] ThemeProvider implemented
- [x] useTheme hook available
- [x] Screen container component
- [x] Text component with variants

✅ **Components**

- [x] CTAButton
- [x] StatPill
- [x] ToggleRow
- [x] SliderRow
- [x] SegmentedControl
- [x] RatingBar
- [x] BottomNav

✅ **Screens**

- [x] HomeScreen
- [x] LogHabitsScreen
- [x] LogHeadacheScreen
- [x] InsightsScreen

✅ **App Configuration**

- [x] NavigationContainer themed
- [x] StatusBar configured
- [x] TypeScript validation passing

---

## 🚀 Next Steps

1. **Run the app**: `npm start`
2. **Test components**: Navigate through all screens
3. **Customize colors**: Edit `src/theme/tokens.ts` as needed
4. **Add animations**: Consider using react-native-reanimated
5. **Light mode**: Create light theme variant (optional)

---

**Status**: ✅ Design system fully implemented and type-safe!
