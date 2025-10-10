import React from 'react';
import { View, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme, Text } from '../theme';

interface ToggleRowProps {
  label: string;
  sublabel?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export const ToggleRow: React.FC<ToggleRowProps> = ({ label, sublabel, value, onValueChange }) => {
  const theme = useTheme();

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onValueChange(!value);
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          borderBottomColor: theme.colors.rsBorder,
        },
      ]}
      onPress={handleToggle}
      activeOpacity={0.7}
    >
      <View style={styles.textContainer}>
        <Text variant="Body" color={theme.colors.rsText}>
          {label}
        </Text>
        {sublabel && (
          <Text variant="Caption" color={theme.colors.rsTextDim} style={styles.sublabel}>
            {sublabel}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={(val) => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onValueChange(val);
        }}
        trackColor={{
          false: theme.colors.rsBorder,
          true: theme.colors.rsPrimary,
        }}
        thumbColor={value ? theme.colors.rsPrimary600 : theme.colors.rsTextDim}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
  },
  sublabel: {
    marginTop: 2,
  },
});
