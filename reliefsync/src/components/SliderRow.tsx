import React from 'react';
import { View, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { useTheme, Text } from '../theme';

interface SliderRowProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  sublabel?: string;
}

export const SliderRow: React.FC<SliderRowProps> = ({ label, value, onChange, sublabel }) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
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
        <View
          style={[
            styles.chip,
            {
              backgroundColor: theme.colors.rsPrimary600,
              borderRadius: theme.radius.sm,
            },
          ]}
        >
          <Text variant="Caption" color={theme.colors.rsBg} style={styles.chipText}>
            {value}
          </Text>
        </View>
      </View>
      <Slider
        style={styles.slider}
        value={value}
        onValueChange={onChange}
        minimumValue={0}
        maximumValue={10}
        step={1}
        minimumTrackTintColor={theme.colors.rsPrimary}
        maximumTrackTintColor={theme.colors.rsBorder}
        thumbTintColor={theme.colors.rsPrimary600}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  textContainer: {
    flex: 1,
  },
  sublabel: {
    marginTop: 2,
  },
  chip: {
    minWidth: 32,
    height: 24,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontWeight: '600',
  },
  slider: {
    width: '100%',
    height: 40,
  },
});
