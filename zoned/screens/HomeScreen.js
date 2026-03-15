import { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Animated,
  Pressable,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useIsDesktop } from '../hooks/useIsDesktop';
import { supabase } from '../supabase/config';

const YELLOW = '#F5C518';
const DARK = '#111111';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getGreetingEmoji() {
  const h = new Date().getHours();
  if (h < 12) return '☀️';
  if (h < 17) return '👋';
  return '🌙';
}

// ─── Animated card with entrance + press spring ────────────────────────────
function AnimatedCard({ style, children, onPress, delay = 0 }) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 480,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        delay,
        useNativeDriver: true,
        tension: 70,
        friction: 11,
      }),
    ]).start();
  }, []);

  const onPressIn = () =>
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 60,
      bounciness: 0,
    }).start();

  const onPressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 22,
      bounciness: 10,
    }).start();

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }, { scale }] }}>
      <Pressable
        style={style}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

// ─── Simple fade+slide wrapper (no press) ──────────────────────────────────
function FadeSlide({ children, delay = 0, style }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        delay,
        useNativeDriver: true,
        tension: 70,
        friction: 11,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}

const QUICK_ACTIONS = [
  { id: '1', label: 'Campus Map', icon: 'map', color: '#b8930a', bg: '#FFF8DC', nav: 'Map', desc: 'Explore UNSW' },
  { id: '2', label: 'Snaps', icon: 'camera', color: '#4dabf7', bg: '#EBF5FF', nav: 'Snaps', desc: 'Share moments' },
  { id: '3', label: 'Evade', icon: 'shield-checkmark', color: '#2f9e44', bg: '#EDFFF3', nav: 'Evade', desc: 'Stay safe' },
  { id: '4', label: 'Study', icon: 'school', color: '#e64980', bg: '#FFF0F6', nav: 'Study', desc: 'Find a spot' },
];

const ZONES = [
  { id: '1', name: 'Lower Campus', desc: 'Scientia & the Quad', color: '#F5C518', icon: 'business-outline' },
  { id: '2', name: 'Science', desc: 'Physics, Chem & BioSci', color: '#4dabf7', icon: 'flask-outline' },
  { id: '3', name: 'Engineering', desc: 'Ainsworth, CSE & EE', color: '#69db7c', icon: 'construct-outline' },
  { id: '4', name: 'Upper Campus', desc: 'Library, Mathews & Law', color: '#f783ac', icon: 'library-outline' },
];

export default function HomeScreen({ navigation }) {
  const [zid, setZid] = useState('');
  const [snapCount, setSnapCount] = useState(null);
  const isDesktop = useIsDesktop();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const email = data?.user?.email ?? '';
      setZid(email.split('@')[0]);
    });

    supabase
      .from('snaps')
      .select('id', { count: 'exact', head: true })
      .then(({ count }) => setSnapCount(count ?? 0));
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={isDesktop ? styles.inner : null}>

          {/* ── Dark header ────────────────────────────────────────────── */}
          <FadeSlide delay={0}>
            <View style={styles.header}>
              {/* Decorative circles */}
              <View style={styles.headerCircle1} />
              <View style={styles.headerCircle2} />

              <View style={styles.headerTop}>
                <View>
                  <Text style={styles.greeting}>
                    {getGreeting()} {getGreetingEmoji()}
                  </Text>
                  <Text style={styles.zidLabel}>{zid || '...'}</Text>
                </View>
                <View style={styles.notifBtn}>
                  <Ionicons name="notifications-outline" size={20} color={DARK} />
                </View>
              </View>

              {/* Stats row inside header */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>4</Text>
                  <Text style={styles.statLabel}>Zones</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {snapCount !== null ? snapCount : '—'}
                  </Text>
                  <Text style={styles.statLabel}>Snaps</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>UNSW</Text>
                  <Text style={styles.statLabel}>Kensington</Text>
                </View>
              </View>
            </View>
          </FadeSlide>

          {/* ── Quick Actions ────────────────────────────────────────────── */}
          <FadeSlide delay={120}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </FadeSlide>

          <View style={[styles.actionsGrid, isDesktop && styles.actionsGridDesktop]}>
            {QUICK_ACTIONS.map((a, i) => (
              <AnimatedCard
                key={a.id}
                delay={160 + i * 70}
                style={[styles.actionCard, isDesktop && styles.actionCardDesktop]}
                onPress={() => navigation.navigate(a.nav)}
              >
                <View style={[styles.actionIconWrap, { backgroundColor: a.bg }]}>
                  <Ionicons name={a.icon} size={24} color={a.color} />
                </View>
                <Text style={styles.actionLabel}>{a.label}</Text>
                <Text style={styles.actionDesc}>{a.desc}</Text>
              </AnimatedCard>
            ))}
          </View>

          {/* ── Campus Zones ─────────────────────────────────────────────── */}
          <FadeSlide delay={450}>
            <Text style={styles.sectionTitle}>Campus Zones</Text>
          </FadeSlide>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.zonesScroll}
          >
            {ZONES.map((zone, i) => (
              <AnimatedCard
                key={zone.id}
                delay={490 + i * 70}
                style={styles.zoneCard}
                onPress={() => navigation.navigate('Map')}
              >
                <View style={[styles.zoneIconWrap, { backgroundColor: zone.color + '22' }]}>
                  <Ionicons
                    name={zone.icon}
                    size={22}
                    color={zone.color === YELLOW ? '#b8930a' : zone.color}
                  />
                </View>
                <Text style={styles.zoneName}>{zone.name}</Text>
                <Text style={styles.zoneDesc}>{zone.desc}</Text>
                <View style={[styles.zoneArrow, { backgroundColor: zone.color + '22' }]}>
                  <Ionicons
                    name="arrow-forward"
                    size={12}
                    color={zone.color === YELLOW ? '#b8930a' : zone.color}
                  />
                </View>
              </AnimatedCard>
            ))}
          </ScrollView>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  scroll: {
    paddingBottom: 40,
  },
  inner: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },

  // ── Header ──────────────────────────────────────────────────────────────
  header: {
    backgroundColor: DARK,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 28,
    borderRadius: 24,
    padding: 22,
    overflow: 'hidden',
  },
  headerCircle1: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: YELLOW,
    opacity: 0.07,
    top: -60,
    right: -40,
  },
  headerCircle2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: YELLOW,
    opacity: 0.05,
    bottom: -20,
    left: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
    marginBottom: 4,
  },
  zidLabel: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: YELLOW,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Stats ────────────────────────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: YELLOW,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },

  // ── Section title ────────────────────────────────────────────────────────
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111',
    paddingHorizontal: 20,
    marginBottom: 14,
  },

  // ── Quick Actions ────────────────────────────────────────────────────────
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 12,
    marginBottom: 32,
  },
  actionsGridDesktop: {
    justifyContent: 'center',
  },
  actionCard: {
    width: (SCREEN_WIDTH - 24 - 12) / 2,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  actionCardDesktop: {
    width: 160,
    marginHorizontal: 8,
  },
  actionIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
    marginBottom: 3,
  },
  actionDesc: {
    fontSize: 11,
    color: '#aaa',
    fontWeight: '500',
  },

  // ── Campus Zones ─────────────────────────────────────────────────────────
  zonesScroll: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 4,
  },
  zoneCard: {
    width: 150,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  zoneIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  zoneName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
  },
  zoneDesc: {
    fontSize: 11,
    color: '#aaa',
    fontWeight: '500',
    lineHeight: 15,
    marginBottom: 14,
  },
  zoneArrow: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
});
