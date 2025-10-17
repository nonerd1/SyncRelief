import React, { createContext, useContext, ReactNode } from 'react';
import {
  View,
  Text as RNText,
  StyleSheet,
  TextProps as RNTextProps,
  ViewProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radius, textStyles } from './tokens';

export const theme = {
  colors,
  spacing,
  radius,
  textStyles,
} as const;

export type Theme = typeof theme;
export type TextVariant = keyof typeof textStyles;

const ThemeContext = createContext<Theme>(theme);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): Theme => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

// Screen container with rsBg background and safe-area padding
interface ScreenProps extends ViewProps {
  children: ReactNode;
}

export const Screen: React.FC<ScreenProps> = ({ children, style, ...props }) => {
  return (
    <SafeAreaView style={[styles.screen, style]} edges={['left', 'right']} {...props}>
      {children}
    </SafeAreaView>
  );
};

// Text wrapper with variant support
interface TextComponentProps extends RNTextProps {
  variant?: TextVariant;
  color?: string;
  children: ReactNode;
}

export const Text: React.FC<TextComponentProps> = ({
  variant = 'Body',
  color,
  style,
  children,
  ...props
}) => {
  const textStyle = textStyles[variant];

  return (
    <RNText
      style={[
        {
          fontSize: textStyle.size,
          lineHeight: textStyle.lineHeight,
          fontWeight: textStyle.weight,
          color: color || colors.rsText,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.rsBg,
  },
});

export * from './tokens';
