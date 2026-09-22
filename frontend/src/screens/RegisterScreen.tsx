import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
  TextInput,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AxiosError } from 'axios';

import { RootStackParamList, ApiError } from '../types';
import { COLORS, FONT_SIZE, SPACING } from '../utils/constants';
import { registerUser } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import FormInput from '../components/FormInput';
import PrimaryButton from '../components/PrimaryButton';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const setAuth = useAuthStore((s) => s.setAuth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  // Refs for focus management
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  // ── Client-side validation ──────────────────────────────────────────────────
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!name.trim()) newErrors.name = 'Name is required';
    else if (name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';

    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(email)) newErrors.email = 'Enter a valid email';

    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 8) newErrors.password = 'Minimum 8 characters';
    else if (!/[A-Z]/.test(password)) newErrors.password = 'Must include an uppercase letter';
    else if (!/[0-9]/.test(password)) newErrors.password = 'Must include a number';

    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleRegister = async (): Promise<void> => {
    if (!validate()) return;

    setLoading(true);
    try {
      const result = await registerUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      await setAuth(result.token, result.user);
      // Navigation handled automatically by auth-gated navigator
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>;
      const serverDetails = axiosErr.response?.data;
      const message =
        serverDetails && !serverDetails.success && serverDetails.details?.length
          ? serverDetails.details.join('\n')
          : (axiosErr.response?.data as ApiError | undefined)?.error ??
            'Registration failed. Please try again.';
      Alert.alert('Registration Failed', message);
    } finally {
      setLoading(false);
    }
  };

  const clearError = (field: keyof FormErrors) =>
    setErrors((e) => ({ ...e, [field]: undefined }));

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo} accessibilityRole="header">
            Feedants
          </Text>
          <Text style={styles.tagline}>Create an account 🚀</Text>
          <Text style={styles.subtitle}>Join competitions today</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <FormInput
            label="Full Name"
            value={name}
            onChangeText={(v) => { setName(v); clearError('name'); }}
            error={errors.name}
            autoCapitalize="words"
            autoComplete="name"
            placeholder="Kush Gupta"
            returnKeyType="next"
            onSubmitEditing={() => emailRef.current?.focus()}
            accessibilityLabel="Full name"
          />

          <FormInput
            label="Email"
            value={email}
            onChangeText={(v) => { setEmail(v); clearError('email'); }}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            placeholder="you@example.com"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            ref={emailRef}
            accessibilityLabel="Email address"
          />

          <FormInput
            label="Password"
            value={password}
            onChangeText={(v) => { setPassword(v); clearError('password'); }}
            error={errors.password}
            isPassword
            placeholder="Min 8 chars, 1 uppercase, 1 number"
            returnKeyType="next"
            onSubmitEditing={() => confirmRef.current?.focus()}
            ref={passwordRef}
            accessibilityLabel="Password"
          />

          <FormInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={(v) => { setConfirmPassword(v); clearError('confirmPassword'); }}
            error={errors.confirmPassword}
            isPassword
            placeholder="Repeat your password"
            returnKeyType="done"
            onSubmitEditing={handleRegister}
            ref={confirmRef}
            accessibilityLabel="Confirm password"
          />

          <PrimaryButton
            label="Create Account"
            onPress={handleRegister}
            loading={loading}
            style={styles.btn}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            accessibilityRole="link"
            accessibilityLabel="Go to Login"
          >
            <Text style={styles.footerLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING['2xl'],
  },
  header: {
    marginBottom: SPACING['2xl'],
    alignItems: 'center',
  },
  logo: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: SPACING.md,
  },
  tagline: {
    fontSize: FONT_SIZE.h2,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZE.body,
    color: COLORS.textSecondary,
  },
  form: {
    marginBottom: SPACING.lg,
  },
  btn: {
    marginTop: SPACING.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  footerText: {
    fontSize: FONT_SIZE.body,
    color: COLORS.textSecondary,
  },
  footerLink: {
    fontSize: FONT_SIZE.body,
    fontWeight: '700',
    color: COLORS.primary,
  },
});

export default RegisterScreen;
