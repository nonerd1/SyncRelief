import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme, Text, Screen } from '../theme';
import { useEpisodesFirebaseStore } from '../store/episodes-firebase';
import { useHabitsFirebaseStore } from '../store/habits-firebase';
import { CTAButton } from '../components/CTAButton';
import { generateDemoEpisodes, generateDemoHabits, getDemoDataSummary } from '../data/seed';
import type { HeadacheEpisode } from '../types/episode';
import type { HabitLog } from '../types/habit';

interface DayData {
  day: number;
  episodes: number;
  avgIntensity: number;
  avgEffectiveness: number;
}

interface TriggerAnalysis {
  trigger: string;
  frequency: number;
  baseline: number;
  lift: number;
  percentage: number;
}

export const InsightsScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  
  const {
    episodes,
    getAllEpisodes,
    addEpisode,
  } = useEpisodesFirebaseStore();
  
  const { 
    logs,
    getAllLogs, 
    addHabitLog 
  } = useHabitsFirebaseStore();

  const [weeklyData, setWeeklyData] = useState<DayData[]>([]);
  const [monthlyData, setMonthlyData] = useState<DayData[]>([]);
  const [topTriggers, setTopTriggers] = useState<TriggerAnalysis[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showMonthlyModal, setShowMonthlyModal] = useState(false);
  const [showTriggerModal, setShowTriggerModal] = useState(false);
  const [selectedTrigger, setSelectedTrigger] = useState<TriggerAnalysis | null>(null);

  useEffect(() => {
    if (episodes.length > 0) {
      analyzeData();
    }
  }, [episodes, logs]);

  const analyzeData = () => {
    const allEpisodes = getAllEpisodes();
    const habitLogs = getAllLogs();

    const weekly = generateDayData(allEpisodes, 7);
    setWeeklyData(weekly);

    const monthly = generateDayData(allEpisodes, 30);
    setMonthlyData(monthly);

    const triggers = analyzeTriggers(allEpisodes, habitLogs);
    setTopTriggers(triggers.slice(0, 3));

    const sug = generateSuggestions(allEpisodes, habitLogs);
    setSuggestions(sug);
  };

  const generateDayData = (episodes: HeadacheEpisode[], days: number): DayData[] => {
    const data: DayData[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayEpisodes = episodes.filter((e) => e.startTime.startsWith(dateStr));

      const avgIntensity =
        dayEpisodes.length > 0
          ? dayEpisodes.reduce((sum, e) => sum + e.intensity, 0) / dayEpisodes.length
          : 0;

      const withDevice = dayEpisodes.filter((e) => e.usedDevice && e.deviceEffectiveness);
      const avgEffectiveness =
        withDevice.length > 0
          ? withDevice.reduce((sum, e) => sum + (e.deviceEffectiveness || 0), 0) / withDevice.length
          : 0;

      data.push({
        day: days - i,
        episodes: dayEpisodes.length,
        avgIntensity: Math.round(avgIntensity * 10) / 10,
        avgEffectiveness: Math.round(avgEffectiveness * 10) / 10,
      });
    }

    return data;
  };

  const analyzeTriggers = (
    episodes: HeadacheEpisode[],
    habitLogs: HabitLog[],
  ): TriggerAnalysis[] => {
    const allTriggers = new Set<string>();
    episodes.forEach((e) => e.triggers.forEach((t) => allTriggers.add(t)));

    const totalDays = 30;
    const baseline = episodes.length / totalDays;

    const analysis: TriggerAnalysis[] = [];

    allTriggers.forEach((trigger) => {
      const episodesWithTrigger = episodes.filter((e) => e.triggers.includes(trigger as any));
      const frequency = episodesWithTrigger.length;
      const probability = frequency / totalDays;
      const lift = baseline > 0 ? (probability / baseline - 1) * 100 : 0;

      analysis.push({
        trigger,
        frequency,
        baseline: Math.round(baseline * 100) / 100,
        lift: Math.round(lift),
        percentage: Math.round((probability / baseline) * 100),
      });
    });

    return analysis.sort((a, b) => b.lift - a.lift);
  };

  const generateSuggestions = (episodes: HeadacheEpisode[], habitLogs: HabitLog[]): string[] => {
    const suggestions: string[] = [];

    const lowPressureEpisodes = episodes.filter((e) => (e.barometricPressure || 1013) < 1000);
    if (lowPressureEpisodes.length > 2) {
      suggestions.push(
        '🌧 Low pressure detected. Try "Sinus" preset for 10-15 min when pressure drops.',
      );
    }

    const lateCaffeineCount = habitLogs.filter((log) => log.caffeine !== 'None').length;
    if (lateCaffeineCount > 5) {
      suggestions.push(
        '☕ Caffeine intake detected frequently. Consider switching to decaf after 3pm.',
      );
    }

    const skippedMealsEpisodes = episodes.filter((e) => e.triggers.includes('Skipped meal'));
    if (skippedMealsEpisodes.length > 2) {
      suggestions.push(
        '🎯 Skipped meals often precede episodes. Keep a backup snack and water bottle handy.',
      );
    }

    return suggestions;
  };

  const handleTriggerPress = (trigger: TriggerAnalysis) => {
    setSelectedTrigger(trigger);
    setShowTriggerModal(true);
  };

  const handleLoadDemoData = () => {
    Alert.alert(
      'Load Demo Data',
      'This will add 14 days of sample episodes and habit logs. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Load',
          onPress: async () => {
            try {
              const demoEpisodes = generateDemoEpisodes();
              const demoHabits = generateDemoHabits();

              for (const episode of demoEpisodes) {
                await addEpisode(episode);
              }

              for (const habit of demoHabits) {
                await addHabitLog(habit);
              }

              const summary = getDemoDataSummary();
              Alert.alert(
                'Demo Data Loaded',
                `Added ${summary.episodes} episodes and ${summary.habits} habit logs.\n\nAvg Intensity: ${summary.avgIntensity}/10\nDevice Usage: ${summary.deviceUsage}`,
              );
            } catch (error) {
              console.error('Failed to load demo data:', error);
              Alert.alert('Error', 'Failed to load demo data. Please try again.');
            }
          },
        },
      ],
    );
  };

  return (
    <Screen>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text variant="H1">Insights</Text>
          <Text variant="Body" color={theme.colors.rsTextDim}>
            Patterns and correlations
          </Text>
        </View>

        {/* Weekly Chart Card */}
        <TouchableOpacity
          style={[
            styles.card,
            { backgroundColor: theme.colors.rsSurface, borderRadius: theme.radius.md },
          ]}
          onPress={() => setShowMonthlyModal(true)}
        >
          <View style={styles.chartHeader}>
            <Text variant="Title">📊 Last 7 Days</Text>
            <Text variant="Caption" color={theme.colors.rsTextDim}>
              Tap for monthly
            </Text>
          </View>

          {weeklyData.length > 0 ? (
            <>
              <View style={styles.chartContainer}>
                <Text variant="Body" color={theme.colors.rsPrimary}>
                  📊 Episodes per day
                </Text>
                <View style={styles.barContainer}>
                  {weeklyData.map((d, i) => (
                    <View key={i} style={styles.barWrapper}>
                      <View
                        style={[
                          styles.bar,
                          {
                            height: Math.max(d.episodes * 20, 2),
                            backgroundColor: theme.colors.rsPrimary,
                          },
                        ]}
                      />
                      <Text
                        variant="Caption"
                        color={theme.colors.rsTextDim}
                        style={styles.barLabel}
                      >
                        {d.episodes}
                      </Text>
                    </View>
                  ))}
                </View>

                <Text variant="Body" color={theme.colors.rsAlert} style={styles.intensityLabel}>
                  🔥 Avg Intensity:{' '}
                  {weeklyData.reduce((s, d) => s + d.avgIntensity, 0) / weeklyData.length > 0
                    ? Math.round(
                        (weeklyData.reduce((s, d) => s + d.avgIntensity, 0) / weeklyData.length) *
                          10,
                      ) / 10
                    : 0}
                  /10
                </Text>
              </View>

              <View style={styles.legend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: theme.colors.rsPrimary }]} />
                  <Text variant="Caption" color={theme.colors.rsTextDim}>
                    Episodes
                  </Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: theme.colors.rsAlert }]} />
                  <Text variant="Caption" color={theme.colors.rsTextDim}>
                    Avg Intensity
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <Text variant="Body" color={theme.colors.rsTextDim} style={styles.emptyText}>
              No data yet. Start logging episodes to see trends.
            </Text>
          )}
        </TouchableOpacity>

        {/* Top Triggers */}
        {topTriggers.length > 0 && (
          <View
            style={[
              styles.card,
              { backgroundColor: theme.colors.rsSurface, borderRadius: theme.radius.md },
            ]}
          >
            <Text variant="Title" style={styles.sectionTitle}>
              ⚡️ Top 3 Triggers
            </Text>

            {topTriggers.map((trigger, index) => (
              <TouchableOpacity
                key={trigger.trigger}
                style={[styles.triggerRow, { borderBottomColor: theme.colors.rsBorder }]}
                onPress={() => handleTriggerPress(trigger)}
              >
                <View style={styles.triggerLeft}>
                  <Text variant="Body" color={theme.colors.rsText}>
                    {index + 1}. {trigger.trigger}
                  </Text>
                  <Text variant="Caption" color={theme.colors.rsTextDim}>
                    {trigger.frequency} episodes
                  </Text>
                </View>
                <View style={styles.triggerRight}>
                  <Text variant="Title" color={theme.colors.rsWarn}>
                    +{trigger.lift}%
                  </Text>
                  <Text variant="Caption" color={theme.colors.rsTextDim}>
                    vs baseline
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <View
            style={[
              styles.card,
              { backgroundColor: theme.colors.rsSurface, borderRadius: theme.radius.md },
            ]}
          >
            <Text variant="Title" style={styles.sectionTitle}>
              💡 Suggestions
            </Text>

            {suggestions.map((suggestion, index) => (
              <View key={index} style={styles.suggestionRow}>
                <Text variant="Body" color={theme.colors.rsText}>
                  • {suggestion}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Quick Links */}
        <View style={styles.section}>
          <CTAButton
            variant="primary"
            title="Log New Headache"
            onPress={() => navigation.navigate('LogHeadache' as never)}
            fullWidth
          />
        </View>

        <View style={styles.section}>
          <CTAButton
            variant="secondary"
            title="Log Daily Habits"
            onPress={() => navigation.navigate('LogHabits' as never)}
            fullWidth
          />
        </View>

        {/* Dev-Only: Load Demo Data */}
        {__DEV__ && (
          <View style={styles.section}>
            <CTAButton
              variant="ghost"
              title="🧪 Load Demo Data (Dev)"
              onPress={handleLoadDemoData}
              fullWidth
            />
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Monthly Modal */}
      <Modal
        visible={showMonthlyModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMonthlyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: theme.colors.rsSurface,
                borderRadius: theme.radius.lg,
              },
            ]}
          >
            <Text variant="H2" style={styles.modalTitle}>
              Monthly Trend
            </Text>
            <Text variant="Caption" color={theme.colors.rsTextDim}>
              Last 30 days
            </Text>

            {monthlyData.length > 0 && (
              <>
                <View style={styles.monthlyStats}>
                  <View style={styles.statCard}>
                    <Text variant="Caption" color={theme.colors.rsTextDim}>
                      Total Episodes
                    </Text>
                    <Text variant="Title" color={theme.colors.rsPrimary}>
                      {monthlyData.reduce((s, d) => s + d.episodes, 0)}
                    </Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text variant="Caption" color={theme.colors.rsTextDim}>
                      Avg Intensity
                    </Text>
                    <Text variant="Title" color={theme.colors.rsAlert}>
                      {Math.round(
                        (monthlyData.reduce((s, d) => s + d.avgIntensity, 0) /
                          monthlyData.filter((d) => d.avgIntensity > 0).length || 0) * 10,
                      ) / 10}
                      /10
                    </Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text variant="Caption" color={theme.colors.rsTextDim}>
                      Device Effect
                    </Text>
                    <Text variant="Title" color={theme.colors.rsSecondary}>
                      {Math.round(
                        (monthlyData.reduce((s, d) => s + d.avgEffectiveness, 0) /
                          monthlyData.filter((d) => d.avgEffectiveness > 0).length || 0) * 10,
                      ) / 10}
                      /10
                    </Text>
                  </View>
                </View>

                <View style={styles.legend}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: theme.colors.rsPrimary }]} />
                    <Text variant="Caption" color={theme.colors.rsTextDim}>
                      Episodes
                    </Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: theme.colors.rsAlert }]} />
                    <Text variant="Caption" color={theme.colors.rsTextDim}>
                      Intensity
                    </Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View
                      style={[styles.legendDot, { backgroundColor: theme.colors.rsSecondary }]}
                    />
                    <Text variant="Caption" color={theme.colors.rsTextDim}>
                      Device Effect
                    </Text>
                  </View>
                </View>
              </>
            )}

            <View style={styles.modalButtons}>
              <CTAButton
                variant="secondary"
                title="Close"
                onPress={() => setShowMonthlyModal(false)}
                fullWidth
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Trigger Details Modal */}
      <Modal
        visible={showTriggerModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTriggerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: theme.colors.rsSurface,
                borderRadius: theme.radius.lg,
              },
            ]}
          >
            {selectedTrigger && (
              <>
                <Text variant="H2" style={styles.modalTitle}>
                  {selectedTrigger.trigger}
                </Text>

                <View style={styles.triggerDetails}>
                  <View style={styles.triggerStat}>
                    <Text variant="Caption" color={theme.colors.rsTextDim}>
                      Frequency
                    </Text>
                    <Text variant="Title" color={theme.colors.rsPrimary}>
                      {selectedTrigger.frequency} episodes
                    </Text>
                  </View>

                  <View style={styles.triggerStat}>
                    <Text variant="Caption" color={theme.colors.rsTextDim}>
                      Baseline Risk
                    </Text>
                    <Text variant="Title" color={theme.colors.rsText}>
                      {selectedTrigger.baseline}/day
                    </Text>
                  </View>

                  <View style={styles.triggerStat}>
                    <Text variant="Caption" color={theme.colors.rsTextDim}>
                      Increased Risk
                    </Text>
                    <Text variant="Title" color={theme.colors.rsWarn}>
                      +{selectedTrigger.lift}%
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.suggestionBox,
                    { backgroundColor: theme.colors.rsBg, borderRadius: theme.radius.md },
                  ]}
                >
                  <Text variant="Body" color={theme.colors.rsText}>
                    💡 This trigger appears more frequently than baseline. Consider tracking related
                    habits to identify patterns.
                  </Text>
                </View>

                <View style={styles.modalButtons}>
                  <CTAButton
                    variant="secondary"
                    title="Close"
                    onPress={() => setShowTriggerModal(false)}
                    fullWidth
                  />
                </View>
              </>
            )}
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
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chartContainer: {
    gap: 12,
  },
  barContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 100,
    paddingVertical: 8,
  },
  barWrapper: {
    alignItems: 'center',
    gap: 4,
  },
  bar: {
    width: 32,
    borderRadius: 4,
    minHeight: 2,
  },
  barLabel: {
    fontSize: 10,
  },
  intensityLabel: {
    textAlign: 'center',
  },
  monthlyStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    gap: 4,
    alignItems: 'center',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: -10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionTitle: {
    marginBottom: -4,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 40,
  },
  triggerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  triggerLeft: {
    flex: 1,
    gap: 4,
  },
  triggerRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  suggestionRow: {
    paddingVertical: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
    gap: 16,
  },
  modalTitle: {
    textAlign: 'center',
  },
  modalButtons: {
    marginTop: 8,
  },
  triggerDetails: {
    gap: 16,
    paddingVertical: 8,
  },
  triggerStat: {
    gap: 4,
  },
  suggestionBox: {
    padding: 16,
  },
});