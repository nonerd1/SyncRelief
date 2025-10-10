import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme, Text } from '../theme';

interface CTAButtonProps {
  variant: 'primary' | 'secondary' | 'ghost';
  title: string;
  onPress: () => void;
  fullWidth?: boolean;
  disabled?: boolean;
  style?: any;
}

export const CTAButton: React.FC<CTAButtonProps> = ({
  variant,
  title,
  onPress,
  fullWidth = false,
  disabled = false,
  style,
}) => {
  const theme = useTheme();

  const isPrimary = variant === 'primary';
  const isGhost = variant === 'ghost';

  const handlePress = () => {
    if (!disabled) {
      Haptics.impactAsync(
        isPrimary ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light,
      );
      onPress();
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: isPrimary ? theme.colors.rsPrimary600 : 'transparent',
          borderWidth: isPrimary || isGhost ? 0 : 1,
          borderColor: theme.colors.rsBorder,
          borderRadius: 12,
          opacity: disabled ? 0.5 : 1,
        },
        fullWidth && styles.fullWidth,
        style,
      ]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text
        variant="Title"
        color={
          isPrimary ? theme.colors.rsBg : isGhost ? theme.colors.rsTextDim : theme.colors.rsText
        }
        style={styles.text}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    textAlign: 'center',
  },
});
