import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme, Text, Screen } from '../theme';
import { useSessionStore } from '../store/session';
import { useEpisodesFirebaseStore } from '../store/episodes-firebase';
import { CTAButton } from '../components/CTAButton';
import { SegmentedControl } from '../components/SegmentedControl';
import { SliderRow } from '../components/SliderRow';
import { ToggleRow } from '../components/ToggleRow';
import { RatingBar } from '../components/RatingBar';
import { getBarometricSnapshot } from '../lib/baro';

// Mode configuration with pain region icons
const MODE_CONFIG = {
  Tension: { icon: 'head-cog-outline', description: 'Band around head' },
  Migraine: { icon: 'head-flash-outline', description: 'One-sided pain' },
  Sinus: { icon: 'face-man-outline', description: 'Face & forehead' },
  Cluster: { icon: 'eye-outline', description: 'Eye & temple' },
  Custom: { icon: 'cog-outline', description: 'Custom settings' },
} as const;

export const TherapySessionScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const {
    sessionActive,
    mode,
    pressure,
    massage,
    massagePattern,
    heat,
    cold,
    temperatureC,
    elapsedSec,
    setMode,
    setPressure,
    setMassage,
    setMassagePattern,
    setHeat,
    setCold,
    setTemperature,
    startSession,
    pauseSession,
    stopSession,
    resetElapsed,
  } = useSessionStore();

  const { addEpisode } = useEpisodesFirebaseStore();

  const [baroData, setBaroData] = useState<{ hPa: number; label: string; trend: 'rising' | 'falling' | 'steady' }>({ 
    hPa: 1013, 
    label: 'Neutral', 
    trend: 'steady' 
  });
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [effectiveness, setEffectiveness] = useState(5);
  const [effectivenessNotes, setEffectivenessNotes] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(15);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Format elapsed time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Load barometric data
  useEffect(() => {
    const loadBaro = async () => {
      const data = await getBarometricSnapshot();
      setBaroData(data);
    };
    loadBaro();
  }, []);

  // Check if session >= 10 min to show rating
  useEffect(() => {
    if (sessionActive && elapsedSec >= 600 && elapsedSec % 60 === 0) {
      setShowRatingModal(true);
      pauseSession();
    }
  }, [elapsedSec, sessionActive]);

  const handleStop = () => {
    if (elapsedSec >= 600) {
      setShowRatingModal(true);
    }
    stopSession();
  };

  const handleSaveRating = async () => {
    try {
      await addEpisode({
        startTime: new Date().toISOString(),
        durationMin: Math.floor(elapsedSec / 60),
        intensity: 0,
        location: [],
        quality: [],
        triggers: [],
        usedDevice: true,
        deviceMode: mode,
        deviceDuration: Math.floor(elapsedSec / 60),
        deviceTemp: temperatureC,
        devicePressure: pressure,
        devicePattern: massagePattern,
        deviceEffectiveness: effectiveness,
        deviceNotes: effectivenessNotes.trim() || undefined,
        barometricPressure: baroData.hPa,
        notes: `Device session: ${mode}`,
      });

      setShowRatingModal(false);
      setEffectiveness(5);
      setEffectivenessNotes('');
      resetElapsed();
    } catch (error) {
      console.error('Failed to save rating:', error);
    }
  };

  const handleSkipRating = () => {
    setShowRatingModal(false);
    setEffectiveness(5);
    setEffectivenessNotes('');
    resetElapsed();
  };

  const handleStartSession = () => {
    if (selectedDuration && selectedDuration > 0) {
      startSession(selectedDuration);
    }
  };

  return (
    <Screen>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color={theme.colors.rsText} />
          </TouchableOpacity>
          <Text variant="H2">Therapy Session</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Quick info cards at top */}
        <View style={styles.infoCardsRow}>
          <View
            style={[
              styles.infoCard,
              { backgroundColor: theme.colors.rsSurface, borderRadius: theme.radius.sm },
            ]}
          >
            <Text variant="Caption" color={theme.colors.rsTextDim}>
              Pressure
            </Text>
            <Text variant="Body" color={theme.colors.rsPrimary} style={styles.infoValue}>
              {baroData.hPa} hPa
            </Text>
          </View>
          <View
            style={[
              styles.infoCard,
              { backgroundColor: theme.colors.rsSurface, borderRadius: theme.radius.sm },
            ]}
          >
            <Text variant="Caption" color={theme.colors.rsTextDim}>
              Temp
            </Text>
            <Text variant="Body" color={theme.colors.rsPrimary} style={styles.infoValue}>
              {temperatureC}°C
            </Text>
          </View>
          <View
            style={[
              styles.infoCard,
              { backgroundColor: theme.colors.rsSurface, borderRadius: theme.radius.sm },
            ]}
          >
            <Text variant="Caption" color={theme.colors.rsTextDim}>
              Trend
            </Text>
            <View style={styles.trendRow}>
              <Text variant="Body" color={theme.colors.rsPrimary} style={styles.infoValue}>
                {baroData.trend === 'rising' ? '↗' : baroData.trend === 'falling' ? '↘' : '→'}
              </Text>
              <Text variant="Caption" color={theme.colors.rsPrimary} style={styles.trendText}>
                {baroData.trend.charAt(0).toUpperCase() + baroData.trend.slice(1)}
              </Text>
            </View>
          </View>
        </View>

        {/* Duration selector */}
        <View style={styles.section}>
          <Text variant="Title">How long would you like to practice?</Text>
          <View style={styles.durationGrid}>
            {[10, 15, 20, 30].map((mins) => (
              <TouchableOpacity
                key={mins}
                style={[
                  styles.durationCard,
                  {
                    backgroundColor:
                      selectedDuration === mins
                        ? theme.colors.rsPrimary
                        : theme.colors.rsSurface,
                    borderRadius: theme.radius.md,
                    borderWidth: 1,
                    borderColor:
                      selectedDuration === mins
                        ? theme.colors.rsPrimary
                        : theme.colors.rsBorder,
                  },
                ]}
                onPress={() => setSelectedDuration(mins)}
                activeOpacity={0.7}
              >
                <Text
                  variant="H2"
                  color={
                    selectedDuration === mins
                      ? theme.colors.rsBg
                      : theme.colors.rsText
                  }
                >
                  {mins}
                </Text>
                <Text
                  variant="Caption"
                  color={
                    selectedDuration === mins
                      ? theme.colors.rsBg
                      : theme.colors.rsTextDim
                  }
                >
                  minutes
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Mode selection with icons */}
        <View style={styles.section}>
          <Text variant="Title">Choose Your Mode</Text>
          <View style={styles.modeGrid}>
            {(Object.keys(MODE_CONFIG) as Array<keyof typeof MODE_CONFIG>).map((modeName, index) => (
              <TouchableOpacity
                key={modeName}
                style={[
                  styles.modeCard,
                  index === 4 && styles.modeCardLast,
                  {
                    backgroundColor:
                      mode === modeName ? theme.colors.rsPrimary : theme.colors.rsSurface,
                    borderRadius: theme.radius.md,
                    borderWidth: 1,
                    borderColor:
                      mode === modeName ? theme.colors.rsPrimary : theme.colors.rsBorder,
                  },
                ]}
                onPress={() => setMode(modeName as any)}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name={MODE_CONFIG[modeName].icon as any}
                  size={32}
                  color={mode === modeName ? theme.colors.rsBg : theme.colors.rsPrimary}
                />
                <Text
                  variant="Body"
                  color={mode === modeName ? theme.colors.rsBg : theme.colors.rsText}
                  style={styles.modeName}
                >
                  {modeName}
                </Text>
                <Text
                  variant="Caption"
                  color={mode === modeName ? theme.colors.rsBg : theme.colors.rsTextDim}
                  style={styles.modeDescription}
                >
                  {MODE_CONFIG[modeName].description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Advanced settings (collapsible) */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.advancedHeader}
            onPress={() => setShowAdvanced(!showAdvanced)}
            activeOpacity={0.7}
          >
            <View style={styles.advancedHeaderLeft}>
              <Feather name="settings" size={18} color={theme.colors.rsTextDim} />
              <Text variant="Title" color={theme.colors.rsText}>
                Advanced Settings
              </Text>
            </View>
            <Feather
              name={showAdvanced ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={theme.colors.rsTextDim}
            />
          </TouchableOpacity>

          {showAdvanced && (
            <View
              style={[
                styles.advancedContent,
                {
                  backgroundColor: theme.colors.rsSurface,
                  borderRadius: theme.radius.md,
                },
              ]}
            >
              <SliderRow label="Pressure" value={pressure} onChange={setPressure} />

              <View style={styles.divider} />

              <SliderRow label="Massage" value={massage} onChange={setMassage} />

              <View style={styles.patternRow}>
                <Text variant="Caption" color={theme.colors.rsTextDim}>
                  Pattern
                </Text>
                <SegmentedControl
                  options={['Wave', 'Pulse', 'Knead']}
                  value={massagePattern}
                  onChange={(val) => setMassagePattern(val as any)}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.togglesRow}>
                <ToggleRow label="Heat" value={heat} onValueChange={setHeat} />
                <ToggleRow label="Cold" value={cold} onValueChange={setCold} />
              </View>
            </View>
          )}
        </View>

        {/* Safety note */}
        <View
          style={[
            styles.safetyCard,
            {
              backgroundColor: theme.colors.rsSurface,
              borderRadius: theme.radius.sm,
              borderLeftColor: theme.colors.rsWarn,
            },
          ]}
        >
          <Feather name="alert-circle" size={16} color={theme.colors.rsWarn} />
          <Text variant="Caption" color={theme.colors.rsTextDim} style={styles.safetyText}>
            Start low, increase gradually. Max 30 min sessions.
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Sticky footer */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: theme.colors.rsSurface,
            borderTopColor: theme.colors.rsBorder,
          },
        ]}
      >
        {!sessionActive ? (
          <CTAButton
            variant="primary"
            title="Start Session"
            onPress={handleStartSession}
            fullWidth
          />
        ) : (
          <View style={styles.activeFooter}>
            <View style={styles.elapsedContainer}>
              <Text variant="Title" color={theme.colors.rsPrimary}>
                {formatTime(elapsedSec)}
              </Text>
            </View>
            <View style={styles.footerButtons}>
              <View style={styles.flexButton}>
                <CTAButton variant="secondary" title="Pause" onPress={pauseSession} />
              </View>
              <View style={styles.flexButton}>
                <CTAButton variant="primary" title="Stop" onPress={handleStop} />
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Rating modal */}
      <Modal
        visible={showRatingModal}
        transparent
        animationType="fade"
        onRequestClose={handleSkipRating}
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
              Rate Effectiveness
            </Text>
            <Text variant="Caption" color={theme.colors.rsTextDim} style={styles.modalSubtitle}>
              How effective was this session?
            </Text>

            <View style={styles.ratingSection}>
              <RatingBar value={effectiveness} onChange={setEffectiveness} />
              <Text variant="Caption" color={theme.colors.rsTextDim} style={styles.ratingLabel}>
                {effectiveness}/10
              </Text>
            </View>

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
              value={effectivenessNotes}
              onChangeText={setEffectivenessNotes}
              placeholder="Notes (optional)"
              placeholderTextColor={theme.colors.rsTextDim}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <View style={styles.flexButton}>
                <CTAButton variant="secondary" title="Skip" onPress={handleSkipRating} />
              </View>
              <View style={styles.flexButton}>
                <CTAButton variant="primary" title="Save" onPress={handleSaveRating} />
              </View>
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
    padding: 20,
    gap: 16,
    paddingBottom: 100,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  placeholder: {
    width: 24,
  },
  infoCardsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  infoCard: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  infoValue: {
    fontWeight: '600',
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 11,
    fontWeight: '500',
  },
  section: {
    gap: 12,
  },
  durationGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  durationCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minHeight: 80,
  },
  modeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modeCard: {
    width: '48%',
    padding: 16,
    alignItems: 'center',
    gap: 8,
    minHeight: 120,
  },
  modeCardLast: {
    width: '48%',
    marginLeft: '26%',
  },
  modeName: {
    fontWeight: '600',
    textAlign: 'center',
  },
  modeDescription: {
    fontSize: 11,
    textAlign: 'center',
  },
  advancedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  advancedHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  advancedContent: {
    padding: 16,
    gap: 16,
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#27272F',
    marginVertical: 4,
  },
  patternRow: {
    gap: 8,
  },
  togglesRow: {
    gap: 0,
  },
  safetyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
    borderLeftWidth: 3,
  },
  safetyText: {
    flex: 1,
    lineHeight: 18,
  },
  bottomSpacer: {
    height: 80,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
  },
  activeFooter: {
    gap: 12,
  },
  elapsedContainer: {
    alignItems: 'center',
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  flexButton: {
    flex: 1,
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
  modalSubtitle: {
    textAlign: 'center',
    marginTop: -8,
  },
  ratingSection: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  notesInput: {
    minHeight: 80,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
});