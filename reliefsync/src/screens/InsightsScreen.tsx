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
  date: string;
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
  avgIntensity: number;
  correlationScore: number;
}

interface Pattern {
  type: 'time' | 'trigger' | 'weather' | 'habit';
  title: string;
  description: string;
  confidence: 'high' | 'medium' | 'low';
  actionable: string;
}

interface PredictiveInsight {
  risk: 'high' | 'medium' | 'low';
  probability: number;
  factors: string[];
  recommendation: string;
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
    addHabitLog,
  } = useHabitsFirebaseStore();

  const [weeklyData, setWeeklyData] = useState<DayData[]>([]);
  const [monthlyData, setMonthlyData] = useState<DayData[]>([]);
  const [topTriggers, setTopTriggers] = useState<TriggerAnalysis[]>([]);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [predictiveInsight, setPredictiveInsight] = useState<PredictiveInsight | null>(null);
  const [showMonthlyModal, setShowMonthlyModal] = useState(false);
  const [showTriggerModal, setShowTriggerModal] = useState(false);
  const [showPatternModal, setShowPatternModal] = useState(false);
  const [selectedTrigger, setSelectedTrigger] = useState<TriggerAnalysis | null>(null);
  const [selectedPattern, setSelectedPattern] = useState<Pattern | null>(null);
  const [trend, setTrend] = useState<'improving' | 'stable' | 'worsening'>('stable');

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
    setTopTriggers(triggers.slice(0, 5));

    const detectedPatterns = detectPatterns(allEpisodes, habitLogs);
    setPatterns(detectedPatterns);

    const prediction = generatePrediction(allEpisodes, habitLogs);
    setPredictiveInsight(prediction);

    const currentTrend = calculateTrend(allEpisodes);
    setTrend(currentTrend);
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
        date: dateStr,
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
    episodes.forEach((e) => e.triggers?.forEach((t) => allTriggers.add(t)));

    const totalDays = Math.min(episodes.length > 0 ? 30 : 1, 30);
    const baseline = episodes.length / totalDays;

    const analysis: TriggerAnalysis[] = [];

    allTriggers.forEach((trigger) => {
      const episodesWithTrigger = episodes.filter((e) => e.triggers?.includes(trigger as any));
      const frequency = episodesWithTrigger.length;
      const avgIntensity = episodesWithTrigger.length > 0
        ? episodesWithTrigger.reduce((sum, e) => sum + e.intensity, 0) / episodesWithTrigger.length
        : 0;
      
      const probability = frequency / totalDays;
      const lift = baseline > 0 ? (probability / baseline - 1) * 100 : 0;
      
      // Calculate correlation score (0-100)
      const correlationScore = Math.min(100, Math.round((lift + avgIntensity * 10) / 2));

      analysis.push({
        trigger,
        frequency,
        baseline: Math.round(baseline * 100) / 100,
        lift: Math.round(lift),
        percentage: Math.round((probability / baseline) * 100),
        avgIntensity: Math.round(avgIntensity * 10) / 10,
        correlationScore,
      });
    });

    return analysis.sort((a, b) => b.correlationScore - a.correlationScore);
  };

  const detectPatterns = (episodes: HeadacheEpisode[], habitLogs: HabitLog[]): Pattern[] => {
    const patterns: Pattern[] = [];

    // Time-based patterns
    const timePattern = analyzeTimePatterns(episodes);
    if (timePattern) patterns.push(timePattern);

    // Trigger clustering
    const triggerPattern = analyzeTriggerClusters(episodes);
    if (triggerPattern) patterns.push(triggerPattern);

    // Weather correlation
    const weatherPattern = analyzeWeatherCorrelation(episodes);
    if (weatherPattern) patterns.push(weatherPattern);

    // Habit correlation
    const habitPattern = analyzeHabitCorrelation(episodes, habitLogs);
    if (habitPattern) patterns.push(habitPattern);

    return patterns;
  };

  const analyzeTimePatterns = (episodes: HeadacheEpisode[]): Pattern | null => {
    if (episodes.length < 5) return null;

    const hourCounts: { [hour: number]: number } = {};
    episodes.forEach(ep => {
      const hour = new Date(ep.startTime).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
    if (peakHour && peakHour[1] >= 3) {
      const hour = parseInt(peakHour[0]);
      const period = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
      
      return {
        type: 'time',
        title: `${period.charAt(0).toUpperCase() + period.slice(1)} Pattern`,
        description: `${peakHour[1]} episodes occurred around ${hour % 12 || 12}${hour < 12 ? 'am' : 'pm'}`,
        confidence: peakHour[1] >= 5 ? 'high' : 'medium',
        actionable: `Consider preventive measures in the ${period}, such as staying hydrated and managing stress.`,
      };
    }

    return null;
  };

  const analyzeTriggerClusters = (episodes: HeadacheEpisode[]): Pattern | null => {
    if (episodes.length < 3) return null;

    const multiTriggerEpisodes = episodes.filter(e => e.triggers && e.triggers.length >= 2);
    if (multiTriggerEpisodes.length >= 3) {
      const commonPairs: { [key: string]: number } = {};
      
      multiTriggerEpisodes.forEach(ep => {
        const triggers = ep.triggers || [];
        for (let i = 0; i < triggers.length; i++) {
          for (let j = i + 1; j < triggers.length; j++) {
            const pair = [triggers[i], triggers[j]].sort().join(' + ');
            commonPairs[pair] = (commonPairs[pair] || 0) + 1;
          }
        }
      });

      const topPair = Object.entries(commonPairs).sort((a, b) => b[1] - a[1])[0];
      if (topPair && topPair[1] >= 2) {
        return {
          type: 'trigger',
          title: 'Trigger Combination',
          description: `${topPair[0]} appear together in ${topPair[1]} episodes`,
          confidence: topPair[1] >= 3 ? 'high' : 'medium',
          actionable: `These triggers may have a synergistic effect. Try addressing both simultaneously.`,
        };
      }
    }

    return null;
  };

  const analyzeWeatherCorrelation = (episodes: HeadacheEpisode[]): Pattern | null => {
    if (episodes.length < 5) return null;

    const lowPressureEpisodes = episodes.filter(e => 
      e.barometricPressure && e.barometricPressure < 1010
    );

    if (lowPressureEpisodes.length >= 3) {
      const percentage = Math.round((lowPressureEpisodes.length / episodes.length) * 100);
      return {
        type: 'weather',
        title: 'Barometric Sensitivity',
        description: `${percentage}% of episodes occurred during low pressure (${lowPressureEpisodes.length}/${episodes.length})`,
        confidence: percentage >= 50 ? 'high' : 'medium',
        actionable: `You may be sensitive to weather changes. Monitor forecasts and use preventive treatment before pressure drops.`,
      };
    }

    return null;
  };

  const analyzeHabitCorrelation = (episodes: HeadacheEpisode[], habitLogs: HabitLog[]): Pattern | null => {
    if (episodes.length < 3 || habitLogs.length < 3) return null;

    const skippedMealEpisodes = episodes.filter(e => e.triggers?.includes('Skipped meal'));
    if (skippedMealEpisodes.length >= 3) {
      const percentage = Math.round((skippedMealEpisodes.length / episodes.length) * 100);
      return {
        type: 'habit',
        title: 'Meal Timing Impact',
        description: `${percentage}% of episodes linked to skipped meals (${skippedMealEpisodes.length}/${episodes.length})`,
        confidence: percentage >= 40 ? 'high' : 'medium',
        actionable: `Maintain regular meal times. Keep healthy snacks available and set meal reminders.`,
      };
    }

    return null;
  };

  const generatePrediction = (episodes: HeadacheEpisode[], habitLogs: HabitLog[]): PredictiveInsight | null => {
    if (episodes.length < 5) return null;

    // Analyze recent trend (last 7 days vs previous 7 days)
    const now = new Date();
    const last7Days = episodes.filter(e => {
      const epDate = new Date(e.startTime);
      const daysAgo = (now.getTime() - epDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 7;
    });

    const previous7Days = episodes.filter(e => {
      const epDate = new Date(e.startTime);
      const daysAgo = (now.getTime() - epDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo > 7 && daysAgo <= 14;
    });

    const recentAvg = last7Days.length;
    const previousAvg = previous7Days.length;
    
    let risk: 'high' | 'medium' | 'low' = 'low';
    let probability = 30;
    const factors: string[] = [];

    if (recentAvg > previousAvg * 1.5) {
      risk = 'high';
      probability = 70;
      factors.push('Increasing episode frequency');
    } else if (recentAvg > previousAvg) {
      risk = 'medium';
      probability = 50;
      factors.push('Slight increase in episodes');
    }

    // Check for common recent triggers
    const recentTriggers = last7Days.flatMap(e => e.triggers || []);
    const triggerCounts: { [key: string]: number } = {};
    recentTriggers.forEach(t => {
      triggerCounts[t] = (triggerCounts[t] || 0) + 1;
    });

    const topRecentTrigger = Object.entries(triggerCounts).sort((a, b) => b[1] - a[1])[0];
    if (topRecentTrigger && topRecentTrigger[1] >= 2) {
      factors.push(`Recurring trigger: ${topRecentTrigger[0]}`);
      probability += 10;
    }

    // Check recent intensity
    const avgRecentIntensity = last7Days.length > 0
      ? last7Days.reduce((sum, e) => sum + e.intensity, 0) / last7Days.length
      : 0;

    if (avgRecentIntensity >= 7) {
      factors.push('High intensity episodes');
      probability += 15;
      if (risk === 'low') risk = 'medium';
    }

    const recommendation = risk === 'high'
      ? 'Consider consulting with your healthcare provider. Increase preventive measures and track patterns closely.'
      : risk === 'medium'
      ? 'Monitor your triggers carefully. Ensure you\'re following good habits (hydration, sleep, meals).'
      : 'Keep up your current management strategies. Continue logging to maintain awareness.';

    return {
      risk,
      probability: Math.min(95, probability),
      factors: factors.length > 0 ? factors : ['Based on historical patterns'],
      recommendation,
    };
  };

  const calculateTrend = (episodes: HeadacheEpisode[]): 'improving' | 'stable' | 'worsening' => {
    if (episodes.length < 10) return 'stable';

    const recent = episodes.slice(0, Math.floor(episodes.length / 2));
    const older = episodes.slice(Math.floor(episodes.length / 2));

    const recentAvgIntensity = recent.reduce((sum, e) => sum + e.intensity, 0) / recent.length;
    const olderAvgIntensity = older.reduce((sum, e) => sum + e.intensity, 0) / older.length;

    const recentFreq = recent.length / 15; // episodes per day
    const olderFreq = older.length / 15;

    if (recentAvgIntensity < olderAvgIntensity * 0.8 && recentFreq < olderFreq * 0.8) {
      return 'improving';
    } else if (recentAvgIntensity > olderAvgIntensity * 1.2 || recentFreq > olderFreq * 1.2) {
      return 'worsening';
    }

    return 'stable';
  };

  const handleTriggerPress = (trigger: TriggerAnalysis) => {
    setSelectedTrigger(trigger);
    setShowTriggerModal(true);
  };

  const handlePatternPress = (pattern: Pattern) => {
    setSelectedPattern(pattern);
    setShowPatternModal(true);
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

  const getTrendColor = () => {
    if (trend === 'improving') return theme.colors.rsSecondary;
    if (trend === 'worsening') return theme.colors.rsAlert;
    return theme.colors.rsTextDim;
  };

  const getTrendIcon = () => {
    if (trend === 'improving') return '↑';
    if (trend === 'worsening') return '↓';
    return '→';
  };

  const getRiskColor = (risk: 'high' | 'medium' | 'low') => {
    if (risk === 'high') return theme.colors.rsAlert;
    if (risk === 'medium') return theme.colors.rsWarn;
    return theme.colors.rsSecondary;
  };

  return (
    <Screen>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <View style={styles.headerRow}>
            <View>
              <Text variant="H1">Insights</Text>
              <Text variant="Body" color={theme.colors.rsTextDim}>
                AI-powered analysis
              </Text>
            </View>
            {episodes.length >= 5 && (
              <View style={[styles.trendBadge, { backgroundColor: getTrendColor() + '20', borderRadius: theme.radius.pill }]}>
                <Text variant="Caption" color={getTrendColor()} style={{ fontWeight: '600' }}>
                  {getTrendIcon()} {trend}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Predictive Insight Card */}
        {predictiveInsight && (
          <TouchableOpacity
            style={[
              styles.predictionCard,
              { 
                backgroundColor: theme.colors.rsSurface, 
                borderRadius: theme.radius.lg,
                borderLeftWidth: 4,
                borderLeftColor: getRiskColor(predictiveInsight.risk),
              },
            ]}
          >
            <View style={styles.predictionHeader}>
              <Text variant="Title">Risk Assessment</Text>
              <View style={[styles.riskBadge, { backgroundColor: getRiskColor(predictiveInsight.risk), borderRadius: theme.radius.pill }]}>
                <Text variant="Caption" color={theme.colors.rsBg} style={{ fontWeight: '700' }}>
                  {predictiveInsight.risk.toUpperCase()}
                </Text>
              </View>
            </View>

            <Text variant="Body" color={theme.colors.rsText} style={{ marginVertical: 8 }}>
              {predictiveInsight.probability}% likelihood of episode in next 24-48h
            </Text>

            <View style={styles.factorsList}>
              {predictiveInsight.factors.map((factor, idx) => (
                <Text key={idx} variant="Caption" color={theme.colors.rsTextDim}>
                  • {factor}
                </Text>
              ))}
            </View>

            <View style={[styles.recommendationBox, { backgroundColor: theme.colors.rsBg, borderRadius: theme.radius.md, marginTop: 12 }]}>
              <Text variant="Caption" color={theme.colors.rsText}>
                {predictiveInsight.recommendation}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Weekly Chart Card */}
        <TouchableOpacity
          style={[
            styles.card,
            { backgroundColor: theme.colors.rsSurface, borderRadius: theme.radius.md },
          ]}
          onPress={() => setShowMonthlyModal(true)}
        >
          <View style={styles.chartHeader}>
            <Text variant="Title">Last 7 Days</Text>
            <Text variant="Caption" color={theme.colors.rsTextDim}>
              Tap for monthly
            </Text>
          </View>

          {weeklyData.length > 0 && weeklyData.some(d => d.episodes > 0) ? (
            <>
              <View style={styles.chartContainer}>
                <View style={styles.barContainer}>
                  {weeklyData.map((d, i) => {
                    const maxEpisodes = Math.max(...weeklyData.map(day => day.episodes), 1);
                    // Use a more conservative scale - minimum 10% for any data, max 75%
                    const heightPercent = d.episodes > 0 
                      ? 10 + ((d.episodes / maxEpisodes) * 65)
                      : 4;
                    
                    return (
                      <View key={i} style={styles.barWrapper}>
                        <View
                          style={[
                            styles.bar,
                            {
                              height: `${heightPercent}%`,
                              backgroundColor: d.episodes === 0 
                                ? theme.colors.rsBorder + '30'
                                : d.episodes === maxEpisodes
                                ? theme.colors.rsAlert
                                : theme.colors.rsPrimary,
                            },
                          ]}
                        />
                        <Text
                          variant="Body"
                          color={d.episodes > 0 ? theme.colors.rsText : theme.colors.rsTextDim}
                          style={styles.barLabel}
                        >
                          {d.episodes}
                        </Text>
                        <Text
                          variant="Caption"
                          color={theme.colors.rsTextDim}
                          style={styles.dayLabel}
                        >
                          {new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </Text>
                      </View>
                    );
                  })}
                </View>

                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text variant="Caption" color={theme.colors.rsTextDim}>Avg Intensity</Text>
                    <Text variant="Title" color={theme.colors.rsAlert} style={styles.statValue}>
                      {weeklyData.filter(d => d.avgIntensity > 0).length > 0
                        ? Math.round(
                            (weeklyData.reduce((s, d) => s + d.avgIntensity, 0) / 
                            weeklyData.filter(d => d.avgIntensity > 0).length) * 10
                          ) / 10
                        : 0}
                      /10
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text variant="Caption" color={theme.colors.rsTextDim}>Total Episodes</Text>
                    <Text variant="Title" color={theme.colors.rsPrimary} style={styles.statValue}>
                      {weeklyData.reduce((s, d) => s + d.episodes, 0)}
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text variant="Caption" color={theme.colors.rsTextDim}>Peak Day</Text>
                    <Text variant="Title" color={theme.colors.rsWarn} style={styles.statValue}>
                      {Math.max(...weeklyData.map(d => d.episodes))}
                    </Text>
                  </View>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.emptyStateContainer}>
              <Text variant="Body" color={theme.colors.rsText} style={{ marginTop: 12, textAlign: 'center', fontWeight: '600' }}>
                No Episodes Logged Yet
              </Text>
              <Text variant="Caption" color={theme.colors.rsTextDim} style={{ marginTop: 8, textAlign: 'center' }}>
                Start logging headache episodes to see your weekly trends and patterns.
              </Text>
              <View style={{ marginTop: 20 }}>
                <CTAButton
                  variant="secondary"
                  title="Log First Episode"
                  onPress={() => navigation.navigate('LogHeadache' as never)}
                  fullWidth={false}
                />
              </View>
            </View>
          )}
        </TouchableOpacity>

        {/* Detected Patterns */}
        {patterns.length > 0 && (
          <View
            style={[
              styles.card,
              { backgroundColor: theme.colors.rsSurface, borderRadius: theme.radius.md },
            ]}
          >
            <Text variant="Title" style={styles.sectionTitle}>
              Detected Patterns
            </Text>

            {patterns.map((pattern, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.patternRow, { borderBottomColor: theme.colors.rsBorder }]}
                onPress={() => handlePatternPress(pattern)}
              >
                <View style={styles.patternContent}>
                  <View style={styles.patternHeader}>
                    <Text variant="Body" color={theme.colors.rsText} style={{ fontWeight: '600' }}>
                      {pattern.title}
                    </Text>
                    <View style={[
                      styles.confidenceBadge,
                      {
                        backgroundColor: pattern.confidence === 'high'
                          ? theme.colors.rsSecondary + '30'
                          : theme.colors.rsWarn + '30',
                        borderRadius: theme.radius.pill,
                      },
                    ]}>
                      <Text
                        variant="Caption"
                        color={pattern.confidence === 'high' ? theme.colors.rsSecondary : theme.colors.rsWarn}
                        style={{ fontSize: 10, fontWeight: '600' }}
                      >
                        {pattern.confidence}
                      </Text>
                    </View>
                  </View>
                  <Text variant="Caption" color={theme.colors.rsTextDim}>
                    {pattern.description}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Top Triggers with ML Score */}
        {topTriggers.length > 0 && (
          <View
            style={[
              styles.card,
              { backgroundColor: theme.colors.rsSurface, borderRadius: theme.radius.md },
            ]}
          >
            <Text variant="Title" style={styles.sectionTitle}>
              Trigger Analysis
            </Text>

            {topTriggers.map((trigger, index) => (
              <TouchableOpacity
                key={trigger.trigger}
                style={[styles.triggerRow, { borderBottomColor: theme.colors.rsBorder }]}
                onPress={() => handleTriggerPress(trigger)}
              >
                <View style={styles.triggerLeft}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text variant="Body" color={theme.colors.rsText} style={{ fontWeight: '600' }}>
                      {index + 1}. {trigger.trigger}
                    </Text>
                    <View style={[
                      styles.scoreBadge,
                      {
                        backgroundColor: trigger.correlationScore >= 70
                          ? theme.colors.rsAlert + '20'
                          : trigger.correlationScore >= 50
                          ? theme.colors.rsWarn + '20'
                          : theme.colors.rsSecondary + '20',
                        borderRadius: theme.radius.pill,
                      },
                    ]}>
                      <Text
                        variant="Caption"
                        color={
                          trigger.correlationScore >= 70
                            ? theme.colors.rsAlert
                            : trigger.correlationScore >= 50
                            ? theme.colors.rsWarn
                            : theme.colors.rsSecondary
                        }
                        style={{ fontSize: 10, fontWeight: '700' }}
                      >
                        {trigger.correlationScore}
                      </Text>
                    </View>
                  </View>
                  <Text variant="Caption" color={theme.colors.rsTextDim}>
                    {trigger.frequency} episodes • Avg intensity: {trigger.avgIntensity}/10
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

        {/* Quick Actions */}
        <View style={styles.section}>
          <CTAButton
            variant="primary"
            title="Log New Episode"
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
        {/* {__DEV__ && (
          <View style={styles.section}>
            <CTAButton
              variant="ghost"
              title="🧪 Load Demo Data"
              onPress={handleLoadDemoData}
              fullWidth
            />
          </View>
        )} */}

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
                          (monthlyData.filter((d) => d.avgIntensity > 0).length || 1)) * 10,
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
                          (monthlyData.filter((d) => d.avgEffectiveness > 0).length || 1)) * 10,
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
                      Correlation Score
                    </Text>
                    <Text variant="Title" color={theme.colors.rsWarn}>
                      {selectedTrigger.correlationScore}/100
                    </Text>
                  </View>

                  <View style={styles.triggerStat}>
                    <Text variant="Caption" color={theme.colors.rsTextDim}>
                      Average Intensity
                    </Text>
                    <Text variant="Title" color={theme.colors.rsAlert}>
                      {selectedTrigger.avgIntensity}/10
                    </Text>
                  </View>

                  <View style={styles.triggerStat}>
                    <Text variant="Caption" color={theme.colors.rsTextDim}>
                      Risk Increase
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
                    This trigger has a correlation score of {selectedTrigger.correlationScore}/100, 
                    indicating {selectedTrigger.correlationScore >= 70 ? 'strong' : selectedTrigger.correlationScore >= 50 ? 'moderate' : 'weak'} correlation 
                    with your episodes. Episodes with this trigger average {selectedTrigger.avgIntensity}/10 in intensity.
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

      {/* Pattern Details Modal */}
      <Modal
        visible={showPatternModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPatternModal(false)}
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
            {selectedPattern && (
              <>
                <Text variant="H2" style={styles.modalTitle}>
                  {selectedPattern.title}
                </Text>

                <View style={[
                  styles.confidenceBadge,
                  {
                    backgroundColor: selectedPattern.confidence === 'high'
                      ? theme.colors.rsSecondary + '30'
                      : theme.colors.rsWarn + '30',
                    borderRadius: theme.radius.pill,
                    alignSelf: 'center',
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                  },
                ]}>
                  <Text
                    variant="Body"
                    color={selectedPattern.confidence === 'high' ? theme.colors.rsSecondary : theme.colors.rsWarn}
                    style={{ fontWeight: '600' }}
                  >
                    {selectedPattern.confidence.toUpperCase()} CONFIDENCE
                  </Text>
                </View>

                <View style={styles.patternDetailSection}>
                  <Text variant="Caption" color={theme.colors.rsTextDim}>
                    OBSERVATION
                  </Text>
                  <Text variant="Body" color={theme.colors.rsText} style={{ marginTop: 8 }}>
                    {selectedPattern.description}
                  </Text>
                </View>

                <View
                  style={[
                    styles.suggestionBox,
                    { backgroundColor: theme.colors.rsBg, borderRadius: theme.radius.md },
                  ]}
                >
                  <Text variant="Caption" color={theme.colors.rsTextDim} style={{ marginBottom: 8 }}>
                    ACTIONABLE INSIGHT
                  </Text>
                  <Text variant="Body" color={theme.colors.rsText}>
                    {selectedPattern.actionable}
                  </Text>
                </View>

                <View style={styles.modalButtons}>
                  <CTAButton
                    variant="secondary"
                    title="Close"
                    onPress={() => setShowPatternModal(false)}
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
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 16,
  },
  section: {
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  trendBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  predictionCard: {
    padding: 20,
  },
  predictionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  riskBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  factorsList: {
    gap: 6,
    marginTop: 8,
  },
  recommendationBox: {
    padding: 12,
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
    gap: 16,
  },
  barContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 100,
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 4,
  },
  barWrapper: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
    justifyContent: 'flex-end',
    height: '100%',
  },
  bar: {
    width: '65%',
    maxWidth: 28,
    borderRadius: 6,
    minHeight: 3,
  },
  barLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-around',
    paddingTop: 8,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  statValue: {
    fontWeight: '700',
  },
  monthlyStats: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 8,
  },
  statCard: {
    flex: 1,
    gap: 6,
    alignItems: 'center',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 40,
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  patternRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  patternContent: {
    gap: 6,
  },
  patternHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  patternDetailSection: {
    marginVertical: 12,
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
    gap: 6,
  },
  triggerRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  scoreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
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