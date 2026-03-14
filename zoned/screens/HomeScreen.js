import { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabase/config';

const YELLOW = '#F5C518';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const QUICK_ACTIONS = [
  { id: '1', label: 'Campus Map', icon: 'map', bg: '#FFF8DC', iconColor: '#1a1a1a' },
  { id: '2', label: 'Events', icon: 'calendar-outline', bg: '#EBF5FF', iconColor: '#4dabf7' },
  { id: '3', label: 'Library', icon: 'book-outline', bg: '#EDFFF3', iconColor: '#2f9e44' },
  { id: '4', label: 'Connect', icon: 'people-outline', bg: '#FFF0F6', iconColor: '#e64980' },
];

const ZONES = [
  {
    id: '1',
    name: 'Lower Campus',
    description: 'Scientia, Roundhouse & the Quad',
    color: '#F5C518',
    icon: 'business-outline',
  },
  {
    id: '2',
    name: 'Science Precinct',
    description: 'Physics, Chemistry, BioSci & more',
    color: '#4dabf7',
    icon: 'flask-outline',
  },
  {
    id: '3',
    name: 'Engineering',
    description: 'Ainsworth, Electrical & CSE',
    color: '#69db7c',
    icon: 'construct-outline',
  },
  {
    id: '4',
    name: 'Upper Campus',
    description: 'Library, Mathews & Law',
    color: '#f783ac',
    icon: 'library-outline',
  },
];

export default function HomeScreen({ navigation }) {
  const [zid, setZid] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const email = data?.user?.email ?? '';
      setZid(email.split('@')[0]);
    });
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.zidLabel}>{zid || '...'}</Text>
          </View>
          <View style={styles.notifBtn}>
            <Ionicons name="notifications-outline" size={22} color="#1a1a1a" />
          </View>
        </View>

        {/* Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerLeft}>
            <Text style={styles.bannerTitle}>Welcome to zoned</Text>
            <Text style={styles.bannerSub}>Your UNSW campus, all in one place</Text>
          </View>
          <View style={styles.bannerIcon}>
            <Ionicons name="location" size={32} color="#1a1a1a" />
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {QUICK_ACTIONS.map((a) => (
            <TouchableOpacity
              key={a.id}
              style={styles.actionCard}
              activeOpacity={0.75}
              onPress={() => a.label === 'Campus Map' && navigation.navigate('Map')}
            >
              <View style={[styles.actionIcon, { backgroundColor: a.bg }]}>
                <Ionicons name={a.icon} size={22} color={a.iconColor} />
              </View>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Campus Zones */}
        <Text style={styles.sectionTitle}>Campus Zones</Text>
        <View style={styles.zonesList}>
          {ZONES.map((zone) => (
            <TouchableOpacity
              key={zone.id}
              style={styles.zoneCard}
              activeOpacity={0.75}
              onPress={() => navigation.navigate('Map')}
            >
              <View style={[styles.zoneIconWrap, { backgroundColor: zone.color + '22' }]}>
                <Ionicons name={zone.icon} size={20} color={zone.color === '#F5C518' ? '#b8930a' : zone.color} />
              </View>
              <View style={styles.zoneText}>
                <Text style={styles.zoneName}>{zone.name}</Text>
                <Text style={styles.zoneDesc}>{zone.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  scroll: {
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
    marginBottom: 2,
  },
  zidLabel: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },
  notifBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  banner: {
    marginHorizontal: 20,
    backgroundColor: YELLOW,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
    shadowColor: YELLOW,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  bannerLeft: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  bannerSub: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },
  bannerIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    gap: 10,
    marginBottom: 28,
  },
  actionCard: {
    width: '46%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: '2%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  zonesList: {
    paddingHorizontal: 20,
    gap: 10,
  },
  zoneCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  zoneIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  zoneText: {
    flex: 1,
  },
  zoneName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  zoneDesc: {
    fontSize: 12,
    color: '#999',
  },
});
