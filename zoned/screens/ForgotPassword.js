import { useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator,
  Keyboard, TouchableWithoutFeedback, ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '../supabase/config';

const YELLOW = '#F5C518';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async () => {
    Keyboard.dismiss();
    setError('');
    if (!email.trim()) { setError('Please enter your student email'); return; }
    setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim());
    setLoading(false);
    if (err) setError('Failed to send reset link — check your email');
    else setSent(true);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <StatusBar style="dark" />
        <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
          <View style={styles.logoSection}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconEmoji}>📍</Text>
            </View>
            <Text style={styles.appName}>zoned</Text>
            <Text style={styles.tagline}>your UNSW campus companion</Text>
          </View>

          <TouchableOpacity style={styles.backLink} onPress={() => navigation.goBack()}>
            <Text style={styles.backLinkText}>← Back to login</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>Enter the student email you registered with and we'll send you a reset link.</Text>

          {sent ? (
            <View style={styles.sentBox}>
              <Text style={styles.sentText}>✓ Reset link sent! Check your UNSW Outlook inbox.</Text>
            </View>
          ) : (
            <View style={styles.form}>
              <Text style={styles.label}>Student Email</Text>
              <TextInput
                style={styles.input}
                placeholder="z5312345@ad.unsw.edu.au"
                placeholderTextColor="#aaa"
                value={email}
                onChangeText={(t) => { setEmail(t); setError(''); }}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              {!!error && <Text style={styles.errorText}>{error}</Text>}
              <TouchableOpacity
                style={[styles.sendBtn, loading && { opacity: 0.6 }]}
                onPress={handleReset}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading
                  ? <ActivityIndicator color="#1a1a1a" />
                  : <Text style={styles.sendBtnText}>Send Reset Link</Text>
                }
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { flexGrow: 1, paddingHorizontal: 32, paddingVertical: 40 },
  logoSection: { alignItems: 'center', marginBottom: 36 },
  iconContainer: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: YELLOW,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
  },
  iconEmoji: { fontSize: 32 },
  appName: { fontSize: 34, fontWeight: '900', color: '#111', letterSpacing: -1, marginBottom: 4 },
  tagline: { fontSize: 14, color: '#888' },
  backLink: { marginBottom: 20 },
  backLinkText: { fontSize: 15, color: '#777' },
  title: { fontSize: 26, fontWeight: '800', color: '#111', marginBottom: 10, letterSpacing: -0.5 },
  subtitle: { fontSize: 16, color: '#777', lineHeight: 22, marginBottom: 28 },
  form: {},
  label: { fontSize: 15, fontWeight: '600', color: '#111', marginBottom: 8 },
  input: {
    backgroundColor: '#f0f0f0',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 17,
    fontSize: 16,
    color: '#111',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  errorText: { color: '#e03131', fontSize: 13, marginBottom: 12 },
  sendBtn: {
    backgroundColor: YELLOW,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  sendBtnText: { fontSize: 17, fontWeight: '700', color: '#111' },
  sentBox: {
    backgroundColor: '#f0fff4',
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: '#b2f2bb',
  },
  sentText: { fontSize: 15, color: '#2f9e44', fontWeight: '600', lineHeight: 22 },
});