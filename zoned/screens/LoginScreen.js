import { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabase/config';

const YELLOW = '#F5C518';

const isValidZid = (v) => /^[zZ]\d{7}$/.test(v.trim());

export default function LoginScreen({ navigation }) {
  const [zid, setZid] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleSignIn = async () => {
    Keyboard.dismiss();
    setError('');

    if (!isValidZid(zid)) {
      setError('Enter a valid zID — e.g. z5312345');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    const normalizedZid = zid.trim().toLowerCase();
    const { error: err } = await supabase.auth.signInWithPassword({
      email: `${normalizedZid}@ad.unsw.edu.au`,
      password,
    });
    setLoading(false);

    if (err) {
      if (err.message.includes('Invalid login credentials')) {
        setError('Incorrect zID or password');
      } else if (err.message.includes('Email not confirmed')) {
        setError('Please confirm your UNSW email first');
      } else {
        setError('Sign in failed — check your connection');
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : Platform.OS === 'android' ? 'height' : undefined}
    >
      <StatusBar style="dark" />

      <Animated.View
        style={[
          styles.inner,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
          {/* Logo */}
          <View style={styles.logoSection}>
            <View style={styles.iconContainer}>
              <Ionicons name="location" size={36} color="#1a1a1a" />
            </View>
            <Text style={styles.appName}>zoned</Text>
            <Text style={styles.tagline}>your UNSW campus companion</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.label}>zID</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                placeholder="z5312345"
                placeholderTextColor="#ccc"
                value={zid}
                onChangeText={(t) => { setZid(t.trim().toLowerCase()); setError(''); }}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#ccc"
                value={password}
                onChangeText={(t) => { setPassword(t); setError(''); }}
                secureTextEntry={true}
              />
            </View>

            {!!error && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={15} color="#e03131" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

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

            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.createAccountRow}>
            <Text style={styles.createAccountText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.createAccountLink}>Register</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footnote}>
            Use any valid zID format + any password to log in
          </Text>
        </Animated.View>
      </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 44,
  },
  iconContainer: {
    width: 76,
    height: 76,
    borderRadius: 22,
    backgroundColor: YELLOW,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: YELLOW,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  appName: {
    fontSize: 34,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    color: '#999',
    letterSpacing: 0.1,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#555',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f6f6f6',
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 18,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: '#1a1a1a',
  },
  eyeBtn: {
    padding: 4,
    marginLeft: 8,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff5f5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#ffc9c9',
  },
  errorText: {
    color: '#e03131',
    fontSize: 13,
    flex: 1,
  },
  signInBtn: {
    backgroundColor: YELLOW,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: YELLOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  signInText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: 0.2,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  forgotText: {
    fontSize: 14,
    color: '#999',
  },
  createAccountRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  createAccountText: {
    fontSize: 14,
    color: '#999',
  },
  createAccountLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  footnote: {
    textAlign: 'center',
    fontSize: 12,
    color: '#bbb',
    marginTop: 16,
    lineHeight: 18,
  },
});
