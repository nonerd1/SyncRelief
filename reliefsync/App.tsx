import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemeProvider, useTheme } from './src/theme';
import { useSessionStore } from './src/store/session';
import { useHabitsStore } from './src/store/habits';
import { useEpisodesStore } from './src/store/episodes';

// Screens
import { HomeScreen } from './src/screens/HomeScreen';
import { TherapySessionScreen } from './src/screens/TherapySessionScreen';
import { LogHabitsScreen } from './src/screens/LogHabitsScreen';
import { LogHeadacheScreen } from './src/screens/LogHeadacheScreen';
import { InsightsScreen } from './src/screens/InsightsScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();

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
              tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} />,
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

function AppInitializer() {
  const sessionInitialize = useSessionStore((state) => state.initialize);
  const habitsInitialize = useHabitsStore((state) => state.initialize);
  const episodesInitialize = useEpisodesStore((state) => state.initialize);

  useEffect(() => {
    const init = async () => {
      await Promise.all([sessionInitialize(), habitsInitialize(), episodesInitialize()]);
    };

    init();
  }, []);

  return <AppNavigator />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInitializer />
    </ThemeProvider>
  );
}
