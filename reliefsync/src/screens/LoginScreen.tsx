import React, { useState } from 'react';
import { View, TextInput, Alert, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '../store/auth';
import { useTheme, Text, Screen } from '../theme';
import { CTAButton } from '../components/CTAButton';
import { createUserDocument } from '../firebase/firestore';

export function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const theme = useTheme();
  const { login, signup } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      await signup(email, password);
      const currentUser = useAuthStore.getState().user;
      if (currentUser && currentUser.uid) {
        await createUserDocument(currentUser.uid, email);
      }
    } catch (error: any) {
      Alert.alert('Signup Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <View style={[styles.logoContainer, { backgroundColor: theme.colors.rsPrimary + '20' }]}>
              <Feather name="activity" size={48} color={theme.colors.rsPrimary} />
            </View>
            <Text variant="H1" style={styles.title}>ReliefSync</Text>
            <Text variant="Body" color={theme.colors.rsTextDim} style={styles.subtitle}>
              Track, Analyze & Manage Your Headaches
            </Text>
          </View>

          {/* Form Section */}
          <View style={[styles.formCard, { backgroundColor: theme.colors.rsSurface, borderRadius: theme.radius.lg }]}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text variant="Caption" color={theme.colors.rsTextDim} style={styles.inputLabel}>
                Email Address
              </Text>
              <View style={[styles.inputWrapper, { backgroundColor: theme.colors.rsBg, borderRadius: theme.radius.md, borderColor: theme.colors.rsBorder }]}>
                <Feather name="mail" size={20} color={theme.colors.rsTextDim} />
                <TextInput
                  placeholder="your@email.com"
                  placeholderTextColor={theme.colors.rsTextDim}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={[styles.input, { color: theme.colors.rsText }]}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text variant="Caption" color={theme.colors.rsTextDim} style={styles.inputLabel}>
                Password
              </Text>
              <View style={[styles.inputWrapper, { backgroundColor: theme.colors.rsBg, borderRadius: theme.radius.md, borderColor: theme.colors.rsBorder }]}>
                <Feather name="lock" size={20} color={theme.colors.rsTextDim} />
                <TextInput
                  placeholder="Enter your password"
                  placeholderTextColor={theme.colors.rsTextDim}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  style={[styles.input, { color: theme.colors.rsText }]}
                />
                <Feather
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={theme.colors.rsTextDim}
                  onPress={() => setShowPassword(!showPassword)}
                />
              </View>
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <CTAButton
                title={isLoading ? 'Logging in...' : 'Login'}
                onPress={handleLogin}
                variant="primary"
                fullWidth
                disabled={isLoading}
              />

              {/* <View style={styles.divider}>
                <View style={[styles.dividerLine, { backgroundColor: theme.colors.rsBorder }]} />
                <Text variant="Caption" color={theme.colors.rsTextDim} style={styles.dividerText}>
                  OR
                </Text>
                <View style={[styles.dividerLine, { backgroundColor: theme.colors.rsBorder }]} />
              </View> */}

              {/* <CTAButton
                title={isLoading ? 'Creating account...' : 'Create Account'}
                onPress={handleSignup}
                variant="secondary"
                fullWidth
                disabled={isLoading}
              /> */}
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text variant="Caption" color={theme.colors.rsTextDim} style={styles.footerText}>
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  formCard: {
    padding: 24,
    gap: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  buttonContainer: {
    gap: 16,
    marginTop: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 8,
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    textAlign: 'center',
    paddingHorizontal: 48,
    lineHeight: 18,
  },
});