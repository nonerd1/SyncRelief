import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme, Text, Screen } from '../theme';
import { useEpisodesFirebaseStore } from '../store/episodes-firebase';
import { useHabitsFirebaseStore } from '../store/habits-firebase';
import { CTAButton } from '../components/CTAButton';
import { SliderRow } from '../components/SliderRow';
import { ToggleRow } from '../components/ToggleRow';
import { RatingBar } from '../components/RatingBar';
import { getBarometricSnapshot } from '../lib/baro';
import type { HeadacheLocation, HeadacheQuality, Trigger } from '../types/episode';

export const LogHeadacheScreen: React.FC = () => {
  const theme = useTheme();
  const { addEpisode } = useEpisodesFirebaseStore();
  const { getLogForDate } = useHabitsFirebaseStore();

  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Basic fields
  const [startTime, setStartTime] = useState(new Date());
  const [durationMin, setDurationMin] = useState(2);
  const [intensity, setIntensity] = useState(5);
  const [location, setLocation] = useState<HeadacheLocation[]>([]);
  const [quality, setQuality] = useState<HeadacheQuality[]>([]);
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [notes, setNotes] = useState('');

  // Device usage
  const [usedDevice, setUsedDevice] = useState(false);
  const [deviceMode, setDeviceMode] = useState('Tension');
  const [deviceDuration, setDeviceDuration] = useState(20);
  const [deviceTemp, setDeviceTemp] = useState(30);
  const [devicePressure, setDevicePressure] = useState(5);
  const [devicePattern, setDevicePattern] = useState('Wave');
  const [deviceEffectiveness, setDeviceEffectiveness] = useState(5);
  const [deviceNotes, setDeviceNotes] = useState('');

  const [baroData, setBaroData] = useState({ hPa: 1013, label: 'Neutral' });
  const [habitLogAttached, setHabitLogAttached] = useState(false);

  useEffect(() => {
    loadBaroData();
  }, []);

  const loadBaroData = async () => {
    const data = await getBarometricSnapshot();
    setBaroData(data);
  };

  const getIntensityBadge = () => {
    if (intensity <= 3) return 'Mild';
    if (intensity <= 7) return 'Moderate';
    return 'Severe';
  };

  const getBadgeColor = () => {
    if (intensity <= 3) return theme.colors.rsSecondary;
    if (intensity <= 7) return theme.colors.rsWarn;
    return theme.colors.rsAlert;
  };

  const toggleLocation = (loc: HeadacheLocation) => {
    setLocation((prev) => (prev.includes(loc) ? prev.filter((l) => l !== loc) : [...prev, loc]));
  };

  const toggleQuality = (qual: HeadacheQuality) => {
    setQuality((prev) => (prev.includes(qual) ? prev.filter((q) => q !== qual) : [...prev, qual]));
  };

  const toggleTrigger = (trigger: Trigger) => {
    setTriggers((prev) =>
      prev.includes(trigger) ? prev.filter((t) => t !== trigger) : [...prev, trigger],
    );
  };

  const handleAttachHabitLog = () => {
    const today = new Date(startTime).toISOString().split('T')[0];
    const log = getLogForDate(today);

    if (log) {
      setHabitLogAttached(true);
      Alert.alert('Success', `Habit log for ${today} attached to this episode.`);
    } else {
      Alert.alert('No Habit Log', `No habit log found for ${today}.`);
    }
  };

  const resetForm = () => {
    setStartTime(new Date());
    setDurationMin(2);
    setIntensity(5);
    setLocation([]);
    setQuality([]);
    setTriggers([]);
    setNotes('');
    setUsedDevice(false);
    setDeviceEffectiveness(5);
    setDeviceNotes('');
    setHabitLogAttached(false);
  };

  const handleSave = async (addAnother: boolean = false) => {
    if (location.length === 0) {
      Alert.alert('Missing Info', 'Please select at least one location.');
      return;
    }

    setSaving(true);
    try {
      // Build the episode object with required fields
      const episode: any = {
        startTime: startTime.toISOString(),
        durationMin: durationMin * 60,
        intensity,
        location,
        quality,
        triggers,
        usedDevice,
        barometricPressure: baroData.hPa,
        habitLogAttached,
      };

      // Only add device fields if device was used
      if (usedDevice) {
        episode.deviceMode = deviceMode;
        episode.deviceDuration = deviceDuration;
        episode.deviceTemp = deviceTemp;
        episode.devicePressure = devicePressure;
        episode.devicePattern = devicePattern;
        episode.deviceEffectiveness = deviceEffectiveness;
        
        // Only add device notes if they exist
        if (deviceNotes.trim()) {
          episode.deviceNotes = deviceNotes.trim();
        }
      }

      // Only add notes if they exist
      if (notes.trim()) {
        episode.notes = notes.trim();
      }

      await addEpisode(episode);

      Alert.alert('Success', 'Headache episode saved!');

      if (addAnother) {
        resetForm();
      }
    } catch (error) {
      console.error('Failed to save episode:', error);
      Alert.alert('Error', 'Failed to save episode. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const onDateChange = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const newDate = new Date(startTime);
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      setStartTime(newDate);
    }
  };

  const onTimeChange = (_event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newTime = new Date(startTime);
      newTime.setHours(selectedTime.getHours());
      newTime.setMinutes(selectedTime.getMinutes());
      setStartTime(newTime);
    }
  };

  const locationOptions: HeadacheLocation[] = [
    'Frontal',
    'Temporal',
    'Occipital',
    'Diffuse',
    'One-sided',
  ];
  const qualityOptions: HeadacheQuality[] = ['Throbbing', 'Pressure', 'Sharp', 'Dull', 'Aura'];
  const triggerOptions: Trigger[] = [
    'Sugar',
    'Caffeine',
    'Starch',
    'Dairy',
    'Skipped meal',
    'Stress',
    'Sleep loss',
    'Barometric',
    'Dehydration',
    'Hormonal',
    'Screen time',
    'Other',
  ];

  return (
    <Screen>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Date/Time Section */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.colors.rsSurface, borderRadius: theme.radius.md },
          ]}
        >
          <Text variant="Title" style={styles.sectionTitle}>
            📅 When
          </Text>

          <View style={styles.dateTimeRow}>
            <TouchableOpacity
              style={[
                styles.dateTimeButton,
                {
                  backgroundColor: theme.colors.rsBg,
                  borderColor: theme.colors.rsBorder,
                  borderRadius: theme.radius.sm,
                },
              ]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text variant="Body">
                {startTime.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.dateTimeButton,
                {
                  backgroundColor: theme.colors.rsBg,
                  borderColor: theme.colors.rsBorder,
                  borderRadius: theme.radius.sm,
                },
              ]}
              onPress={() => setShowTimePicker(true)}
            >
              <Text variant="Body">
                {startTime.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={startTime}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={startTime}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onTimeChange}
            />
          )}

          <SliderRow
            label="Duration"
            sublabel={`${durationMin} hours`}
            value={durationMin}
            onChange={(val) => setDurationMin(Math.round(val * 2.4))}
          />
        </View>

        {/* Intensity Section */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.colors.rsSurface, borderRadius: theme.radius.md },
          ]}
        >
          <View style={styles.intensityHeader}>
            <Text variant="Title">🔥 Intensity</Text>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: getBadgeColor(),
                  borderRadius: theme.radius.pill,
                },
              ]}
            >
              <Text variant="Caption" color={theme.colors.rsBg} style={styles.badgeText}>
                {getIntensityBadge()}
              </Text>
            </View>
          </View>

          <SliderRow
            label="Pain Level"
            sublabel={`${intensity}/10`}
            value={intensity}
            onChange={setIntensity}
          />
        </View>

        {/* Location Section */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.colors.rsSurface, borderRadius: theme.radius.md },
          ]}
        >
          <Text variant="Title" style={styles.sectionTitle}>
            📍 Location
          </Text>

          <View style={styles.chipsContainer}>
            {locationOptions.map((loc) => (
              <TouchableOpacity
                key={loc}
                style={[
                  styles.chip,
                  {
                    backgroundColor: location.includes(loc)
                      ? theme.colors.rsPrimary
                      : theme.colors.rsBg,
                    borderColor: theme.colors.rsBorder,
                    borderRadius: theme.radius.pill,
                  },
                ]}
                onPress={() => toggleLocation(loc)}
              >
                <Text
                  variant="Caption"
                  color={location.includes(loc) ? theme.colors.rsBg : theme.colors.rsText}
                >
                  {loc}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quality Section */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.colors.rsSurface, borderRadius: theme.radius.md },
          ]}
        >
          <Text variant="Title" style={styles.sectionTitle}>
            💫 Quality
          </Text>

          <View style={styles.chipsContainer}>
            {qualityOptions.map((qual) => (
              <TouchableOpacity
                key={qual}
                style={[
                  styles.chip,
                  {
                    backgroundColor: quality.includes(qual)
                      ? theme.colors.rsPrimary
                      : theme.colors.rsBg,
                    borderColor: theme.colors.rsBorder,
                    borderRadius: theme.radius.pill,
                  },
                ]}
                onPress={() => toggleQuality(qual)}
              >
                <Text
                  variant="Caption"
                  color={quality.includes(qual) ? theme.colors.rsBg : theme.colors.rsText}
                >
                  {qual}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Triggers Section */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.colors.rsSurface, borderRadius: theme.radius.md },
          ]}
        >
          <Text variant="Title" style={styles.sectionTitle}>
            ⚠️ Possible Triggers
          </Text>

          <View style={styles.chipsContainer}>
            {triggerOptions.map((trigger) => (
              <TouchableOpacity
                key={trigger}
                style={[
                  styles.chip,
                  {
                    backgroundColor: triggers.includes(trigger)
                      ? theme.colors.rsPrimary
                      : theme.colors.rsBg,
                    borderColor: theme.colors.rsBorder,
                    borderRadius: theme.radius.pill,
                  },
                ]}
                onPress={() => toggleTrigger(trigger)}
              >
                <Text
                  variant="Caption"
                  color={triggers.includes(trigger) ? theme.colors.rsBg : theme.colors.rsText}
                >
                  {trigger}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Device Usage Section */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.colors.rsSurface, borderRadius: theme.radius.md },
          ]}
        >
          <Text variant="Title" style={styles.sectionTitle}>
            🎧 Device Usage
          </Text>

          <ToggleRow
            label="Used Relief Device"
            sublabel="Did you use the device during this episode?"
            value={usedDevice}
            onValueChange={setUsedDevice}
          />

          {usedDevice && (
            <>
              <View style={styles.divider} />

              <View style={styles.fieldRow}>
                <Text variant="Body" color={theme.colors.rsTextDim}>
                  Mode: {deviceMode}
                </Text>
                <Text variant="Body" color={theme.colors.rsTextDim}>
                  Duration: {deviceDuration} min
                </Text>
              </View>

              <View style={styles.fieldRow}>
                <Text variant="Body" color={theme.colors.rsTextDim}>
                  Temp: {deviceTemp}°C
                </Text>
                <Text variant="Body" color={theme.colors.rsTextDim}>
                  Pressure: {devicePressure}/10
                </Text>
                <Text variant="Body" color={theme.colors.rsTextDim}>
                  Pattern: {devicePattern}
                </Text>
              </View>

              <View style={styles.divider} />

              <Text variant="Body" color={theme.colors.rsText} style={styles.effectivenessLabel}>
                Effectiveness Rating
              </Text>
              <RatingBar value={deviceEffectiveness} onChange={setDeviceEffectiveness} />

              <TextInput
                style={[
                  styles.notesInput,
                  {
                    backgroundColor: theme.colors.rsBg,
                    color: theme.colors.rsText,
                    borderColor: theme.colors.rsBorder,
                    borderRadius: theme.radius.sm,
                    fontSize: theme.textStyles.Caption.size,
                  },
                ]}
                value={deviceNotes}
                onChangeText={setDeviceNotes}
                placeholder="Device session notes..."
                placeholderTextColor={theme.colors.rsTextDim}
                multiline
                numberOfLines={2}
              />
            </>
          )}
        </View>

        {/* Notes Section */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.colors.rsSurface, borderRadius: theme.radius.md },
          ]}
        >
          <Text variant="Title" style={styles.sectionTitle}>
            📝 Notes
          </Text>

          <TextInput
            style={[
              styles.notesInput,
              {
                backgroundColor: theme.colors.rsBg,
                color: theme.colors.rsText,
                borderColor: theme.colors.rsBorder,
                borderRadius: theme.radius.sm,
                fontSize: theme.textStyles.Body.size,
              },
            ]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Additional observations..."
            placeholderTextColor={theme.colors.rsTextDim}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <CTAButton
            variant="primary"
            title={saving ? 'Saving...' : 'Save Episode'}
            onPress={() => handleSave(false)}
            fullWidth
            disabled={saving}
          />
        </View>

        <View style={styles.section}>
          <CTAButton
            variant="primary"
            title="Save & Add Another"
            onPress={() => handleSave(true)}
            fullWidth
            disabled={saving}
          />
        </View>

        <View style={styles.section}>
          <CTAButton
            variant="secondary"
            title={habitLogAttached ? 'Habit Log Attached ✓' : "Attach Today's Habit Log"}
            onPress={handleAttachHabitLog}
            fullWidth
          />
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 12,
  },
  section: {
    gap: 12,
  },
  card: {
    padding: 16,
    gap: 16,
  },
  sectionTitle: {
    marginBottom: -4,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateTimeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  intensityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: -4,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: {
    fontWeight: '600',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#27272F',
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  effectivenessLabel: {
    marginBottom: -4,
  },
  notesInput: {
    minHeight: 80,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    textAlignVertical: 'top',
  },
});