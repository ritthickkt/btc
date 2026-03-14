import { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, Switch,
  ActivityIndicator, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

const YELLOW = '#F5C518';

const LOCATIONS = [
  'UNSW High Street',
  'UNSW Anzac Parade',
  'UNSW Gate 2 (Barker St)',
  'Central Station',
  'Kingsford Light Rail',
];

// Mock state — counts reset on reload until inspector_reports table exists
export default function EvadeScreen() {
  const [alerts, setAlerts] = useState(false);
  const [counts, setCounts] = useState({});
  const [submitting, setSubmitting] = useState(null);

  const handleReport = (location) => {
    setSubmitting(location);
    setTimeout(() => {
      setCounts(prev => ({ ...prev, [location]: (prev[location] || 0) + 1 }));
      setSubmitting(null);
    }, 600);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>🛡️ Evade</Text>
            <Text style={styles.headerSub}>Report ticket inspectors to warn fellow students</Text>
          </View>
          <View style={styles.alertsToggle}>
            <Ionicons name="notifications-off-outline" size={16} color="#888" />
            <Text style={styles.alertsLabel}>Alerts</Text>
            <Switch
              value={alerts}
              onValueChange={setAlerts}
              trackColor={{ false: '#e0e0e0', true: YELLOW }}
              thumbColor="#fff"
              ios_backgroundColor="#e0e0e0"
            />
          </View>
        </View>

        <View style={styles.disclaimer}>
          <Ionicons name="warning-outline" size={15} color="#e03131" />
          <Text style={styles.disclaimerText}>Disclaimer: Always tap on!</Text>
        </View>

        {LOCATIONS.map(loc => {
          const count = counts[loc] || 0;
          const progress = Math.min(count / 3, 1);

          return (
            <View key={loc} style={[styles.locationCard, count >= 3 && styles.locationCardAlerted]}>
              <View style={styles.locationCardHeader}>
                <View style={styles.locationIconWrap}>
                  <Ionicons name="location-outline" size={20} color="#555" />
                </View>
                <View style={styles.locationInfo}>
                  <Text style={styles.locationName}>{loc}</Text>
                  <View style={styles.locationMetaRow}>
                    <Ionicons name="time-outline" size={13} color="#aaa" />
                    <Text style={styles.locationMeta}>
                      {count > 0 ? 'Last report: just now' : 'Last report: No reports yet'}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.progressRow}>
                <View style={styles.progressMeta}>
                  <Ionicons name="people-outline" size={13} color="#aaa" />
                  <Text style={styles.progressText}>{count} / 3 reports</Text>
                </View>
                <Text style={styles.progressRemain}>{Math.max(0, 3 - count)} more to alert</Text>
              </View>

              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
              </View>

              <TouchableOpacity
                style={[styles.reportBtn, submitting === loc && { opacity: 0.6 }]}
                onPress={() => handleReport(loc)}
                disabled={submitting === loc}
                activeOpacity={0.85}
              >
                {submitting === loc
                  ? <ActivityIndicator color="#111" />
                  : <>
                      <Ionicons name="warning-outline" size={16} color="#111" />
                      <Text style={styles.reportBtnText}>Report Inspector Here</Text>
                    </>
                }
              </TouchableOpacity>
            </View>
          );
        })}

        <View style={styles.howItWorks}>
          <Text style={styles.howTitle}>How it works</Text>
          {[
            'Tap "Report" when you spot an inspector at a location',
            'When 3+ students report, an alert goes out',
            'Turn on notifications to get real-time warnings',
            'Reports auto-reset after 30 minutes',
          ].map((line, i) => (
            <Text key={i} style={styles.howLine}>• {line}</Text>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  scroll: { paddingBottom: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#111', marginBottom: 4 },
  headerSub: { fontSize: 13, color: '#888' },
  alertsToggle: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  alertsLabel: { fontSize: 13, color: '#555', fontWeight: '500' },
  disclaimer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 20, backgroundColor: '#fff5f5', borderRadius: 10, padding: 12, marginBottom: 20, borderWidth: 1, borderColor: '#ffc9c9' },
  disclaimerText: { fontSize: 13, color: '#e03131', fontWeight: '600' },
  locationCard: { marginHorizontal: 20, marginBottom: 14, backgroundColor: '#fff', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#efefef', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  locationCardAlerted: { borderColor: YELLOW, backgroundColor: '#fffef0' },
  locationCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  locationIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  locationInfo: { flex: 1 },
  locationName: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 3 },
  locationMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationMeta: { fontSize: 12, color: '#aaa' },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  progressMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  progressText: { fontSize: 12, color: '#888' },
  progressRemain: { fontSize: 12, color: '#888' },
  progressBarBg: { height: 6, backgroundColor: '#eee', borderRadius: 3, marginBottom: 14 },
  progressBarFill: { height: 6, backgroundColor: YELLOW, borderRadius: 3 },
  reportBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: YELLOW, borderRadius: 12, paddingVertical: 14 },
  reportBtnText: { fontSize: 15, fontWeight: '700', color: '#111' },
  howItWorks: { marginHorizontal: 20, backgroundColor: '#f8f8f8', borderRadius: 14, padding: 18, marginTop: 8 },
  howTitle: { fontSize: 14, fontWeight: '700', color: '#111', marginBottom: 10 },
  howLine: { fontSize: 13, color: '#666', lineHeight: 22 },
});