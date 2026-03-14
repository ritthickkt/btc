import { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  ScrollView, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabase/config';

const YELLOW = '#F5C518';

export default function ProfileScreen() {
  const [email, setEmail] = useState('');
  const [degree, setDegree] = useState('');
  const [year, setYear] = useState('');
  const [bio, setBio] = useState('');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data?.user?.email ?? '');
    });
  }, []);

  const zid = email.split('@')[0];
  const initials = zid ? zid.slice(0, 2).toUpperCase() : '??';

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => supabase.auth.signOut() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.initials}>{initials}</Text>
            </View>
            <TouchableOpacity style={styles.cameraBtn}>
              <Ionicons name="camera" size={14} color="#555" />
            </TouchableOpacity>
          </View>
          <Text style={styles.zidText}>{zid || '...'}</Text>
          <Text style={styles.roleText}>UNSW Student</Text>
        </View>

        {/* Profile fields */}
        <View style={styles.fieldGroup}>
          <View style={styles.fieldRow}>
            <Ionicons name="school-outline" size={18} color="#888" />
            <Text style={styles.fieldLabel}>Degree</Text>
          </View>
          <View style={styles.fieldInput}>
            <Text style={styles.fieldValue}>{degree || 'Not set'}</Text>
          </View>

          <View style={styles.fieldRow}>
            <Ionicons name="calendar-outline" size={18} color="#888" />
            <Text style={styles.fieldLabel}>Year</Text>
          </View>
          <View style={styles.fieldInput}>
            <Text style={styles.fieldValue}>{year || 'Not set'}</Text>
          </View>

          <View style={styles.fieldRow}>
            <Ionicons name="person-outline" size={18} color="#888" />
            <Text style={styles.fieldLabel}>Bio</Text>
          </View>
          <View style={styles.fieldInput}>
            <Text style={styles.fieldValue}>{bio || 'Not set'}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(!editing)} activeOpacity={0.8}>
          <Ionicons name="pencil-outline" size={16} color="#111" />
          <Text style={styles.editBtnText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={18} color="#e03131" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  scroll: { paddingBottom: 40 },
  avatarSection: { alignItems: 'center', paddingTop: 32, paddingBottom: 28 },
  avatarWrap: { position: 'relative', marginBottom: 14 },
  avatar: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: YELLOW,
    alignItems: 'center', justifyContent: 'center',
  },
  cameraBtn: {
    position: 'absolute', bottom: 0, right: 0,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fafafa',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  initials: { fontSize: 30, fontWeight: '800', color: '#111' },
  zidText: { fontSize: 22, fontWeight: '800', color: '#111', marginBottom: 4, letterSpacing: -0.3 },
  roleText: { fontSize: 14, color: '#888' },
  fieldGroup: { paddingHorizontal: 20, marginBottom: 20 },
  fieldRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6, marginTop: 4 },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: '#555' },
  fieldInput: {
    backgroundColor: '#f2f2f2', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    marginBottom: 8,
    borderWidth: 1, borderColor: '#eaeaea',
  },
  fieldValue: { fontSize: 15, color: '#888' },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, marginHorizontal: 20, marginBottom: 12,
    backgroundColor: '#fff',
    borderWidth: 1.5, borderColor: '#e0e0e0',
    borderRadius: 14, paddingVertical: 15,
  },
  editBtnText: { fontSize: 15, fontWeight: '600', color: '#111' },
  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 14, paddingVertical: 15,
  },
  signOutText: { fontSize: 15, fontWeight: '600', color: '#e03131' },
});