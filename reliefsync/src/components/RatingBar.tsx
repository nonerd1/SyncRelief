import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme';

interface RatingBarProps {
  value: number;
  onChange: (value: number) => void;
}

export const RatingBar: React.FC<RatingBarProps> = ({ value, onChange }) => {
  const theme = useTheme();
  const dots = Array.from({ length: 10 }, (_, i) => i + 1);

  const handlePress = (num: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(num);
  };

  return (
    <View style={styles.container}>
      {dots.map((num) => {
        const isSelected = num <= value;

        return (
          <TouchableOpacity
            key={num}
            style={styles.dotContainer}
            onPress={() => handlePress(num)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.dot,
                {
                  backgroundColor: isSelected ? theme.colors.rsPrimary600 : 'transparent',
                  borderColor: theme.colors.rsBorder,
                },
              ]}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dotContainer: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
  },
});
