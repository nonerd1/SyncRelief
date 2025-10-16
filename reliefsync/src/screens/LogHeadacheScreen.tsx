import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';
import { useTheme, Text, Screen } from '../theme';
import { useEpisodesFirebaseStore } from '../store/episodes-firebase';
import { useHabitsFirebaseStore } from '../store/habits-firebase';
import { CTAButton } from '../components/CTAButton';
import type { HeadacheLocation, HeadacheQuality, Trigger, HeadacheEpisode } from '../types/episode';

export const LogHeadacheScreen: React.FC = () => {
  const theme = useTheme();
  const { addEpisode, getAllEpisodes } = useEpisodesFirebaseStore();
  const { getLogForDate } = useHabitsFirebaseStore();

  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [todaysEpisodes, setTodaysEpisodes] = useState<HeadacheEpisode[]>([]);
  const [selectedEpisode, setSelectedEpisode] = useState<HeadacheEpisode | null>(null);

  const [startTime, setStartTime] = useState(new Date());
  const [durationHours, setDurationHours] = useState(2);
  const [intensity, setIntensity] = useState(5);
  const [location, setLocation] = useState<HeadacheLocation[]>([]);
  const [quality, setQuality] = useState<HeadacheQuality[]>([]);
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [notes, setNotes] = useState('');

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

  const getLocalDateString = (date: Date) => {
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().split('T')[0];
  };

  useEffect(() => {
    loadTodaysEpisodes();
  }, [startTime]); // Reload when date changes

  const loadTodaysEpisodes = async () => {
    try {
      const allEpisodes = await getAllEpisodes();
      console.log('All episodes:', allEpisodes?.length || 0);
      
      // Get start and end of the selected day (not necessarily today)
      const selectedDate = new Date(startTime);
      const dayStart = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        0, 0, 0, 0
      );
      const dayEnd = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        23, 59, 59, 999
      );

      //console.log('Filtering for date:', selectedDate.toLocaleDateString());
      //console.log('Day range:', dayStart, 'to', dayEnd);

      // Filter episodes for the selected day
      const filtered = allEpisodes.filter((ep) => {
        const epDate = new Date(ep.startTime);
        const isInRange = epDate >= dayStart && epDate <= dayEnd;
        // if (isInRange) {
        //   console.log('Found episode:', ep);
        // }
        return isInRange;
      });

      //console.log('Filtered episodes:', filtered.length);

      // Sort by newest first
      filtered.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

      setTodaysEpisodes(filtered);
    } catch (err) {
      console.error('Error loading episodes:', err);
    }
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

  const trackChange = () => {
    setHasUnsavedChanges(true);
  };

  const toggleLocation = (loc: HeadacheLocation) => {
    setLocation((prev) => (prev.includes(loc) ? prev.filter((l) => l !== loc) : [...prev, loc]));
    trackChange();
  };

  const toggleQuality = (qual: HeadacheQuality) => {
    setQuality((prev) => (prev.includes(qual) ? prev.filter((q) => q !== qual) : [...prev, qual]));
    trackChange();
  };

  const toggleTrigger = (trigger: Trigger) => {
    setTriggers((prev) =>
      prev.includes(trigger) ? prev.filter((t) => t !== trigger) : [...prev, trigger],
    );
    trackChange();
  };

  const handleAttachHabitLog = () => {
    const dateStr = getLocalDateString(startTime);
    const log = getLogForDate(dateStr);

    if (log) {
      setHabitLogAttached(true);
      Alert.alert('Success', `Habit log for ${dateStr} attached to this episode.`);
    } else {
      Alert.alert('No Habit Log', `No habit log found for ${dateStr}.`);
    }
  };

  const resetForm = () => {
    setStartTime(new Date());
    setDurationHours(1);
    setIntensity(1);
    setLocation([]);
    setQuality([]);
    setTriggers([]);
    setNotes('');
    setUsedDevice(false);
    setDeviceEffectiveness(1);
    setDeviceNotes('');
    setHabitLogAttached(false);
    setHasUnsavedChanges(false);
    setSelectedEpisode(null);
  };

  const handleSave = async (addAnother: boolean = false) => {
    if (location.length === 0) {
      Alert.alert('Missing Info', 'Please select at least one location.');
      return;
    }

    // Prevent logging future dates
    const now = new Date();
    if (startTime > now) {
      Alert.alert('Invalid Date', 'You cannot log episodes for future dates.');
      return;
    }

    setSaving(true);
    try {
      const episode: any = {
        startTime: startTime.toISOString(),
        durationMin: durationHours * 60,
        intensity,
        location,
        quality,
        triggers,
        usedDevice,
        barometricPressure: baroData.hPa,
        habitLogAttached,
      };

      if (usedDevice) {
        episode.deviceMode = deviceMode;
        episode.deviceDuration = deviceDuration;
        episode.deviceTemp = deviceTemp;
        episode.devicePressure = devicePressure;
        episode.devicePattern = devicePattern;
        episode.deviceEffectiveness = deviceEffectiveness;
        
        if (deviceNotes.trim()) {
          episode.deviceNotes = deviceNotes.trim();
        }
      }

      if (notes.trim()) {
        episode.notes = notes.trim();
      }

      await addEpisode(episode);
      await loadTodaysEpisodes();

      Alert.alert('Success', 'Headache episode saved successfully!', [
        {
          text: 'OK',
          onPress: () => {
            if (addAnother) {
              resetForm();
            } else {
              setHasUnsavedChanges(false);
            }
          },
        },
      ]);
    } catch (error) {
      console.error('Failed to save episode:', error);
      Alert.alert('Error', 'Failed to save episode. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (selectedDate) {
      // Prevent selecting future dates
      const now = new Date();
      if (selectedDate > now) {
        Alert.alert('Invalid Date', 'You cannot select a future date.');
        return;
      }

      const newDate = new Date(startTime);
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      
      // Check if date actually changed
      const dateChanged = 
        startTime.getDate() !== selectedDate.getDate() ||
        startTime.getMonth() !== selectedDate.getMonth() ||
        startTime.getFullYear() !== selectedDate.getFullYear();
      
      setStartTime(newDate);
      
      // Reset form to defaults when date changes
      if (dateChanged) {
        setDurationHours(1);
        setIntensity(1);
        setLocation([]);
        setQuality([]);
        setTriggers([]);
        setNotes('');
        setUsedDevice(false);
        setDeviceMode('Tension');
        setDeviceDuration(20);
        setDeviceTemp(30);
        setDevicePressure(1);
        setDevicePattern('Wave');
        setDeviceEffectiveness(1);
        setDeviceNotes('');
        setHabitLogAttached(false);
        setSelectedEpisode(null);
        setHasUnsavedChanges(false);
      } else {
        trackChange();
      }
    }
  };

  const handleSelectEpisode = (episode: HeadacheEpisode) => {
    setSelectedEpisode(episode);
    setShowHistoryModal(false);

    // Populate all form fields from the selected log
    setStartTime(new Date(episode.startTime));
    setDurationHours(episode.durationMin ? episode.durationMin / 60 : 2);
    setIntensity(episode.intensity);
    setLocation(episode.location || []);
    setQuality(episode.quality || []);
    setTriggers(episode.triggers || []);
    setUsedDevice(!!episode.usedDevice);
    setDeviceMode(episode.deviceMode || 'Tension');
    setDeviceDuration(episode.deviceDuration || 20);
    setDeviceTemp(episode.deviceTemp || 30);
    setDevicePressure(episode.devicePressure || 5);
    setDevicePattern(episode.devicePattern || 'Wave');
    setDeviceEffectiveness(episode.deviceEffectiveness || 5);
    setDeviceNotes(episode.deviceNotes || '');
    setNotes(episode.notes || '');
    setHabitLogAttached(!!episode.habitLogAttached);

    setHasUnsavedChanges(false);

    // Show success message
    Alert.alert(
      'Episode Loaded',
      'The form has been populated with data from this episode. You can review or edit it.',
      [{ text: 'OK' }]
    );
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    
    if (selectedTime) {
      const newTime = new Date(startTime);
      newTime.setHours(selectedTime.getHours());
      newTime.setMinutes(selectedTime.getMinutes());
      
      // Prevent selecting future times
      const now = new Date();
      if (newTime > now) {
        Alert.alert('Invalid Time', 'You cannot select a future time.');
        return;
      }
      
      setStartTime(newTime);
      trackChange();
    }
  };

  const locationOptions: HeadacheLocation[] = ['Frontal', 'Temporal', 'Occipital', 'Diffuse', 'One-sided'];
  const qualityOptions: HeadacheQuality[] = ['Throbbing', 'Pressure', 'Sharp', 'Dull', 'Aura'];
  const triggerOptions: Trigger[] = ['Sugar', 'Caffeine', 'Starch', 'Dairy', 'Skipped meal', 'Stress', 'Sleep loss', 'Barometric', 'Dehydration', 'Hormonal', 'Screen time', 'Other'];

  // Check if selected date is today
  const isToday = () => {
    const today = new Date();
    return (
      startTime.getDate() === today.getDate() &&
      startTime.getMonth() === today.getMonth() &&
      startTime.getFullYear() === today.getFullYear()
    );
  };

  return (
    <Screen>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.rsSurface, borderRadius: theme.radius.lg }]}>
          <View style={styles.headerContent}>
            <View style={{ flex: 1 }}>
              <Text variant="Caption" color={theme.colors.rsTextDim}>
                {isToday() ? 'Recording Episode' : 'Recording Past Episode'}
              </Text>
              <Text variant="H2" style={styles.headerTitle}>Log Headache</Text>
            </View>
            <View style={styles.headerRight}>
              {todaysEpisodes.length > 0 && (
                <TouchableOpacity
                  style={[styles.historyButton, { backgroundColor: theme.colors.rsBg, borderRadius: theme.radius.md }]}
                  onPress={() => setShowHistoryModal(true)}
                >
                  <Feather name="list" size={18} color={theme.colors.rsPrimary} />
                  <Text variant="Caption" color={theme.colors.rsPrimary} style={styles.historyCount}>
                    {todaysEpisodes.length}
                  </Text>
                </TouchableOpacity>
              )}

              {hasUnsavedChanges && (
                <View style={[styles.unsavedBadge, { backgroundColor: theme.colors.rsWarn + '20' }]}>
                  <Feather name="alert-circle" size={14} color={theme.colors.rsWarn} />
                  <Text variant="Caption" color={theme.colors.rsWarn}>Unsaved</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Date/Time Section */}
        <View style={[styles.section, { backgroundColor: theme.colors.rsSurface, borderRadius: theme.radius.lg }]}>
          <View style={styles.sectionHeader}>
            <Feather name="calendar" size={20} color={theme.colors.rsPrimary} />
            <Text variant="Title">Date & Time</Text>
          </View>

          <View style={styles.dateTimeGrid}>
            <TouchableOpacity
              style={[styles.dateTimeCard, { backgroundColor: theme.colors.rsBg, borderColor: theme.colors.rsBorder, borderRadius: theme.radius.md }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Feather name="calendar" size={18} color={theme.colors.rsTextDim} />
              <View style={styles.dateTimeInfo}>
                <Text variant="Caption" color={theme.colors.rsTextDim}>Date</Text>
                <Text variant="Body" color={theme.colors.rsText} style={styles.dateTimeValue}>
                  {startTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dateTimeCard, { backgroundColor: theme.colors.rsBg, borderColor: theme.colors.rsBorder, borderRadius: theme.radius.md }]}
              onPress={() => setShowTimePicker(true)}
            >
              <Feather name="clock" size={18} color={theme.colors.rsTextDim} />
              <View style={styles.dateTimeInfo}>
                <Text variant="Caption" color={theme.colors.rsTextDim}>Time</Text>
                <Text variant="Body" color={theme.colors.rsText} style={styles.dateTimeValue}>
                  {startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.field}>
            <Text variant="Body" color={theme.colors.rsText} style={styles.fieldLabel}>
              Duration: {durationHours} {durationHours === 1 ? 'hour' : 'hours'}
            </Text>
            <View style={styles.durationGrid}>
              {[0.5, 1, 2, 4, 6, 8, 12].map((hours) => (
                <TouchableOpacity
                  key={hours}
                  style={[
                    styles.durationOption,
                    {
                      backgroundColor: durationHours === hours ? theme.colors.rsPrimary : 'transparent',
                      borderRadius: theme.radius.md,
                      borderWidth: 1.5,
                      borderColor: durationHours === hours ? theme.colors.rsPrimary : theme.colors.rsBorder,
                    },
                  ]}
                  onPress={() => { setDurationHours(hours); trackChange(); }}
                  activeOpacity={0.7}
                >
                  <Text variant="Body" color={durationHours === hours ? theme.colors.rsBg : theme.colors.rsText} style={styles.durationText}>
                    {hours < 1 ? `${hours * 60}m` : `${hours}h`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Intensity */}
        <View style={[styles.section, { backgroundColor: theme.colors.rsSurface, borderRadius: theme.radius.lg }]}>
          <View style={styles.sectionHeader}>
            <Feather name="zap" size={20} color={theme.colors.rsPrimary} />
            <Text variant="Title">Pain Intensity</Text>
            <View style={[styles.badge, { backgroundColor: getBadgeColor(), borderRadius: theme.radius.pill, marginLeft: 'auto' }]}>
              <Text variant="Caption" color={theme.colors.rsBg} style={styles.badgeText}>{getIntensityBadge()}</Text>
            </View>
          </View>

          <View style={styles.field}>
            <View style={styles.intensityGrid}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.intensityOption,
                    {
                      backgroundColor: intensity === level ? getBadgeColor() : 'transparent',
                      borderRadius: theme.radius.sm,
                      borderWidth: 1.5,
                      borderColor: intensity === level ? getBadgeColor() : theme.colors.rsBorder,
                    },
                  ]}
                  onPress={() => { setIntensity(level); trackChange(); }}
                  activeOpacity={0.7}
                >
                  <Text variant="Body" color={intensity === level ? theme.colors.rsBg : theme.colors.rsText} style={styles.intensityText}>
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.sliderLabels}>
              <Text variant="Caption" color={theme.colors.rsTextDim}>Mild</Text>
              <Text variant="Caption" color={theme.colors.rsTextDim}>Severe</Text>
            </View>
          </View>
        </View>

        {/* Location */}
        <View style={[styles.section, { backgroundColor: theme.colors.rsSurface, borderRadius: theme.radius.lg }]}>
          <View style={styles.sectionHeader}>
            <Feather name="map-pin" size={20} color={theme.colors.rsPrimary} />
            <Text variant="Title">Pain Location</Text>
          </View>
          <View style={styles.chipsContainer}>
            {locationOptions.map((loc) => (
              <TouchableOpacity
                key={loc}
                style={[
                  styles.chip,
                  {
                    backgroundColor: location.includes(loc) ? theme.colors.rsPrimary : 'transparent',
                    borderColor: location.includes(loc) ? theme.colors.rsPrimary : theme.colors.rsBorder,
                    borderRadius: theme.radius.pill,
                    borderWidth: 1.5,
                  },
                ]}
                onPress={() => toggleLocation(loc)}
                activeOpacity={0.7}
              >
                <Text variant="Body" color={location.includes(loc) ? theme.colors.rsBg : theme.colors.rsText} style={styles.chipText}>
                  {loc}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quality */}
        <View style={[styles.section, { backgroundColor: theme.colors.rsSurface, borderRadius: theme.radius.lg }]}>
          <View style={styles.sectionHeader}>
            <Feather name="activity" size={20} color={theme.colors.rsPrimary} />
            <Text variant="Title">Pain Quality</Text>
          </View>
          <View style={styles.chipsContainer}>
            {qualityOptions.map((qual) => (
              <TouchableOpacity
                key={qual}
                style={[
                  styles.chip,
                  {
                    backgroundColor: quality.includes(qual) ? theme.colors.rsPrimary : 'transparent',
                    borderColor: quality.includes(qual) ? theme.colors.rsPrimary : theme.colors.rsBorder,
                    borderRadius: theme.radius.pill,
                    borderWidth: 1.5,
                  },
                ]}
                onPress={() => toggleQuality(qual)}
                activeOpacity={0.7}
              >
                <Text variant="Body" color={quality.includes(qual) ? theme.colors.rsBg : theme.colors.rsText} style={styles.chipText}>
                  {qual}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Triggers */}
        <View style={[styles.section, { backgroundColor: theme.colors.rsSurface, borderRadius: theme.radius.lg }]}>
          <View style={styles.sectionHeader}>
            <Feather name="alert-triangle" size={20} color={theme.colors.rsPrimary} />
            <Text variant="Title">Possible Triggers</Text>
          </View>
          <View style={styles.chipsContainer}>
            {triggerOptions.map((trigger) => (
              <TouchableOpacity
                key={trigger}
                style={[
                  styles.chip,
                  {
                    backgroundColor: triggers.includes(trigger) ? theme.colors.rsWarn : 'transparent',
                    borderColor: triggers.includes(trigger) ? theme.colors.rsWarn : theme.colors.rsBorder,
                    borderRadius: theme.radius.pill,
                    borderWidth: 1.5,
                  },
                ]}
                onPress={() => toggleTrigger(trigger)}
                activeOpacity={0.7}
              >
                <Text variant="Body" color={triggers.includes(trigger) ? theme.colors.rsBg : theme.colors.rsText} style={styles.chipText}>
                  {trigger}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notes */}
        <View style={[styles.section, { backgroundColor: theme.colors.rsSurface, borderRadius: theme.radius.lg }]}>
          <View style={styles.sectionHeader}>
            <Feather name="edit-3" size={20} color={theme.colors.rsPrimary} />
            <Text variant="Title">Additional Notes</Text>
          </View>
          <TextInput
            style={[styles.notesInput, { backgroundColor: theme.colors.rsBg, color: theme.colors.rsText, borderColor: theme.colors.rsBorder, borderRadius: theme.radius.md }]}
            value={notes}
            onChangeText={(text) => { setNotes(text); trackChange(); }}
            placeholder="Any observations or patterns you noticed..."
            placeholderTextColor={theme.colors.rsTextDim}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Save Buttons */}
        <View style={styles.saveSection}>
          <CTAButton variant="primary" title={saving ? 'Saving...' : 'Save Episode'} onPress={() => handleSave(false)} fullWidth disabled={saving} />
          <CTAButton variant="primary" title="Save & Add Another" onPress={() => handleSave(true)} fullWidth disabled={saving} />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <Modal visible={showDatePicker} transparent animationType="fade" onRequestClose={() => setShowDatePicker(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.pickerModal, { backgroundColor: theme.colors.rsSurface, borderRadius: theme.radius.lg }]}>
              <View style={styles.pickerHeader}>
                <Text variant="Title">Select Date</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Feather name="x" size={24} color={theme.colors.rsText} />
                </TouchableOpacity>
              </View>
              <DateTimePicker 
                value={startTime} 
                mode="date" 
                display="spinner" 
                onChange={handleDateChange} 
                textColor={theme.colors.rsText}
                maximumDate={new Date()} // Prevent future dates
              />
              <CTAButton variant="primary" title="Done" onPress={() => setShowDatePicker(false)} fullWidth />
            </View>
          </View>
        </Modal>
      )}

      {/* Time Picker Modal */}
      {showTimePicker && (
        <Modal visible={showTimePicker} transparent animationType="fade" onRequestClose={() => setShowTimePicker(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.pickerModal, { backgroundColor: theme.colors.rsSurface, borderRadius: theme.radius.lg }]}>
              <View style={styles.pickerHeader}>
                <Text variant="Title">Select Time</Text>
                <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                  <Feather name="x" size={24} color={theme.colors.rsText} />
                </TouchableOpacity>
              </View>
              <DateTimePicker 
                value={startTime} 
                mode="time" 
                display="spinner" 
                onChange={handleTimeChange} 
                textColor={theme.colors.rsText}
              />
              <CTAButton variant="primary" title="Done" onPress={() => setShowTimePicker(false)} fullWidth />
            </View>
          </View>
        </Modal>
      )}

      {/* Episodes History Modal */}
      <Modal visible={showHistoryModal} transparent animationType="slide" onRequestClose={() => setShowHistoryModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.historyModal, { backgroundColor: theme.colors.rsSurface, borderRadius: theme.radius.lg }]}>
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <Text variant="H2">
                  {isToday() ? "Today's Episodes" : "Episodes for " + startTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Text>
                <Text variant="Caption" color={theme.colors.rsTextDim}>
                  {todaysEpisodes.length} episode{todaysEpisodes.length !== 1 ? 's' : ''} logged
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowHistoryModal(false)} style={{ padding: 4 }}>
                <Feather name="x" size={24} color={theme.colors.rsText} />
              </TouchableOpacity>
            </View>

            {/* Content */}
            {todaysEpisodes.length === 0 ? (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Feather name="inbox" size={48} color={theme.colors.rsTextDim} />
                <Text variant="Body" color={theme.colors.rsTextDim} style={{ marginTop: 12, textAlign: 'center' }}>
                  No episodes logged for this date
                </Text>
              </View>
            ) : (
              <ScrollView 
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 16 }}
                showsVerticalScrollIndicator={true}
              >
                {todaysEpisodes.map((ep, index) => {
                  //console.log('Rendering episode:', index, ep.id);
                  return (
                    <TouchableOpacity
                      key={ep.id || `episode-${index}`}
                      onPress={() => handleSelectEpisode(ep)}
                      activeOpacity={0.7}
                      style={{ marginBottom: 12 }}
                    >
                      <View
                        style={{
                          backgroundColor: theme.colors.rsBg,
                          borderRadius: theme.radius.md,
                          borderLeftWidth: 4,
                          borderLeftColor:
                            ep.intensity <= 3
                              ? theme.colors.rsSecondary
                              : ep.intensity <= 7
                              ? theme.colors.rsWarn
                              : theme.colors.rsAlert,
                          padding: 16,
                        }}
                      >
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                          <Text variant="Title" color={theme.colors.rsText}>
                            Episode {todaysEpisodes.length - index}
                          </Text>
                          <Text variant="Caption" color={theme.colors.rsTextDim}>
                            {new Date(ep.startTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Text>
                        </View>

                        <View style={{ gap: 6 }}>
                          <Text variant="Body" color={theme.colors.rsText}>
                            Intensity: {ep.intensity}/10 • Duration: {Math.round((ep.durationMin || 0) / 60)}h
                          </Text>
                          {ep.location && ep.location.length > 0 && (
                            <Text variant="Caption" color={theme.colors.rsTextDim}>
                              {ep.location.join(', ')}
                            </Text>
                          )}
                          {ep.quality && ep.quality.length > 0 && (
                            <Text variant="Caption" color={theme.colors.rsTextDim}>
                              {ep.quality.join(', ')}
                            </Text>
                          )}
                          {ep.triggers && ep.triggers.length > 0 && (
                            <Text variant="Caption" color={theme.colors.rsTextDim}>
                              {ep.triggers.join(', ')}
                            </Text>
                          )}
                          {ep.usedDevice && (
                            <Text variant="Caption" color={theme.colors.rsSecondary}>
                             Device Used (Effectiveness: {ep.deviceEffectiveness}/10)
                            </Text>
                          )}
                          {ep.notes && (
                            <Text variant="Caption" color={theme.colors.rsTextDim} numberOfLines={2}>
                              {ep.notes}
                            </Text>
                          )}
                        </View>

                        <View style={{ paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.colors.rsBorder, marginTop: 12 }}>
                          <Text variant="Caption" color={theme.colors.rsPrimary} style={{ fontWeight: '600' }}>
                            Tap to view full details →
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            {/* Footer */}
            <View style={{ paddingTop: 16 }}>
              <CTAButton variant="secondary" title="Close" onPress={() => setShowHistoryModal(false)} fullWidth />
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, gap: 16 },
  header: { padding: 20 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerTitle: { marginTop: 4 },
  headerRight: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  historyButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12 },
  historyCount: { fontWeight: '600' },
  unsavedBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12 },
  section: { padding: 20, gap: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: -4 },
  field: { gap: 12 },
  fieldLabel: { fontWeight: '600' },
  dateTimeGrid: { flexDirection: 'row', gap: 12 },
  dateTimeCard: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderWidth: 1.5 },
  dateTimeInfo: { flex: 1, gap: 4 },
  dateTimeValue: { fontWeight: '600' },
  durationGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  durationOption: { width: '13.5%', padding: 14, alignItems: 'center', justifyContent: 'center', minHeight: 52 },
  durationText: { fontWeight: '600' },
  badge: { paddingHorizontal: 12, paddingVertical: 6 },
  badgeText: { fontWeight: '600', fontSize: 11 },
  intensityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  intensityOption: { width: '17%', padding: 12, alignItems: 'center', justifyContent: 'center', minHeight: 44 },
  intensityText: { fontWeight: '600' },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -4 },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 18, paddingVertical: 10 },
  chipText: { fontWeight: '600' },
  notesInput: { minHeight: 100, borderWidth: 1.5, paddingHorizontal: 16, paddingVertical: 14, textAlignVertical: 'top' },
  saveSection: { gap: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  pickerModal: { width: '100%', maxWidth: 400, padding: 24, gap: 20 },
  pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyModal: { width: '90%', maxWidth: 440, height: '70%', padding: 24 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  episodesList: { flex: 1, marginVertical: 12 },
  episodesListContent: { gap: 12, paddingBottom: 8 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  episodeCard: { padding: 16, gap: 12 },
  episodeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  episodeDetails: { gap: 8 },
  episodeFooter: { paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', marginTop: 4 },
  historyFooter: { paddingTop: 8 },
});