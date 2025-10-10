import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, Text, Screen } from '../theme';
import { useSessionStore } from '../store/session';

export const HomeScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { sessionActive } = useSessionStore();
  
  const [deviceConnected, setDeviceConnected] = useState(true);
  const [headStatus, setHeadStatus] = useState<'Calm' | 'Active'>('Calm');

  // Update head status based on session
  useEffect(() => {
    setHeadStatus(sessionActive ? 'Active' : 'Calm');
  }, [sessionActive]);

  return (
    <Screen>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Welcome Header */}
        <View style={styles.header}>
          <Text variant="H1" style={styles.welcomeText}>
            SyncRelief
          </Text>
        </View>

        {/* Device Status Card */}
        <View
          style={[
            styles.deviceStatusCard,
            {
              backgroundColor: theme.colors.rsSurface,
              borderRadius: theme.radius.md,
            },
          ]}
        >
          <View style={styles.deviceStatusContent}>
            <View style={styles.deviceStatusLeft}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: deviceConnected
                      ? theme.colors.rsSecondary
                      : theme.colors.rsTextDim,
                  },
                ]}
              />
              <Text variant="Title">Device Connected</Text>
            </View>
            {deviceConnected && (
              <Feather name="check-circle" size={24} color={theme.colors.rsSecondary} />
            )}
          </View>
        </View>

        {/* Head Status Circle */}
        <View style={styles.headStatusContainer}>
          <View
            style={[
              styles.headStatusCircle,
              {
                backgroundColor: theme.colors.rsSurface,
                borderColor: theme.colors.rsSecondary,
              },
            ]}
          >
            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: theme.colors.rsSecondary },
              ]}
            />
            <Text variant="Caption" color={theme.colors.rsTextDim} style={styles.statusLabel}>
              Current Head Status
            </Text>
            <Text
              variant="H1"
              color={theme.colors.rsSecondary}
              style={styles.statusValue}
              numberOfLines={1}
            >
              {headStatus}
            </Text>
            <Text variant="Caption" color={theme.colors.rsTextDim} style={styles.statusSubtext}>
              No pressure detected
            </Text>
          </View>
        </View>

        {/* Start Therapy Card */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('TherapySession' as never)}
        >
          <LinearGradient
            colors={['#5B8FE5', '#4A7DD9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.actionCard, { borderRadius: theme.radius.lg }]}
          >
            <View style={styles.actionCardContent}>
            <View style={styles.actionIconContainer}>
              <View style={[styles.playIconBg, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
                <Feather name="play" size={28} color="#FFFFFF" />
                </View>
              </View>
              <View style={styles.actionTextContainer}>
                <Text variant="H2" style={styles.actionTitle}>
                  Start Therapy
                </Text>
                <Text variant="Body" style={styles.actionSubtitle}>
                  Activate your headache relief session
                </Text>
              </View>
              <Feather name="arrow-right" size={24} color="#FFFFFF" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Log Daily Inputs Card */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('LogHabits' as never)}
          style={[
            styles.actionCard,
            {
              backgroundColor: theme.colors.rsSurface,
              borderRadius: theme.radius.lg,
            },
          ]}
        >
          <View style={styles.actionCardContent}>
            <View style={styles.actionIconContainer}>
              <View
                style={[
                  styles.iconBg,
                  { backgroundColor: '#8B6914', borderRadius: theme.radius.md },
                ]}
              >
                <Feather name="clipboard" size={24} color="#F59E0B" />
              </View>
            </View>
            <View style={styles.actionTextContainer}>
              <Text variant="Title">Log Daily Inputs</Text>
              <Text variant="Body" color={theme.colors.rsTextDim}>
                Track symptoms, stress, sleep & hydration
              </Text>
            </View>
            <Feather name="arrow-right" size={24} color={theme.colors.rsTextDim} />
          </View>
        </TouchableOpacity>

        {/* Log Headache Card */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('LogHeadache' as never)}
          style={[
            styles.actionCard,
            {
              backgroundColor: theme.colors.rsSurface,
              borderRadius: theme.radius.lg,
            },
          ]}
        >
          <View style={styles.actionCardContent}>
            <View style={styles.actionIconContainer}>
              <View
                style={[
                  styles.iconBg,
                  { backgroundColor: '#7F1D1D', borderRadius: theme.radius.md },
                ]}
              >
                <Feather name="alert-circle" size={24} color={theme.colors.rsAlert} />
              </View>
            </View>
            <View style={styles.actionTextContainer}>
              <Text variant="Title">Log Headache</Text>
              <Text variant="Body" color={theme.colors.rsTextDim}>
                Record headache episodes and triggers
              </Text>
            </View>
            <Feather name="arrow-right" size={24} color={theme.colors.rsTextDim} />
          </View>
        </TouchableOpacity>

        {/* History Card */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Insights' as never)}
          style={[
            styles.actionCard,
            {
              backgroundColor: theme.colors.rsSurface,
              borderRadius: theme.radius.lg,
            },
          ]}
        >
          <View style={styles.actionCardContent}>
            <View style={styles.actionIconContainer}>
              <View
                style={[
                  styles.iconBg,
                  { backgroundColor: '#115E59', borderRadius: theme.radius.md },
                ]}
              >
                <Feather name="trending-up" size={24} color={theme.colors.rsSecondary} />
              </View>
            </View>
            <View style={styles.actionTextContainer}>
              <Text variant="Title">History</Text>
              <Text variant="Body" color={theme.colors.rsTextDim}>
                View past trends and headache logs
              </Text>
            </View>
            <Feather name="arrow-right" size={24} color={theme.colors.rsTextDim} />
          </View>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  header: {
    marginTop: 4,
    marginBottom: 4,
    gap: 4,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
  },
  deviceStatusCard: {
    padding: 12,
  },
  deviceStatusContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deviceStatusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  headStatusContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  headStatusCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
  },
  statusValue: {
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 8,
  },
  statusSubtext: {
    fontSize: 12,
    textAlign: 'center',
  },
  actionCard: {
    padding: 16,
  },
  actionCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIconBg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTextContainer: {
    flex: 1,
    gap: 4,
  },
  actionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  actionSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
  },
  bottomSpacer: {
    height: 8,
  },
});
