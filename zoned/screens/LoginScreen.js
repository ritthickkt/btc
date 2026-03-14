import { useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator,
  Keyboard, TouchableWithoutFeedback, ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '../supabase/config';

const YELLOW = '#F5C518';
const isValidZid = (v) => /^z\d{7}$/.test(v.trim());

export default function LoginScreen({ navigation }) {
  const [zid, setZid] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    Keyboard.dismiss();
    setError('');
    if (!isValidZid(zid)) { setError('Enter a valid zID — e.g. z5312345'); return; }
    if (!password) { setError('Please enter your password'); return; }
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({
      email: `${zid.trim()}@ad.unsw.edu.au`,
      password,
    });
    setLoading(false);
    if (err) {
      if (err.message.includes('Invalid login credentials')) setError('Incorrect zID or password');
      else if (err.message.includes('Email not confirmed')) setError('Please confirm your UNSW email first');
      else setError('Sign in failed — check your connection');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <StatusBar style="dark" />
        <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.logoSection}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconEmoji}>📍</Text>
            </View>
            <Text style={styles.appName}>zoned</Text>
            <Text style={styles.tagline}>your UNSW campus companion</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>zID</Text>
            <TextInput
              style={styles.input}
              placeholder="z5312345"
              placeholderTextColor="#aaa"
              value={zid}
              onChangeText={(t) => { setZid(t); setError(''); }}
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

            {!!error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity
              style={[styles.signInBtn, loading && { opacity: 0.6 }]}
              onPress={handleSignIn}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#1a1a1a" />
                : <Text style={styles.signInText}>Sign In</Text>
              }
            </TouchableOpacity>
          </View>

          <View style={styles.linksRow}>
            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.link}>Forgot password?</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.link}>Register</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footnote}>Use any valid zID format + any password to log in</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 32, paddingVertical: 40 },
  logoSection: { alignItems: 'center', marginBottom: 48 },
  iconContainer: {
    width: 80, height: 80, borderRadius: 22,
    backgroundColor: YELLOW,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 18,
  },
  iconEmoji: { fontSize: 36 },
  appName: { fontSize: 38, fontWeight: '900', color: '#111', letterSpacing: -1, marginBottom: 6 },
  tagline: { fontSize: 15, color: '#888' },
  form: { width: '100%', marginBottom: 20 },
  label: { fontSize: 15, fontWeight: '600', color: '#111', marginBottom: 8, marginTop: 4 },
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
  signInBtn: {
    backgroundColor: YELLOW,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 4,
  },
  signInText: { fontSize: 17, fontWeight: '700', color: '#111' },
  linksRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4, marginBottom: 28 },
  link: { fontSize: 15, fontWeight: '600', color: YELLOW },
  footnote: { textAlign: 'center', fontSize: 13, color: '#aaa' },
});