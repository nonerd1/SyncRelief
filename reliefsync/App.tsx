import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemeProvider, useTheme } from './src/theme';
import { useAuthStore } from './src/store/auth';
import { useSessionStore } from './src/store/session';
import { useEpisodesFirebaseStore } from './src/store/episodes-firebase';
import { useHabitsFirebaseStore } from './src/store/habits-firebase';

// Screens
import { HomeScreen } from './src/screens/HomeScreen';
import { TherapySessionScreen } from './src/screens/TherapySessionScreen';
import { LogHabitsScreen } from './src/screens/LogHabitsScreen';
import { LogHeadacheScreen } from './src/screens/LogHeadacheScreen';
import { InsightsScreen } from './src/screens/InsightsScreen';
import { LoginScreen } from './src/screens/LoginScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

// ============================================
// Home Stack Navigator
// ============================================
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="TherapySession" component={TherapySessionScreen} />
    </HomeStack.Navigator>
  );
}

// ============================================
// Main App Navigator (Logged In)
// ============================================
function AppNavigator() {
  const theme = useTheme();

  return (
    <>
      <StatusBar style="light" backgroundColor={theme.colors.rsBg} />
      <NavigationContainer
        theme={{
          dark: true,
          colors: {
            primary: theme.colors.rsPrimary,
            background: theme.colors.rsBg,
            card: theme.colors.rsSurface,
            text: theme.colors.rsText,
            border: theme.colors.rsBorder,
            notification: theme.colors.rsSecondary,
          },
          fonts: {
            regular: {
              fontFamily: 'System',
              fontWeight: '400',
            },
            medium: {
              fontFamily: 'System',
              fontWeight: '500',
            },
            bold: {
              fontFamily: 'System',
              fontWeight: '700',
            },
            heavy: {
              fontFamily: 'System',
              fontWeight: '900',
            },
          },
        }}
      >
        <Tab.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: theme.colors.rsSurface,
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.rsBorder,
            },
            headerTintColor: theme.colors.rsText,
            headerTitleStyle: {
              fontWeight: '600',
              fontSize: 18,
            },
            tabBarStyle: {
              backgroundColor: theme.colors.rsSurface,
              borderTopColor: theme.colors.rsBorder,
              borderTopWidth: 1,
              paddingTop: 8,
              paddingBottom: 28,
              height: 85,
            },
            tabBarActiveTintColor: theme.colors.rsPrimary600,
            tabBarInactiveTintColor: theme.colors.rsTextDim,
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '500',
            },
          }}
        >
          <Tab.Screen
            name="Home"
            component={HomeStackNavigator}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Feather name="home" size={size} color={color} />
              ),
              tabBarLabel: 'Home',
              headerShown: false,
            }}
          />
          <Tab.Screen
            name="LogHabits"
            component={LogHabitsScreen}
            options={{
              title: 'Log Habits',
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="notebook-outline" size={size} color={color} />
              ),
              tabBarLabel: 'Habits',
            }}
          />
          <Tab.Screen
            name="LogHeadache"
            component={LogHeadacheScreen}
            options={{
              title: 'Log Headache',
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="head-alert-outline" size={size} color={color} />
              ),
              tabBarLabel: 'Headache',
            }}
          />
          <Tab.Screen
            name="Insights"
            component={InsightsScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Feather name="bar-chart-2" size={size} color={color} />
              ),
              tabBarLabel: 'Insights',
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}

// ============================================
// Auth Navigator (Logged Out)
// ============================================
function AuthNavigator() {
  return (
    <NavigationContainer>
      <AuthStack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <AuthStack.Screen name="Login" component={LoginScreen} />
      </AuthStack.Navigator>
    </NavigationContainer>
  );
}

// ============================================
// App Initializer - THE MAGIC HAPPENS HERE
// ============================================
function AppInitializer() {
  const user = useAuthStore((state) => state.user);
  const authLoading = useAuthStore((state) => state.loading);
  const authInitialize = useAuthStore((state) => state.initialize);

  const sessionInitialize = useSessionStore((state) => state.initialize);

  // Firebase stores
  const episodesSyncFirebase = useEpisodesFirebaseStore((state) => state.syncFromFirebase);
  const episodesSubscribe = useEpisodesFirebaseStore((state) => state.subscribeToUpdates);
  const episodesClear = useEpisodesFirebaseStore((state) => state.clear);

  const habitsSyncFirebase = useHabitsFirebaseStore((state) => state.syncFromFirebase);
  const habitsSubscribe = useHabitsFirebaseStore((state) => state.subscribeToUpdates);
  const habitsClear = useHabitsFirebaseStore((state) => state.clear);

  // Initialize Firebase auth
  useEffect(() => {
    authInitialize();
  }, [authInitialize]);

  // When user logs in: sync all data from Firebase
  useEffect(() => {
    if (user) {
      console.log('User logged in:', user.uid);

      // Initialize local session store
      sessionInitialize();

      // Sync episodes from Firebase
      episodesSyncFirebase();
      const unsubscribeEpisodes = episodesSubscribe();

      // Sync habits from Firebase
      habitsSyncFirebase();
      const unsubscribeHabits = habitsSubscribe();

      // Cleanup subscriptions on logout
      return () => {
        unsubscribeEpisodes();
        unsubscribeHabits();
      };
    } else {
      // User logged out: clear all data
      episodesClear();
      habitsClear();
    }
  }, [
    user,
    sessionInitialize,
    episodesSyncFirebase,
    episodesSubscribe,
    episodesClear,
    habitsSyncFirebase,
    habitsSubscribe,
    habitsClear,
  ]);

  // Show loading state while auth initializing
  if (authLoading) {
    return null;
  }

  // Show auth flow or app based on user state
  if (!user) {
    return <AuthNavigator />;
  }

  return <AppNavigator />;
}

// ============================================
// Root App Component
// ============================================
export default function App() {
  return (
    <ThemeProvider>
      <AppInitializer />
    </ThemeProvider>
  );
}