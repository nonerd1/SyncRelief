import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme, Text, Screen } from '../theme';
import { useHabitsFirebaseStore } from '../store/habits-firebase';
import { CTAButton } from '../components/CTAButton';
import { getBarometricSnapshot } from '../lib/baro';
import type { HabitLog } from '../types/habit';

export const LogHabitsScreen: React.FC = () => {
  const theme = useTheme();
  const { addHabitLog, getLogForDate, getAllLogs } = useHabitsFirebaseStore();

  // Helper function to get local date string without timezone issues
  const getLocalDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper to format date for display without timezone issues
  const formatDisplayDate = (dateString: string): string => {
    // console.log('Formatting date string:', dateString);
    const [year, month, day] = dateString.split('-').map(Number);
    // console.log('Parsed parts:', { year, month, day });
    const date = new Date(year, month - 1, day); // Create date in local timezone
    // console.log('Created date object:', date);
    
    const formatted = date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
    // console.log('Formatted result:', formatted);
    return formatted;
  };

  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(getLocalDateString(today));
  const [saving, setSaving] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(today);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [allLogs, setAllLogs] = useState<HabitLog[]>([]);

  // Diet
  const [sugar, setSugar] = useState<'None' | 'Low' | 'Medium' | 'High'>('None');
  const [starch, setStarch] = useState(false);
  const [dairy, setDairy] = useState(false);
  const [caffeine, setCaffeine] = useState<'None' | '1' | '2' | '3+'>('None');
  const [hydration, setHydration] = useState<'Poor' | 'OK' | 'Good'>('OK');
  const [skippedMeals, setSkippedMeals] = useState(false);

  // Sleep
  const [sleepDuration, setSleepDuration] = useState(7);
  const [sleepQuality, setSleepQuality] = useState<'Poor' | 'Fair' | 'Good'>('Fair');

  // Stress
  const [stress, setStress] = useState(5);

  // Exercise
  const [exercise, setExercise] = useState(false);
  const [exerciseIntensity, setExerciseIntensity] = useState<'Low' | 'Med' | 'High'>('Med');

  // Environment
  const [baroData, setBaroData] = useState({ hPa: 1013, label: 'Neutral' });
  const [weather, setWeather] = useState<('Dry' | 'Humid' | 'Rain' | 'Windy')[]>([]);

  // Menstruation
  const [menstruation, setMenstruation] = useState(false);
  const [menstruationPhase, setMenstruationPhase] = useState<'Off' | 'Pre' | 'On' | 'Post'>('Off');

  // Notes
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadBaroData();
    // Load all logs from Firebase on mount
    const logs = getAllLogs();
    setAllLogs(logs);
  }, []);

  useEffect(() => {
    loadLogForDate(selectedDate);
  }, [selectedDate]);

  // Listen for changes to logs from Firebase
  useEffect(() => {
    const logs = getAllLogs();
    setAllLogs(logs);
  }, [getAllLogs]);

  const loadBaroData = async () => {
    const data = await getBarometricSnapshot();
    setBaroData(data);
  };

  const loadLogForDate = (date: string) => {
    console.log('Loading log for date:', date);
    const log = getLogForDate(date);
    console.log('Found log:', log ? 'Yes' : 'No');
    
    if (log) {
      setSugar(log.sugar);
      setStarch(log.starch);
      setDairy(log.dairy);
      setCaffeine(log.caffeine);
      setHydration(log.hydration);
      setSkippedMeals(log.skippedMeals);
      setSleepDuration(log.sleepDuration);
      setSleepQuality(log.sleepQuality);
      setStress(log.stress);
      setExercise(log.exercise);
      setExerciseIntensity(log.exerciseIntensity || 'Med');
      setWeather(log.weather);
      setMenstruation(log.menstruation);
      setMenstruationPhase(log.menstruationPhase || 'Off');
      setNotes(log.notes || '');
      setHasUnsavedChanges(false);
    } else {
      resetForm();
    }
  };

  const resetForm = () => {
    setSugar('None');
    setStarch(false);
    setDairy(false);
    setCaffeine('None');
    setHydration('OK');
    setSkippedMeals(false);
    setSleepDuration(7);
    setSleepQuality('Fair');
    setStress(5);
    setExercise(false);
    setExerciseIntensity('Med');
    setWeather([]);
    setMenstruation(false);
    setMenstruationPhase('Off');
    setNotes('');
    setHasUnsavedChanges(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const log: any = {
        date: selectedDate,
        sugar,
        starch,
        dairy,
        caffeine,
        hydration,
        skippedMeals,
        sleepDuration,
        sleepQuality,
        stress,
        exercise,
        barometricPressure: baroData.hPa,
        weather,
        menstruation,
      };

      if (exercise && exerciseIntensity) {
        log.exerciseIntensity = exerciseIntensity;
      }
      
      if (menstruation && menstruationPhase) {
        log.menstruationPhase = menstruationPhase;
      }
      
      if (notes.trim()) {
        log.notes = notes.trim();
      }

      await addHabitLog(log);
      
      // Refresh all logs from Firebase after saving
      const updatedLogs = getAllLogs();
      setAllLogs(updatedLogs);
      
      Alert.alert('Success', 'Daily log saved successfully!', [
        {
          text: 'OK',
          onPress: () => {
            resetForm();
            const todayDate = new Date();
            setSelectedDate(getLocalDateString(todayDate));
          },
        },
      ]);
    } catch (error) {
      console.error('Failed to save log:', error);
      Alert.alert('Error', 'Failed to save log. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const trackChange = () => {
    setHasUnsavedChanges(true);
  };

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const hasLogForDate = (date: string) => {
    // Check in the allLogs state which comes from Firebase
    return allLogs.some(log => log.date === date);
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateStr = getLocalDateString(newDate);
    console.log('Selected day:', day);
    console.log('Selected date string:', dateStr);
    setSelectedDate(dateStr);
    setShowCalendar(false);
  };

  const changeMonth = (direction: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1));
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
    const days = [];
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dateStr = getLocalDateString(dayDate);
      
      const hasLog = hasLogForDate(dateStr);
      const isSelected = dateStr === selectedDate;
      
      const todayDate = new Date();
      const isToday = dateStr === getLocalDateString(todayDate);

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.calendarDay,
            isSelected && { backgroundColor: theme.colors.rsPrimary },
            !isSelected && hasLog && { backgroundColor: theme.colors.rsSecondary + '30', borderWidth: 2, borderColor: theme.colors.rsSecondary },
            isToday && !isSelected && !hasLog && { borderColor: theme.colors.rsPrimary, borderWidth: 2 },
          ]}
          onPress={() => handleDateSelect(day)}
        >
          <Text
            variant="Body"
            color={isSelected ? theme.colors.rsBg : (hasLog && !isSelected ? theme.colors.rsSecondary : theme.colors.rsText)}
            style={styles.calendarDayText}
          >
            {day}
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.calendarGrid}>
        {/* Week day headers */}
        {weekDays.map((day) => (
          <View key={day} style={styles.weekDayHeader}>
            <Text variant="Caption" color={theme.colors.rsTextDim}>
              {day}
            </Text>
          </View>
        ))}
        {/* Days */}
        {days}
      </View>
    );
  };

  const updateValue = (setter: Function, value: any) => {
    setter(value);
    trackChange();
  };

  return (
    <Screen>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header with Date Selector */}
        <View style={[styles.header, { backgroundColor: theme.colors.rsSurface, borderRadius: theme.radius.lg }]}>
          <View style={styles.headerTop}>
            <View>
              <Text variant="Caption" color={theme.colors.rsTextDim}>
                Logging for
              </Text>
              <Text variant="H2" style={styles.headerDate}>
                {formatDisplayDate(selectedDate)}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.calendarButton, { backgroundColor: theme.colors.rsBg, borderRadius: theme.radius.md }]}
              onPress={() => setShowCalendar(true)}
            >
              <Feather name="calendar" size={20} color={theme.colors.rsPrimary} />
            </TouchableOpacity>
          </View>

          {hasUnsavedChanges && (
            <View style={[styles.unsavedBadge, { backgroundColor: theme.colors.rsWarn + '20' }]}>
              <Feather name="alert-circle" size={14} color={theme.colors.rsWarn} />
              <Text variant="Caption" color={theme.colors.rsWarn}>
                Unsaved changes
              </Text>
            </View>
          )}
        </View>

        {/* Form Sections */}
        <View style={[styles.section, { backgroundColor: theme.colors.rsSurface, borderRadius: theme.radius.lg }]}>
          <View style={styles.sectionHeader}>
            <Feather name="coffee" size={20} color={theme.colors.rsPrimary} />
            <Text variant="Title">Diet & Nutrition</Text>
          </View>

          <View style={styles.field}>
            <Text variant="Body" color={theme.colors.rsText} style={styles.fieldLabel}>
              Sugar Intake
            </Text>
            <View style={styles.optionGrid}>
              {(['None', 'Low', 'Medium', 'High'] as const).map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionCard,
                    {
                      backgroundColor: sugar === option ? theme.colors.rsPrimary : 'transparent',
                      borderRadius: theme.radius.md,
                      borderWidth: 1.5,
                      borderColor: sugar === option ? theme.colors.rsPrimary : theme.colors.rsBorder,
                    },
                  ]}
                  onPress={() => updateValue(setSugar, option)}
                  activeOpacity={0.7}
                >
                  <Text
                    variant="Body"
                    color={sugar === option ? theme.colors.rsBg : theme.colors.rsText}
                    style={styles.optionText}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text variant="Body" color={theme.colors.rsText} style={styles.fieldLabel}>
              Food Groups
            </Text>
            <View style={styles.toggleGrid}>
              <TouchableOpacity
                style={[
                  styles.toggleCard,
                  {
                    backgroundColor: starch ? theme.colors.rsPrimary + '20' : 'transparent',
                    borderRadius: theme.radius.md,
                    borderWidth: 1.5,
                    borderColor: starch ? theme.colors.rsPrimary : theme.colors.rsBorder,
                  },
                ]}
                onPress={() => updateValue(setStarch, !starch)}
                activeOpacity={0.7}
              >
                <Text style={styles.toggleIcon}>🍞</Text>
                <Text variant="Caption" color={starch ? theme.colors.rsPrimary : theme.colors.rsText}>
                  Starch
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.toggleCard,
                  {
                    backgroundColor: dairy ? theme.colors.rsPrimary + '20' : 'transparent',
                    borderRadius: theme.radius.md,
                    borderWidth: 1.5,
                    borderColor: dairy ? theme.colors.rsPrimary : theme.colors.rsBorder,
                  },
                ]}
                onPress={() => updateValue(setDairy, !dairy)}
                activeOpacity={0.7}
              >
                <Text style={styles.toggleIcon}>🧀</Text>
                <Text variant="Caption" color={dairy ? theme.colors.rsPrimary : theme.colors.rsText}>
                  Dairy
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.field}>
            <Text variant="Body" color={theme.colors.rsText} style={styles.fieldLabel}>
              Caffeine (Cups)
            </Text>
            <View style={styles.optionGrid}>
              {(['None', '1', '2', '3+'] as const).map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionCard,
                    {
                      backgroundColor: caffeine === option ? theme.colors.rsPrimary : 'transparent',
                      borderRadius: theme.radius.md,
                      borderWidth: 1.5,
                      borderColor: caffeine === option ? theme.colors.rsPrimary : theme.colors.rsBorder,
                    },
                  ]}
                  onPress={() => updateValue(setCaffeine, option)}
                  activeOpacity={0.7}
                >
                  <Text
                    variant="Body"
                    color={caffeine === option ? theme.colors.rsBg : theme.colors.rsText}
                    style={styles.optionText}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text variant="Body" color={theme.colors.rsText} style={styles.fieldLabel}>
              Hydration Level
            </Text>
            <View style={styles.optionGrid}>
              {(['Poor', 'OK', 'Good'] as const).map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionCard,
                    {
                      backgroundColor: hydration === option ? theme.colors.rsPrimary : 'transparent',
                      borderRadius: theme.radius.md,
                      borderWidth: 1.5,
                      borderColor: hydration === option ? theme.colors.rsPrimary : theme.colors.rsBorder,
                    },
                  ]}
                  onPress={() => updateValue(setHydration, option)}
                  activeOpacity={0.7}
                >
                  <Text
                    variant="Body"
                    color={hydration === option ? theme.colors.rsBg : theme.colors.rsText}
                    style={styles.optionText}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.checkboxRow,
              {
                backgroundColor: skippedMeals ? theme.colors.rsAlert + '15' : 'transparent',
                borderRadius: theme.radius.md,
                borderWidth: 1.5,
                borderColor: skippedMeals ? theme.colors.rsAlert : theme.colors.rsBorder,
              },
            ]}
            onPress={() => updateValue(setSkippedMeals, !skippedMeals)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, { borderColor: skippedMeals ? theme.colors.rsAlert : theme.colors.rsBorder }]}>
              {skippedMeals && <Feather name="check" size={16} color={theme.colors.rsAlert} />}
            </View>
            <Text variant="Body" color={theme.colors.rsText}>
              Skipped Meals Today
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sleep Section */}
        <View style={[styles.section, { backgroundColor: theme.colors.rsSurface, borderRadius: theme.radius.lg }]}>
          <View style={styles.sectionHeader}>
            <Feather name="moon" size={20} color={theme.colors.rsPrimary} />
            <Text variant="Title">Sleep Quality</Text>
          </View>

          <View style={styles.field}>
            <Text variant="Body" color={theme.colors.rsText} style={styles.fieldLabel}>
              Hours Slept
            </Text>
            <View style={styles.numberGrid}>
              {[4, 5, 6, 7, 8, 9, 10].map((hours) => (
                <TouchableOpacity
                  key={hours}
                  style={[
                    styles.numberCard,
                    {
                      backgroundColor: sleepDuration === hours ? theme.colors.rsPrimary : 'transparent',
                      borderRadius: theme.radius.md,
                      borderWidth: 1.5,
                      borderColor: sleepDuration === hours ? theme.colors.rsPrimary : theme.colors.rsBorder,
                    },
                  ]}
                  onPress={() => updateValue(setSleepDuration, hours)}
                  activeOpacity={0.7}
                >
                  <Text
                    variant="Title"
                    color={sleepDuration === hours ? theme.colors.rsBg : theme.colors.rsText}
                  >
                    {hours}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text variant="Body" color={theme.colors.rsText} style={styles.fieldLabel}>
              Sleep Quality
            </Text>
            <View style={styles.optionGrid}>
              {(['Poor', 'Fair', 'Good'] as const).map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionCard,
                    {
                      backgroundColor: sleepQuality === option ? theme.colors.rsPrimary : 'transparent',
                      borderRadius: theme.radius.md,
                      borderWidth: 1.5,
                      borderColor: sleepQuality === option ? theme.colors.rsPrimary : theme.colors.rsBorder,
                    },
                  ]}
                  onPress={() => updateValue(setSleepQuality, option)}
                  activeOpacity={0.7}
                >
                  <Text
                    variant="Body"
                    color={sleepQuality === option ? theme.colors.rsBg : theme.colors.rsText}
                    style={styles.optionText}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Stress & Exercise */}
        <View style={[styles.section, { backgroundColor: theme.colors.rsSurface, borderRadius: theme.radius.lg }]}>
          <View style={styles.sectionHeader}>
            <Feather name="activity" size={20} color={theme.colors.rsPrimary} />
            <Text variant="Title">Activity & Wellness</Text>
          </View>

          <View style={styles.field}>
            <Text variant="Body" color={theme.colors.rsText} style={styles.fieldLabel}>
              Stress Level
            </Text>
            <View style={styles.numberGrid}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.numberCardSmall,
                    {
                      backgroundColor: stress === level ? theme.colors.rsPrimary : 'transparent',
                      borderRadius: theme.radius.sm,
                      borderWidth: 1.5,
                      borderColor: stress === level ? theme.colors.rsPrimary : theme.colors.rsBorder,
                    },
                  ]}
                  onPress={() => updateValue(setStress, level)}
                  activeOpacity={0.7}
                >
                  <Text
                    variant="Body"
                    color={stress === level ? theme.colors.rsBg : theme.colors.rsText}
                    style={styles.numberTextSmall}
                  >
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.sliderLabels}>
              <Text variant="Caption" color={theme.colors.rsTextDim}>
                Low
              </Text>
              <Text variant="Caption" color={theme.colors.rsTextDim}>
                High
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.checkboxRow,
              {
                backgroundColor: exercise ? theme.colors.rsSecondary + '15' : 'transparent',
                borderRadius: theme.radius.md,
                borderWidth: 1.5,
                borderColor: exercise ? theme.colors.rsSecondary : theme.colors.rsBorder,
              },
            ]}
            onPress={() => updateValue(setExercise, !exercise)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, { borderColor: exercise ? theme.colors.rsSecondary : theme.colors.rsBorder }]}>
              {exercise && <Feather name="check" size={16} color={theme.colors.rsSecondary} />}
            </View>
            <Text variant="Body" color={theme.colors.rsText}>
              Exercised Today
            </Text>
          </TouchableOpacity>

          {exercise && (
            <View style={[styles.field, styles.indentedField]}>
              <Text variant="Body" color={theme.colors.rsText} style={styles.fieldLabel}>
                Exercise Intensity
              </Text>
              <View style={styles.optionGrid}>
                {(['Low', 'Med', 'High'] as const).map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.optionCard,
                      {
                        backgroundColor: exerciseIntensity === option ? theme.colors.rsSecondary : 'transparent',
                        borderRadius: theme.radius.md,
                        borderWidth: 1.5,
                        borderColor: exerciseIntensity === option ? theme.colors.rsSecondary : theme.colors.rsBorder,
                      },
                    ]}
                    onPress={() => updateValue(setExerciseIntensity, option)}
                    activeOpacity={0.7}
                  >
                    <Text
                      variant="Body"
                      color={exerciseIntensity === option ? theme.colors.rsBg : theme.colors.rsText}
                      style={styles.optionText}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Environment */}
        <View style={[styles.section, { backgroundColor: theme.colors.rsSurface, borderRadius: theme.radius.lg }]}>
          <View style={styles.sectionHeader}>
            <Feather name="cloud" size={20} color={theme.colors.rsPrimary} />
            <Text variant="Title">Environment</Text>
          </View>

          <View style={[styles.infoRow, { backgroundColor: theme.colors.rsBg, borderRadius: theme.radius.md }]}>
            <Feather name="wind" size={16} color={theme.colors.rsTextDim} />
            <Text variant="Caption" color={theme.colors.rsTextDim}>
              Barometric Pressure
            </Text>
            <Text variant="Body" color={theme.colors.rsPrimary} style={{ marginLeft: 'auto' }}>
              {baroData.hPa} hPa
            </Text>
          </View>

          <View style={styles.field}>
            <Text variant="Body" color={theme.colors.rsText} style={styles.fieldLabel}>
              Weather Conditions
            </Text>
            <View style={styles.optionGrid}>
              {(['Dry', 'Humid', 'Rain', 'Windy'] as const).map((condition) => (
                <TouchableOpacity
                  key={condition}
                  style={[
                    styles.optionCard,
                    {
                      backgroundColor: weather.includes(condition) ? theme.colors.rsPrimary : 'transparent',
                      borderRadius: theme.radius.md,
                      borderWidth: 1.5,
                      borderColor: weather.includes(condition) ? theme.colors.rsPrimary : theme.colors.rsBorder,
                    },
                  ]}
                  onPress={() => {
                    const newWeather = weather.includes(condition)
                      ? weather.filter((w) => w !== condition)
                      : [...weather, condition];
                    updateValue(setWeather, newWeather);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    variant="Body"
                    color={weather.includes(condition) ? theme.colors.rsBg : theme.colors.rsText}
                    style={styles.optionText}
                  >
                    {condition}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Menstruation */}
        <View style={[styles.section, { backgroundColor: theme.colors.rsSurface, borderRadius: theme.radius.lg }]}>
          <View style={styles.sectionHeader}>
            <Feather name="circle" size={20} color={theme.colors.rsPrimary} />
            <Text variant="Title">Menstrual Tracking</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.checkboxRow,
              {
                backgroundColor: menstruation ? theme.colors.rsPrimary + '15' : 'transparent',
                borderRadius: theme.radius.md,
                borderWidth: 1.5,
                borderColor: menstruation ? theme.colors.rsPrimary : theme.colors.rsBorder,
              },
            ]}
            onPress={() => updateValue(setMenstruation, !menstruation)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, { borderColor: menstruation ? theme.colors.rsPrimary : theme.colors.rsBorder }]}>
              {menstruation && <Feather name="check" size={16} color={theme.colors.rsPrimary} />}
            </View>
            <Text variant="Body" color={theme.colors.rsText}>
              Currently Tracking Cycle
            </Text>
          </TouchableOpacity>

          {menstruation && (
            <View style={[styles.field, styles.indentedField]}>
              <Text variant="Body" color={theme.colors.rsText} style={styles.fieldLabel}>
                Cycle Phase
              </Text>
              <View style={styles.optionGrid}>
                {(['Off', 'Pre', 'On', 'Post'] as const).map((phase) => (
                  <TouchableOpacity
                    key={phase}
                    style={[
                      styles.optionCard,
                      {
                        backgroundColor: menstruationPhase === phase ? theme.colors.rsPrimary : 'transparent',
                        borderRadius: theme.radius.md,
                        borderWidth: 1.5,
                        borderColor: menstruationPhase === phase ? theme.colors.rsPrimary : theme.colors.rsBorder,
                      },
                    ]}
                    onPress={() => updateValue(setMenstruationPhase, phase)}
                    activeOpacity={0.7}
                  >
                    <Text
                      variant="Body"
                      color={menstruationPhase === phase ? theme.colors.rsBg : theme.colors.rsText}
                      style={styles.optionText}
                    >
                      {phase}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Notes */}
        <View style={[styles.section, { backgroundColor: theme.colors.rsSurface, borderRadius: theme.radius.lg }]}>
          <View style={styles.sectionHeader}>
            <Feather name="edit-3" size={20} color={theme.colors.rsPrimary} />
            <Text variant="Title">Additional Notes</Text>
          </View>

          <TextInput
            style={[
              styles.notesInput,
              {
                backgroundColor: theme.colors.rsBg,
                color: theme.colors.rsText,
                borderColor: theme.colors.rsBorder,
                borderRadius: theme.radius.md,
                fontSize: theme.textStyles.Body.size,
              },
            ]}
            value={notes}
            onChangeText={(text) => updateValue(setNotes, text)}
            placeholder="Any observations or patterns you noticed today..."
            placeholderTextColor={theme.colors.rsTextDim}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Save Button */}
        <View style={styles.saveSection}>
          <CTAButton
            variant="primary"
            title={saving ? 'Saving...' : 'Save Daily Log'}
            onPress={handleSave}
            fullWidth
            disabled={saving}
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Calendar Modal */}
      <Modal
        visible={showCalendar}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCalendar(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.calendarModal,
              {
                backgroundColor: theme.colors.rsSurface,
                borderRadius: theme.radius.lg,
              },
            ]}
          >
            {/* Calendar Header */}
            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.monthButton}>
                <Feather name="chevron-left" size={24} color={theme.colors.rsPrimary} />
              </TouchableOpacity>
              
              <View style={styles.monthYearContainer}>
                <Text variant="H2">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </Text>
                <Text variant="Caption" color={theme.colors.rsTextDim}>
                  Select a date to view or edit
                </Text>
              </View>

              <TouchableOpacity onPress={() => changeMonth(1)} style={styles.monthButton}>
                <Feather name="chevron-right" size={24} color={theme.colors.rsPrimary} />
              </TouchableOpacity>
            </View>

            {/* Calendar Grid */}
            <View style={styles.calendarContainer}>
              {renderCalendar()}
            </View>

            {/* Calendar Footer */}
            <View style={styles.calendarFooter}>
              <View style={styles.legendRow}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendBox, { backgroundColor: theme.colors.rsSecondary + '30', borderWidth: 2, borderColor: theme.colors.rsSecondary }]} />
                  <Text variant="Caption" color={theme.colors.rsTextDim}>
                    Has Log
                  </Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendBox, { backgroundColor: theme.colors.rsPrimary }]} />
                  <Text variant="Caption" color={theme.colors.rsTextDim}>
                    Selected
                  </Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendBox, { borderWidth: 2, borderColor: theme.colors.rsPrimary }]} />
                  <Text variant="Caption" color={theme.colors.rsTextDim}>
                    Today
                  </Text>
                </View>
              </View>

              <CTAButton
                variant="secondary"
                title="Close Calendar"
                onPress={() => setShowCalendar(false)}
                fullWidth
              />
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 16,
  },
  header: {
    padding: 20,
    gap: 12,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerDate: {
    marginTop: 4,
  },
  calendarButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unsavedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  section: {
    padding: 20,
    gap: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: -4,
  },
  field: {
    gap: 12,
  },
  indentedField: {
    marginLeft: 16,
    paddingLeft: 16,
    borderLeftWidth: 2,
    borderLeftColor: '#27272F',
  },
  fieldLabel: {
    fontWeight: '600',
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionCard: {
    flex: 1,
    minWidth: '22%',
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  optionText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  toggleGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  toggleCard: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    gap: 12,
    minHeight: 100,
  },
  toggleIcon: {
    fontSize: 36,
  },
  numberGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  numberCard: {
    flex: 1,
    minWidth: '12%',
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  numberCardSmall: {
    width: '17%',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  numberTextSmall: {
    fontWeight: '600',
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -4,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  notesInput: {
    minHeight: 100,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 14,
    textAlignVertical: 'top',
  },
  saveSection: {
    marginTop: 8,
  },

  // Calendar Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  calendarModal: {
    width: '100%',
    maxWidth: 440,
    padding: 24,
    gap: 24,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  monthButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthYearContainer: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  calendarContainer: {
    gap: 12,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  weekDayHeader: {
    width: '13%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarDay: {
    width: '13%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  calendarDayText: {
    fontWeight: '600',
  },
  calendarFooter: {
    gap: 16,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
  },
});