import React, { useState } from 'react';
import { View, TextInput, Alert } from 'react-native';
import { useAuthStore } from '../store/auth';
import { useTheme, Text, Screen } from '../theme';
import { CTAButton } from '../components/CTAButton';
import { createUserDocument } from '../firebase/firestore';

export function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
      navigation.replace('Home');
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

    setIsLoading(true);
    try {
      await signup(email, password);
      // Create user document in Firestore
      // Assuming you can get the current user's UID after signup
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
      <View style={{ padding: 20, gap: 16 }}>
        <Text variant="H1">ReliefSync</Text>

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={{
            backgroundColor: theme.colors.rsSurface,
            color: theme.colors.rsText,
            padding: 12,
            borderRadius: 8,
            marginBottom: 12,
          }}
        />

        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={{
            backgroundColor: theme.colors.rsSurface,
            color: theme.colors.rsText,
            padding: 12,
            borderRadius: 8,
            marginBottom: 12,
          }}
        />

        <CTAButton
          title={isLoading ? 'Loading...' : 'Login'}
          onPress={handleLogin}
          variant="primary"
          fullWidth
          disabled={isLoading}
        />

        <CTAButton
          title={isLoading ? 'Loading...' : 'Sign Up'}
          onPress={handleSignup}
          variant="secondary"
          fullWidth
          disabled={isLoading}
        />
      </View>
    </Screen>
  );
}