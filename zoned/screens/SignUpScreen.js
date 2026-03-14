import { useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator,
  Keyboard, TouchableWithoutFeedback, ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '../supabase/config';

const YELLOW = '#F5C518';
const UNSW_DOMAIN = 'ad.unsw.edu.au';
const isValidZid = (v) => /^z\d{7}$/.test(v.trim());

export default function SignUpScreen({ navigation }) {
  const [zid, setZid] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSignUp = async () => {
    Keyboard.dismiss();
    setError('');
    if (!isValidZid(zid)) { setError('Enter a valid zID — e.g. z5312345'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    const { error: err } = await supabase.auth.signUp({
      email: `${zid.trim()}@${UNSW_DOMAIN}`,
      password,
    });
    setLoading(false);
    if (err) {
      if (err.message.includes('already registered')) setError('This zID already has an account — sign in instead');
      else setError('Sign up failed — check your connection');
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <View style={styles.successContainer}>
        <StatusBar style="dark" />
        <View style={styles.successIcon}>
          <Text style={{ fontSize: 40 }}>📬</Text>
        </View>
        <Text style={styles.successTitle}>Check your UNSW Outlook</Text>
        <Text style={styles.successBody}>
          We sent a confirmation link to{'\n'}
          <Text style={styles.successEmail}>{zid.trim()}@{UNSW_DOMAIN}</Text>
        </Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Login')} activeOpacity={0.85}>
          <Text style={styles.backBtnText}>Back to Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <StatusBar style="dark" />
        <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Logo */}
          <View style={styles.logoSection}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconEmoji}>📍</Text>
            </View>
            <Text style={styles.appName}>zoned</Text>
            <Text style={styles.tagline}>your UNSW campus companion</Text>
          </View>

          {/* Back link */}
          <TouchableOpacity style={styles.backLink} onPress={() => navigation.goBack()}>
            <Text style={styles.backLinkText}>← Back to login</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Create Account</Text>

          <View style={styles.form}>
            <Text style={styles.label}>Student Email</Text>
            <TextInput
              style={styles.input}
              placeholder="z5312345@ad.unsw.edu.au"
              placeholderTextColor="#aaa"
              value={zid}
              onChangeText={(t) => {
                const cleaned = t.replace(/@.*/, '');
                setZid(cleaned);
                setError('');
              }}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#aaa"
              value={password}
              onChangeText={(t) => { setPassword(t); setError(''); }}
              secureTextEntry
            />

            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#aaa"
              value={confirmPassword}
              onChangeText={(t) => { setConfirmPassword(t); setError(''); }}
              secureTextEntry
            />

            {!!error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity
              style={[styles.registerBtn, loading && { opacity: 0.6 }]}
              onPress={handleSignUp}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#1a1a1a" />
                : <Text style={styles.registerBtnText}>Register</Text>
              }
            </TouchableOpacity>
          </View>
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
  title: { fontSize: 26, fontWeight: '800', color: '#111', marginBottom: 24, letterSpacing: -0.5 },
  form: { width: '100%' },
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
  registerBtn: {
    backgroundColor: YELLOW,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 4,
  },
  registerBtnText: { fontSize: 17, fontWeight: '700', color: '#111' },
  successContainer: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36 },
  successIcon: {
    width: 88, height: 88, borderRadius: 24,
    backgroundColor: YELLOW,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 28,
  },
  successTitle: { fontSize: 24, fontWeight: '800', color: '#111', marginBottom: 12, textAlign: 'center' },
  successBody: { fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 36 },
  successEmail: { fontWeight: '700', color: '#111' },
  backBtn: { backgroundColor: YELLOW, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 40 },
  backBtnText: { fontSize: 16, fontWeight: '700', color: '#111' },
});