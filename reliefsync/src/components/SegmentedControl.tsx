import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, Text } from '../theme';

interface SegmentedControlProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({ options, value, onChange }) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {options.map((option) => {
        const isActive = option === value;

        return (
          <TouchableOpacity
            key={option}
            style={[
              styles.item,
              {
                backgroundColor: isActive ? theme.colors.rsPrimary : 'transparent',
                borderColor: theme.colors.rsBorder,
                borderRadius: theme.radius.pill,
              },
            ]}
            onPress={() => onChange(option)}
            activeOpacity={0.7}
          >
            <Text
              variant="Caption"
              color={isActive ? theme.colors.rsBg : theme.colors.rsText}
              style={styles.itemText}
            >
              {option}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
  },
  item: {
    flex: 1,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  itemText: {
    fontWeight: '500',
  },
});
