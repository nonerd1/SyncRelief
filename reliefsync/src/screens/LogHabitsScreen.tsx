import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme, Text, Screen } from '../theme';
import { useHabitsStore } from '../store/habits';
import { CTAButton } from '../components/CTAButton';
import { getBarometricSnapshot } from '../lib/baro';
import type { HabitLog } from '../types/habit';

export const LogHabitsScreen: React.FC = () => {
  const theme = useTheme();
  const { addHabitLog, getLogForDate, getAllLogs, initialize } = useHabitsStore();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);

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
    initialize();
    loadBaroData();
  }, []);

  useEffect(() => {
    loadLogForDate(selectedDate);
  }, [selectedDate]);

  const loadBaroData = async () => {
    const data = await getBarometricSnapshot();
    setBaroData(data);
  };

  const loadLogForDate = (date: string) => {
    const log = getLogForDate(date);
    if (log) {
      // Populate form with existing log
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
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const log: Omit<HabitLog, 'id' | 'timestamp'> = {
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
        exerciseIntensity: exercise ? exerciseIntensity : undefined,
        barometricPressure: baroData.hPa,
        weather,
        menstruation,
        menstruationPhase: menstruation ? menstruationPhase : undefined,
        notes: notes.trim() || undefined,
      };

      await addHabitLog(log);
      Alert.alert('Success', 'Habit log saved!');
    } catch (error) {
      console.error('Failed to save log:', error);
      Alert.alert('Error', 'Failed to save log. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicateYesterday = async () => {
    const yesterday = new Date(selectedDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const yesterdayLog = getLogForDate(yesterdayStr);
    if (yesterdayLog) {
      // Prefill with yesterday's data
      setSugar(yesterdayLog.sugar);
      setStarch(yesterdayLog.starch);
      setDairy(yesterdayLog.dairy);
      setCaffeine(yesterdayLog.caffeine);
      setHydration(yesterdayLog.hydration);
      setSkippedMeals(yesterdayLog.skippedMeals);
      setSleepDuration(yesterdayLog.sleepDuration);
      setSleepQuality(yesterdayLog.sleepQuality);
      setStress(yesterdayLog.stress);
      setExercise(yesterdayLog.exercise);
      setExerciseIntensity(yesterdayLog.exerciseIntensity || 'Med');
      setWeather(yesterdayLog.weather);
      setMenstruation(yesterdayLog.menstruation);
      setMenstruationPhase(yesterdayLog.menstruationPhase || 'Off');
      setNotes(yesterdayLog.notes || '');

      await handleSave();
    } else {
      Alert.alert('No Data', 'No log found for yesterday to duplicate.');
    }
  };

  const toggleWeather = (condition: 'Dry' | 'Humid' | 'Rain' | 'Windy') => {
    setWeather((prev) =>
      prev.includes(condition) ? prev.filter((w) => w !== condition) : [...prev, condition],
    );
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate.toISOString().split('T')[0]);
  };

  return (
    <Screen>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Date picker */}
        <View style={styles.section}>
          <View style={styles.dateRow}>
            <TouchableOpacity onPress={() => changeDate(-1)}>
              <Text variant="Title" color={theme.colors.rsPrimary}>
                ‹
              </Text>
            </TouchableOpacity>
            <Text variant="Title">
              {new Date(selectedDate).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
            <TouchableOpacity onPress={() => changeDate(1)}>
              <Text variant="Title" color={theme.colors.rsPrimary}>
                ›
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Diet Section */}
        <View style={styles.section}>
          <Text variant="Title">🍽 Diet</Text>
          
          <View style={styles.subsection}>
            <Text variant="Caption" color={theme.colors.rsTextDim}>
              Sugar Intake
            </Text>
            <View style={styles.optionGrid}>
              {(['None', 'Low', 'Medium', 'High'] as const).map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionCard,
                    {
                      backgroundColor: sugar === option ? theme.colors.rsPrimary : theme.colors.rsSurface,
                      borderRadius: theme.radius.md,
                      borderWidth: 1,
                      borderColor: sugar === option ? theme.colors.rsPrimary : theme.colors.rsBorder,
                    },
                  ]}
                  onPress={() => setSugar(option)}
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

          <View style={styles.subsection}>
            <Text variant="Caption" color={theme.colors.rsTextDim}>
              Consumed Today
            </Text>
            <View style={styles.toggleGrid}>
              <TouchableOpacity
                style={[
                  styles.toggleCard,
                  {
                    backgroundColor: starch ? theme.colors.rsPrimary : theme.colors.rsSurface,
                    borderRadius: theme.radius.md,
                    borderWidth: 1,
                    borderColor: starch ? theme.colors.rsPrimary : theme.colors.rsBorder,
                  },
                ]}
                onPress={() => setStarch(!starch)}
                activeOpacity={0.7}
              >
                <Text variant="H2" style={styles.toggleIcon}>
                  🍞
                </Text>
                <Text
                  variant="Body"
                  color={starch ? theme.colors.rsBg : theme.colors.rsText}
                  style={styles.toggleLabel}
                >
                  Starch
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.toggleCard,
                  {
                    backgroundColor: dairy ? theme.colors.rsPrimary : theme.colors.rsSurface,
                    borderRadius: theme.radius.md,
                    borderWidth: 1,
                    borderColor: dairy ? theme.colors.rsPrimary : theme.colors.rsBorder,
                  },
                ]}
                onPress={() => setDairy(!dairy)}
                activeOpacity={0.7}
              >
                <Text variant="H2" style={styles.toggleIcon}>
                  🧀
                </Text>
                <Text
                  variant="Body"
                  color={dairy ? theme.colors.rsBg : theme.colors.rsText}
                  style={styles.toggleLabel}
                >
                  Dairy
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.subsection}>
            <Text variant="Caption" color={theme.colors.rsTextDim}>
              Caffeine (Cups)
            </Text>
            <View style={styles.optionGrid}>
              {(['None', '1', '2', '3+'] as const).map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionCard,
                    {
                      backgroundColor: caffeine === option ? theme.colors.rsPrimary : theme.colors.rsSurface,
                      borderRadius: theme.radius.md,
                      borderWidth: 1,
                      borderColor: caffeine === option ? theme.colors.rsPrimary : theme.colors.rsBorder,
                    },
                  ]}
                  onPress={() => setCaffeine(option)}
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

          <View style={styles.subsection}>
            <Text variant="Caption" color={theme.colors.rsTextDim}>
              Hydration
            </Text>
            <View style={styles.optionGrid}>
              {(['Poor', 'OK', 'Good'] as const).map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionCard,
                    {
                      backgroundColor: hydration === option ? theme.colors.rsPrimary : theme.colors.rsSurface,
                      borderRadius: theme.radius.md,
                      borderWidth: 1,
                      borderColor: hydration === option ? theme.colors.rsPrimary : theme.colors.rsBorder,
                    },
                  ]}
                  onPress={() => setHydration(option)}
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
              styles.checkboxCard,
              {
                backgroundColor: skippedMeals ? theme.colors.rsPrimary : theme.colors.rsSurface,
                borderRadius: theme.radius.md,
                borderWidth: 1,
                borderColor: skippedMeals ? theme.colors.rsPrimary : theme.colors.rsBorder,
              },
            ]}
            onPress={() => setSkippedMeals(!skippedMeals)}
            activeOpacity={0.7}
          >
            <View style={styles.checkboxContent}>
              <View
                style={[
                  styles.checkbox,
                  {
                    backgroundColor: skippedMeals ? theme.colors.rsBg : 'transparent',
                    borderColor: skippedMeals ? theme.colors.rsBg : theme.colors.rsBorder,
                    borderRadius: theme.radius.sm,
                  },
                ]}
              >
                {skippedMeals && (
                  <Feather name="check" size={16} color={theme.colors.rsPrimary} />
                )}
              </View>
              <Text
                variant="Body"
                color={skippedMeals ? theme.colors.rsBg : theme.colors.rsText}
              >
                Skipped Meals
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Sleep Section */}
        <View style={styles.section}>
          <Text variant="Title">😴 Sleep</Text>
          
          <View style={styles.subsection}>
            <Text variant="Caption" color={theme.colors.rsTextDim}>
              Hours Slept
            </Text>
            <View style={styles.numberGrid}>
              {[4, 5, 6, 7, 8, 9, 10].map((hours) => (
                <TouchableOpacity
                  key={hours}
                  style={[
                    styles.numberCard,
                    {
                      backgroundColor: sleepDuration === hours ? theme.colors.rsPrimary : theme.colors.rsSurface,
                      borderRadius: theme.radius.md,
                      borderWidth: 1,
                      borderColor: sleepDuration === hours ? theme.colors.rsPrimary : theme.colors.rsBorder,
                    },
                  ]}
                  onPress={() => setSleepDuration(hours)}
                  activeOpacity={0.7}
                >
                  <Text
                    variant="H2"
                    color={sleepDuration === hours ? theme.colors.rsBg : theme.colors.rsText}
                  >
                    {hours}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.subsection}>
            <Text variant="Caption" color={theme.colors.rsTextDim}>
              Quality
            </Text>
            <View style={styles.optionGrid}>
              {(['Poor', 'Fair', 'Good'] as const).map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionCard,
                    {
                      backgroundColor: sleepQuality === option ? theme.colors.rsPrimary : theme.colors.rsSurface,
                      borderRadius: theme.radius.md,
                      borderWidth: 1,
                      borderColor: sleepQuality === option ? theme.colors.rsPrimary : theme.colors.rsBorder,
                    },
                  ]}
                  onPress={() => setSleepQuality(option)}
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

        {/* Stress Section */}
        <View style={styles.section}>
          <Text variant="Title">😰 Stress</Text>
          
          <View style={styles.subsection}>
            <Text variant="Caption" color={theme.colors.rsTextDim}>
              Stress Level
            </Text>
            <View style={styles.numberGrid}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.numberCard,
                    {
                      backgroundColor: stress === level ? theme.colors.rsPrimary : theme.colors.rsSurface,
                      borderRadius: theme.radius.md,
                      borderWidth: 1,
                      borderColor: stress === level ? theme.colors.rsPrimary : theme.colors.rsBorder,
                    },
                  ]}
                  onPress={() => setStress(level)}
                  activeOpacity={0.7}
                >
                  <Text
                    variant="Body"
                    color={stress === level ? theme.colors.rsBg : theme.colors.rsText}
                    style={styles.numberText}
                  >
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.labelRow}>
              <Text variant="Caption" color={theme.colors.rsTextDim}>
                Low
              </Text>
              <Text variant="Caption" color={theme.colors.rsTextDim}>
                {stress}/10
              </Text>
              <Text variant="Caption" color={theme.colors.rsTextDim}>
                High
              </Text>
            </View>
          </View>
        </View>

        {/* Exercise Section */}
        <View style={styles.section}>
          <Text variant="Title">🏃 Exercise</Text>
          
          <TouchableOpacity
            style={[
              styles.checkboxCard,
              {
                backgroundColor: exercise ? theme.colors.rsPrimary : theme.colors.rsSurface,
                borderRadius: theme.radius.md,
                borderWidth: 1,
                borderColor: exercise ? theme.colors.rsPrimary : theme.colors.rsBorder,
              },
            ]}
            onPress={() => setExercise(!exercise)}
            activeOpacity={0.7}
          >
            <View style={styles.checkboxContent}>
              <View
                style={[
                  styles.checkbox,
                  {
                    backgroundColor: exercise ? theme.colors.rsBg : 'transparent',
                    borderColor: exercise ? theme.colors.rsBg : theme.colors.rsBorder,
                    borderRadius: theme.radius.sm,
                  },
                ]}
              >
                {exercise && (
                  <Feather name="check" size={16} color={theme.colors.rsPrimary} />
                )}
              </View>
              <Text
                variant="Body"
                color={exercise ? theme.colors.rsBg : theme.colors.rsText}
              >
                Exercised Today
              </Text>
            </View>
          </TouchableOpacity>

          {exercise && (
            <View style={styles.subsection}>
              <Text variant="Caption" color={theme.colors.rsTextDim}>
                Intensity
              </Text>
              <View style={styles.optionGrid}>
                {(['Low', 'Med', 'High'] as const).map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.optionCard,
                      {
                        backgroundColor: exerciseIntensity === option ? theme.colors.rsPrimary : theme.colors.rsSurface,
                        borderRadius: theme.radius.md,
                        borderWidth: 1,
                        borderColor: exerciseIntensity === option ? theme.colors.rsPrimary : theme.colors.rsBorder,
                      },
                    ]}
                    onPress={() => setExerciseIntensity(option)}
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

        {/* Environment Section */}
        <View style={styles.section}>
          <Text variant="Title">🌤 Environment</Text>
          
          <View
            style={[
              styles.baroCard,
              {
                backgroundColor: theme.colors.rsSurface,
                borderRadius: theme.radius.md,
              },
            ]}
          >
            <View style={styles.baroRow}>
              <Text variant="Caption" color={theme.colors.rsTextDim}>
                Barometric
              </Text>
              <Text variant="Body" color={theme.colors.rsPrimary}>
                {baroData.hPa} hPa · {baroData.label}
              </Text>
            </View>
          </View>

          <View style={styles.subsection}>
            <Text variant="Caption" color={theme.colors.rsTextDim}>
              Weather Conditions
            </Text>
            <View style={styles.optionGrid}>
              {(['Dry', 'Humid', 'Rain', 'Windy'] as const).map((condition) => (
                <TouchableOpacity
                  key={condition}
                  style={[
                    styles.optionCard,
                    {
                      backgroundColor: weather.includes(condition)
                        ? theme.colors.rsPrimary
                        : theme.colors.rsSurface,
                      borderColor: weather.includes(condition)
                        ? theme.colors.rsPrimary
                        : theme.colors.rsBorder,
                      borderRadius: theme.radius.md,
                      borderWidth: 1,
                    },
                  ]}
                  onPress={() => toggleWeather(condition)}
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

        {/* Menstruation Section */}
        <View style={styles.section}>
          <Text variant="Title">🩸 Menstruation</Text>
          
          <TouchableOpacity
            style={[
              styles.checkboxCard,
              {
                backgroundColor: menstruation ? theme.colors.rsPrimary : theme.colors.rsSurface,
                borderRadius: theme.radius.md,
                borderWidth: 1,
                borderColor: menstruation ? theme.colors.rsPrimary : theme.colors.rsBorder,
              },
            ]}
            onPress={() => setMenstruation(!menstruation)}
            activeOpacity={0.7}
          >
            <View style={styles.checkboxContent}>
              <View
                style={[
                  styles.checkbox,
                  {
                    backgroundColor: menstruation ? theme.colors.rsBg : 'transparent',
                    borderColor: menstruation ? theme.colors.rsBg : theme.colors.rsBorder,
                    borderRadius: theme.radius.sm,
                  },
                ]}
              >
                {menstruation && (
                  <Feather name="check" size={16} color={theme.colors.rsPrimary} />
                )}
              </View>
              <Text
                variant="Body"
                color={menstruation ? theme.colors.rsBg : theme.colors.rsText}
              >
                Tracking
              </Text>
            </View>
          </TouchableOpacity>

          {menstruation && (
            <View style={styles.subsection}>
              <Text variant="Caption" color={theme.colors.rsTextDim}>
                Cycle Phase
              </Text>
              <View style={styles.optionGrid}>
                {(['Off', 'Pre', 'On', 'Post'] as const).map((phase) => (
                  <TouchableOpacity
                    key={phase}
                    style={[
                      styles.optionCard,
                      {
                        backgroundColor: menstruationPhase === phase ? theme.colors.rsPrimary : theme.colors.rsSurface,
                        borderRadius: theme.radius.md,
                        borderWidth: 1,
                        borderColor: menstruationPhase === phase ? theme.colors.rsPrimary : theme.colors.rsBorder,
                      },
                    ]}
                    onPress={() => setMenstruationPhase(phase)}
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

        {/* Notes Section */}
        <View style={styles.section}>
          <Text variant="Title">📝 Notes</Text>
          
          <TextInput
            style={[
              styles.notesInput,
              {
                backgroundColor: theme.colors.rsSurface,
                color: theme.colors.rsText,
                borderColor: theme.colors.rsBorder,
                borderRadius: theme.radius.md,
                fontSize: theme.textStyles.Body.size,
              },
            ]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Any additional observations..."
            placeholderTextColor={theme.colors.rsTextDim}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <CTAButton
            variant="primary"
            title={saving ? 'Saving...' : 'Save Log'}
            onPress={handleSave}
            fullWidth
            disabled={saving}
          />
        </View>

        <View style={styles.section}>
          <CTAButton
            variant="secondary"
            title="Save & Duplicate Yesterday"
            onPress={handleDuplicateYesterday}
            fullWidth
            disabled={saving}
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
    gap: 20,
  },
  section: {
    gap: 12,
  },
  subsection: {
    gap: 8,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  // Option cards (3-4 options per row)
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionCard: {
    flex: 1,
    minWidth: '22%',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  optionText: {
    fontWeight: '500',
    textAlign: 'center',
  },
  // Toggle cards (2 per row, with icons)
  toggleGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    minHeight: 100,
  },
  toggleIcon: {
    fontSize: 32,
  },
  toggleLabel: {
    fontWeight: '500',
    textAlign: 'center',
  },
  // Number cards (for hours, stress levels)
  numberGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  numberCard: {
    width: '18%',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  numberText: {
    fontWeight: '600',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  // Checkbox card
  checkboxCard: {
    padding: 16,
  },
  checkboxContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Barometric info
  baroCard: {
    padding: 12,
  },
  baroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  // Notes
  notesInput: {
    minHeight: 100,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    textAlignVertical: 'top',
  },
});
