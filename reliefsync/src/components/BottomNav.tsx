import React, { ComponentType } from 'react';
import { Text as RNText } from 'react-native';
import { useTheme } from '../theme';

interface TabIconProps {
  focused: boolean;
  color: string;
  size: number;
}

interface CreateTabIconOptions {
  ActiveIcon: ComponentType<{ color: string; size: number }>;
  InactiveIcon?: ComponentType<{ color: string; size: number }>;
}

export const createTabIcon = ({ ActiveIcon, InactiveIcon }: CreateTabIconOptions) => {
  return ({ focused, size }: { focused: boolean; size: number }) => {
    const theme = useTheme();
    const color = focused ? theme.colors.rsPrimary600 : theme.colors.rsTextDim;
    const Icon = focused && ActiveIcon ? ActiveIcon : InactiveIcon || ActiveIcon;

    return <Icon color={color} size={size} />;
  };
};

// Helper component for text-based tab icons (emoji or unicode)
interface TextTabIconProps {
  icon: string;
  focused: boolean;
}

export const TextTabIcon: React.FC<TextTabIconProps> = ({ icon, focused }) => {
  const theme = useTheme();

  return (
    <RNText
      style={{
        fontSize: 24,
        opacity: focused ? 1 : 0.6,
        color: focused ? theme.colors.rsPrimary600 : theme.colors.rsTextDim,
      }}
    >
      {icon}
    </RNText>
  );
};

// Export tab bar options for use in navigation
export const getTabBarOptions = (theme: ReturnType<typeof useTheme>) => ({
  tabBarActiveTintColor: theme.colors.rsPrimary600,
  tabBarInactiveTintColor: theme.colors.rsTextDim,
  tabBarStyle: {
    backgroundColor: theme.colors.rsSurface,
    borderTopColor: theme.colors.rsBorder,
    borderTopWidth: 1,
  },
});
