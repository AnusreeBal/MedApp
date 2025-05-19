import { useState } from 'react';
import { router } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { StyleSheet, TextInput, TouchableOpacity, Alert, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { auth } from '@/services/firebase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Welcome Back</ThemedText>
      <ThemedText style={styles.subtitle}>Sign in to continue</ThemedText>

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <Ionicons name="mail-outline" size={20} color="#64748B" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#64748B"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={20} color="#64748B" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#64748B"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <ThemedText style={styles.buttonText}>Sign In</ThemedText>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.forgotPassword}
        onPress={() => router.push('/(auth)/forgot-password')}
      >
        <ThemedText style={styles.forgotPasswordText}>Forgot Password?</ThemedText>
      </TouchableOpacity>

      <View style={styles.footer}>
        <ThemedText style={styles.footerText}>Don't have an account?</ThemedText>
        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
          <ThemedText style={styles.linkText}>Create Account</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 100,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#1F2937',
  },
  button: {
    backgroundColor: '#6366F1',
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonDisabled: {
    backgroundColor: '#A5B4FC',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  forgotPassword: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  forgotPasswordText: {
    color: '#6366F1',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 32,
  },
  footerText: {
    color: '#64748B',
    fontSize: 14,
  },
  linkText: {
    color: '#6366F1',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
});