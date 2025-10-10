import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme, Text } from '../theme';

interface StatPillProps {
  value: string;
  icon?: ReactNode;
}

export const StatPill: React.FC<StatPillProps> = ({ value, icon }) => {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.rsSurface,
          borderColor: theme.colors.rsBorder,
          borderRadius: theme.radius.pill,
        },
      ]}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text variant="Caption" color={theme.colors.rsTextDim}>
        {value}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 28,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderWidth: 1,
    gap: 6,
  },
  iconContainer: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
