import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
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
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../../constants/theme';
import { supabase } from '../../lib/supabase';

export default function SignUpScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Password matching live check
  const passwordsEntered = password.length > 0 && confirmPassword.length > 0;
  const passwordsMatch = password === confirmPassword;

  const handleSignUp = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      // 1. Sign up the user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (error) {
        Alert.alert('Sign Up Failed', error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        // 2. Create the profile record in the public profiles table.
        // Even if you set up a SQL trigger in Supabase, doing an upsert here 
        // acts as a perfect development safety net.
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            full_name: fullName.trim(),
            email: email.trim(),
            role: 'tenant', // starts as tenant by default
          });

        if (profileError) {
          console.error('Error creating profile:', profileError.message);
        }

        // Successfully signed up, go to role selection (Step 2)
        router.replace('/(auth)/role-select');
      }
    } catch (err) {
      console.error('Sign up error:', err);
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
        {/* Top Navigation Row */}
        <View style={styles.topNavRow}>
          <Link href="/(auth)/login" asChild>
            <Pressable style={styles.backButton}>
              <Ionicons name="arrow-back-outline" size={24} color="#64748B" />
            </Pressable>
          </Link>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Create account</Text>
            <Text style={styles.headerStepText}>Step 1 of 2</Text>
          </View>
          <View style={styles.stepDots}>
            <View style={[styles.stepDot, styles.stepDotActive]} />
            <View style={styles.stepDot} />
          </View>
        </View>

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

          <View style={styles.sparkleContainer}>
            <Ionicons name="business-outline" size={28} color={Theme.colors.primary} />
          </View>
          <Text style={styles.heroTitleText}>Join TenantSpace</Text>
          <Text style={styles.heroSubtitle}>
            Manage shared rentals, chores, & payments easily.
          </Text>
        </LinearGradient>

        {/* Form Card */}
        <View style={styles.formCard}>
          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              onFocus={() => setFocused('fullName')}
              onBlur={() => setFocused(null)}
              placeholder="Sarah Mitchell"
              placeholderTextColor={Theme.colors.mutedFg}
              autoCapitalize="words"
              style={[
                styles.input,
                focused === 'fullName' && styles.inputFocused,
              ]}
            />
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
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
                placeholder="At least 6 characters"
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
                <Ionicons name={showPw ? 'eye-off' : 'eye'} size={22} color={Theme.colors.mutedFg} />
              </Pressable>
            </View>
          </View>

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <View style={styles.confirmLabelRow}>
              <Text style={styles.label}>Confirm Password</Text>
              {passwordsEntered && (
                <Text
                  style={[
                    styles.matchText,
                    passwordsMatch ? styles.matchSuccess : styles.matchError,
                  ]}
                >
                  {passwordsMatch ? '✓ Match' : '✗ Do not match'}
                </Text>
              )}
            </View>
            <View style={styles.passwordWrapper}>
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                onFocus={() => setFocused('confirmPassword')}
                onBlur={() => setFocused(null)}
                placeholder="••••••••"
                placeholderTextColor={Theme.colors.mutedFg}
                secureTextEntry={!showConfirmPw}
                autoCapitalize="none"
                autoCorrect={false}
                style={[
                  styles.input,
                  styles.passwordInput,
                  focused === 'confirmPassword' && styles.inputFocused,
                  passwordsEntered && !passwordsMatch && styles.inputError,
                ]}
              />
              <Pressable
                onPress={() => setShowConfirmPw((s) => !s)}
                style={styles.eyeButton}
              >
                <Ionicons name={showConfirmPw ? 'eye-off' : 'eye'} size={22} color={Theme.colors.mutedFg} />
              </Pressable>
            </View>
          </View>

          {/* Continue CTA */}
          <Pressable
            onPress={handleSignUp}
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
              <Text style={styles.ctaButtonText}>Continue →</Text>
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
              onPress={() => Alert.alert('Social Auth', 'Apple Sign Up')}
              style={({ pressed }) => [
                styles.socialButton,
                pressed && styles.socialButtonPressed,
              ]}
            >
              <Ionicons name="logo-apple" size={24} color="#000" />
              <Text style={styles.socialText}>Apple</Text>
            </Pressable>

            <Pressable
              onPress={() => Alert.alert('Social Auth', 'Google Sign Up')}
              style={({ pressed }) => [
                styles.socialButton,
                pressed && styles.socialButtonPressed,
              ]}
            >
              <Image
                source={require('../../assets/images/Google_Logo.png')}
                style={{ width: 18, height: 18, marginRight: 2 }}
              />
              <Text style={styles.socialText}>Google</Text>
            </Pressable>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <Pressable>
              <Text style={styles.footerLink}>Sign in</Text>
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
  topNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: Theme.radius.sm,
    backgroundColor: Theme.colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: Theme.colors.mutedFg,
    fontWeight: '700',
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.fg,
    fontFamily: Theme.fonts.bold,
  },
  headerStepText: {
    fontSize: 11,
    color: Theme.colors.mutedFg,
    fontFamily: Theme.fonts.regular,
    marginTop: 1,
  },
  stepDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Theme.colors.border,
  },
  stepDotActive: {
    width: 14,
    backgroundColor: Theme.colors.primary,
  },
  heroCard: {
    borderRadius: Theme.radius.xxl,
    paddingVertical: 24,
    paddingHorizontal: 20,
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
    right: -20,
    top: -20,
    width: 120,
    height: 120,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  circle2: {
    left: -30,
    bottom: -30,
    width: 130,
    height: 130,
  },
  sparkleContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  sparkleEmoji: {
    fontSize: 24,
  },
  heroTitleText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.6,
    marginBottom: 4,
    fontFamily: Theme.fonts.bold,
  },
  heroSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 16,
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
  confirmLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matchText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: Theme.fonts.bold,
  },
  matchSuccess: {
    color: Theme.colors.success,
  },
  matchError: {
    color: Theme.colors.danger,
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
  inputError: {
    borderColor: Theme.colors.danger,
    backgroundColor: Theme.colors.dangerLight,
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
