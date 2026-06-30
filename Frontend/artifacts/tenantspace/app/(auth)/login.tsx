import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../../constants/theme';
import { supabase } from '../../lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        Alert.alert('Login Failed', error.message);
      } else {
        router.replace('/');
      }
    } catch (err) {
      console.error('Login error:', err);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardView}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header decoration */}
        <View style={styles.statusBarSpacing} />

        {/* Hero Card */}
        <LinearGradient
          colors={[Theme.colors.g1, Theme.colors.g3]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          {/* Decorative Circles */}
          <View style={[styles.circle, styles.circle1]} />
          <View style={[styles.circle, styles.circle2]} />
          <View style={[styles.circle, styles.circle3]} />

          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>🏠</Text>
          </View>
          <Text style={styles.heroTitle}>TenantSpace</Text>
          <Text style={styles.heroSubtitle}>
            Welcome back — sign in to your account.
          </Text>
        </LinearGradient>

        {/* Form Card */}
        <View style={styles.formCard}>
          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused(null)}
              placeholder="you@example.com"
              placeholderTextColor={Theme.colors.mutedFg}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={[
                styles.input,
                focused === 'email' && styles.inputFocused,
              ]}
            />
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
                placeholder="••••••••"
                placeholderTextColor={Theme.colors.mutedFg}
                secureTextEntry={!showPw}
                autoCapitalize="none"
                autoCorrect={false}
                style={[
                  styles.input,
                  styles.passwordInput,
                  focused === 'password' && styles.inputFocused,
                ]}
              />
              <Pressable
                onPress={() => setShowPw((s) => !s)}
                style={styles.eyeButton}
              >
                <Text style={styles.eyeEmoji}>{showPw ? '🙈' : '👁'}</Text>
              </Pressable>
            </View>
          </View>

          {/* Forgot Password */}
          <Pressable
            onPress={() => Alert.alert('Forgot Password', 'Password recovery flow.')}
            style={styles.forgotPasswordPressable}
          >
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </Pressable>

          {/* CTA Button */}
          <Pressable
            onPress={handleSignIn}
            disabled={loading}
            style={({ pressed }) => [
              styles.ctaButton,
              pressed && styles.ctaButtonPressed,
              loading && styles.ctaButtonDisabled,
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.ctaButtonText}>Sign In</Text>
            )}
          </Pressable>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Auth */}
          <View style={styles.socialContainer}>
            <Pressable
              onPress={() => Alert.alert('Social Auth', 'Apple Login')}
              style={({ pressed }) => [
                styles.socialButton,
                pressed && styles.socialButtonPressed,
              ]}
            >
              <Text style={styles.socialIcon}>🍎</Text>
              <Text style={styles.socialText}>Apple</Text>
            </Pressable>

            <Pressable
              onPress={() => Alert.alert('Social Auth', 'Google Login')}
              style={({ pressed }) => [
                styles.socialButton,
                pressed && styles.socialButtonPressed,
              ]}
            >
              <Text style={[styles.socialIcon, { color: '#EA4335' }]}>G</Text>
              <Text style={styles.socialText}>Google</Text>
            </Pressable>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Link href="/(auth)/signup" asChild>
            <Pressable>
              <Text style={styles.footerLink}>Sign up</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: Theme.colors.bg,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  statusBarSpacing: {
    height: 10,
  },
  heroCard: {
    borderRadius: Theme.radius.xxl,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 16,
  },
  circle: {
    position: 'absolute',
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  circle1: {
    right: -30,
    top: -30,
    width: 140,
    height: 140,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  circle2: {
    left: -40,
    bottom: -40,
    width: 160,
    height: 160,
  },
  circle3: {
    right: 30,
    bottom: -20,
    width: 90,
    height: 90,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  logoEmoji: {
    fontSize: 36,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.8,
    marginBottom: 6,
    fontFamily: Theme.fonts.bold,
  },
  heroSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 18,
    fontFamily: Theme.fonts.regular,
  },
  formCard: {
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.radius.xl,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    paddingVertical: 20,
    paddingHorizontal: 18,
    gap: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.mutedFg,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontFamily: Theme.fonts.bold,
  },
  input: {
    width: '100%',
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: Theme.radius.md,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    fontSize: 14,
    color: Theme.colors.fg,
    backgroundColor: Theme.colors.bg,
    fontFamily: Theme.fonts.regular,
  },
  inputFocused: {
    borderColor: Theme.colors.primary,
    backgroundColor: Theme.colors.accent,
  },
  passwordWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: 44,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  eyeEmoji: {
    fontSize: 16,
    color: Theme.colors.mutedFg,
  },
  forgotPasswordPressable: {
    alignSelf: 'flex-end',
    marginTop: -6,
  },
  forgotPasswordText: {
    fontSize: 12,
    color: Theme.colors.primary,
    fontWeight: '600',
    fontFamily: Theme.fonts.semibold,
  },
  ctaButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: Theme.radius.md,
    backgroundColor: Theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  ctaButtonPressed: {
    opacity: 0.85,
  },
  ctaButtonDisabled: {
    backgroundColor: Theme.colors.mutedFg,
    opacity: 0.5,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: Theme.fonts.bold,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Theme.colors.border,
  },
  dividerText: {
    fontSize: 11,
    color: Theme.colors.mutedFg,
    fontWeight: '600',
    letterSpacing: 0.5,
    fontFamily: Theme.fonts.semibold,
  },
  socialContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  socialButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: Theme.radius.md,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  socialButtonPressed: {
    backgroundColor: Theme.colors.bg,
  },
  socialIcon: {
    fontSize: 17,
  },
  socialText: {
    fontSize: 13,
    fontWeight: '700',
    color: Theme.colors.fg,
    fontFamily: Theme.fonts.bold,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  footerText: {
    fontSize: 13,
    color: Theme.colors.mutedFg,
    fontFamily: Theme.fonts.regular,
  },
  footerLink: {
    fontSize: 13,
    color: Theme.colors.primary,
    fontWeight: '700',
    fontFamily: Theme.fonts.bold,
  },
});
