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
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabase/config';

const YELLOW = '#F5C518';
const UNSW_DOMAIN = 'ad.unsw.edu.au';

const isValidZid = (v) => /^[zZ]\d{7}$/.test(v.trim());

export default function SignUpScreen({ navigation }) {
  const [zid, setZid] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 450, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleSignUp = async () => {
    Keyboard.dismiss();
    setError('');

    if (!isValidZid(zid)) {
      setError('Enter a valid zID — e.g. z5312345');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    const normalizedZid = zid.trim().toLowerCase();
    const { error: err } = await supabase.auth.signUp({
      email: `${normalizedZid}@${UNSW_DOMAIN}`,
      password,
    });
    setLoading(false);

    if (err) {
      if (err.message.includes('already registered')) {
        setError('This zID already has an account — sign in instead');
      } else {
        setError('Sign up failed — check your connection and try again');
      }
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <View style={styles.successContainer}>
        <StatusBar style="dark" />
        <View style={styles.successIcon}>
          <Ionicons name="mail" size={40} color="#1a1a1a" />
        </View>
        <Text style={styles.successTitle}>Check your UNSW Outlook</Text>
        <Text style={styles.successBody}>
          We sent a confirmation link to{'\n'}
          <Text style={styles.successEmail}>{zid.trim()}@{UNSW_DOMAIN}</Text>
        </Text>
        <Text style={styles.successHint}>
          Open your UNSW Outlook inbox, click the link, then come back to sign in.
        </Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.85}
        >
          <Text style={styles.backBtnText}>Back to Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : Platform.OS === 'android' ? 'height' : undefined}
    >
        <StatusBar style="dark" />

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={[
              styles.inner,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            {/* Back button */}
            <TouchableOpacity
              style={styles.backArrow}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={22} color="#1a1a1a" />
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>
                Sign up with your UNSW zID to get started
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <Text style={styles.label}>zID</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="person-outline" size={18} color="#aaa" style={styles.inputIcon} />
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
              {zid.length > 0 && (
                <Text style={styles.emailPreview}>
                  {isValidZid(zid)
                    ? `✓  ${zid.trim().toLowerCase()}@${UNSW_DOMAIN}`
                    : 'Must start with z followed by 7 digits'}
                </Text>
              )}

              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color="#aaa" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Min. 8 characters"
                  placeholderTextColor="#ccc"
                  value={password}
                  onChangeText={(t) => { setPassword(t); setError(''); }}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="#aaa" />
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color="#aaa" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Re-enter password"
                  placeholderTextColor="#ccc"
                  value={confirmPassword}
                  onChangeText={(t) => { setConfirmPassword(t); setError(''); }}
                  secureTextEntry={!showConfirm}
                />
                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>
                  <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={18} color="#aaa" />
                </TouchableOpacity>
              </View>

              {!!error && (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={15} color="#e03131" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.signUpBtn, loading && { opacity: 0.6 }]}
                onPress={handleSignUp}
                activeOpacity={0.85}
                disabled={loading}
              >
                {loading
                  ? <ActivityIndicator color="#1a1a1a" />
                  : <Text style={styles.signUpBtnText}>Create Account</Text>
                }
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.footerLink}>Sign In</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.footnote}>
              A confirmation link will be sent to your UNSW Outlook inbox.
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scroll: {
    flexGrow: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backArrow: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    lineHeight: 20,
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
    marginBottom: 6,
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
  emailPreview: {
    fontSize: 12,
    color: '#888',
    marginBottom: 18,
    marginLeft: 4,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff5f5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#ffc9c9',
  },
  errorText: {
    color: '#e03131',
    fontSize: 13,
    flex: 1,
  },
  signUpBtn: {
    backgroundColor: YELLOW,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: YELLOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  signUpBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: 0.2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#999',
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  footnote: {
    textAlign: 'center',
    fontSize: 12,
    color: '#bbb',
    marginTop: 20,
    lineHeight: 18,
  },

  // Success state
  successContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
  },
  successIcon: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: YELLOW,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    shadowColor: YELLOW,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: -0.3,
    marginBottom: 12,
    textAlign: 'center',
  },
  successBody: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 12,
  },
  successEmail: {
    fontWeight: '700',
    color: '#1a1a1a',
  },
  successHint: {
    fontSize: 13,
    color: '#aaa',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 36,
  },
  backBtn: {
    backgroundColor: YELLOW,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 40,
    shadowColor: YELLOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  backBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
});
