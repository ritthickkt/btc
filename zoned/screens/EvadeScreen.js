import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

const YELLOW = '#F5C518';
const REPORT_THRESHOLD = 3;
const RESET_MS = 30 * 60 * 1000; // 30 minutes

const ZONES = [
  {
    id: '1',
    name: 'UNSW High Street',
    description: 'High street entrance (from Anzac Parade)',
    reports: 1,
    lastReport: Date.now() - 12 * 60 * 1000, // 12 min ago
  },
  {
    id: '2',
    name: 'UNSW Anzac Parade',
    description: 'Western access point',
    reports: 0,
    lastReport: null,
  },
];

function formatTimeAgo(ts) {
  if (!ts) return 'No reports yet';
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  return `${mins}m ago`;
}

export default function EvadeScreen() {
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [zones, setZones] = useState(ZONES);

  const reportInspector = (id) => {
    setZones((prev) =>
      prev.map((zone) => {
        if (zone.id !== id) return zone;

        const now = Date.now();
        const shouldReset = zone.lastReport && now - zone.lastReport >= RESET_MS;
        const baseReports = shouldReset ? 0 : zone.reports;
        const reports = Math.min(baseReports + 1, REPORT_THRESHOLD);

        return {
          ...zone,
          reports,
          lastReport: now,
        };
      })
    );
  };

  const getReportText = (zone) => {
    if (zone.reports >= REPORT_THRESHOLD) return 'Alert active';
    const remaining = REPORT_THRESHOLD - zone.reports;
    return `${zone.reports} / ${REPORT_THRESHOLD} reports • ${remaining} more to alert`;
  };

  const getProgressWidth = (zone) => {
    const progress = Math.min(zone.reports / REPORT_THRESHOLD, 1);
    return `${progress * 100}%`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Evade</Text>
          <Text style={styles.headerSubtitle}>Report ticket inspectors to warn fellow students</Text>
        </View>
        <View style={styles.alertToggle}>
          <Text style={styles.alertLabel}>Alerts</Text>
          <Switch
            value={alertsEnabled}
            onValueChange={setAlertsEnabled}
            trackColor={{ false: '#ccc', true: YELLOW }}
            thumbColor={alertsEnabled ? '#fff' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.disclaimer}>
        <Ionicons name="alert-circle" size={16} color="#d9480f" />
        <Text style={styles.disclaimerText}>Disclaimer: Always tap on!</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {zones.map((zone) => (
          <View key={zone.id} style={styles.zoneCard}>
            <View style={styles.zoneHeader}>
              <View style={styles.zoneMeta}>
                <Ionicons name="location" size={18} color="#555" />
                <View style={styles.zoneMetaText}>
                  <Text style={styles.zoneName}>{zone.name}</Text>
                  <Text style={styles.zoneTimestamp}>Last report: {formatTimeAgo(zone.lastReport)}</Text>
                </View>
              </View>
              <Text style={styles.zoneStatus}>{getReportText(zone)}</Text>
            </View>

            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: getProgressWidth(zone) }]} />
            </View>

            <TouchableOpacity
              style={styles.reportBtn}
              activeOpacity={0.85}
              onPress={() => reportInspector(zone.id)}
            >
              <Ionicons name="warning" size={16} color="#1a1a1a" />
              <Text style={styles.reportBtnText}>Report Inspector Here</Text>
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.howItWorks}>
          <Text style={styles.sectionTitle}>How it works</Text>
          <View style={styles.bulletRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>Tap “Report” when you spot an inspector at a location</Text>
          </View>
          <View style={styles.bulletRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>When 3+ students report, an alert goes out</Text>
          </View>
          <View style={styles.bulletRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>Turn on notifications to get real-time warnings</Text>
          </View>
          <View style={styles.bulletRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>Reports auto-reset after 30 minutes</Text>
          </View>
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  alertToggle: {
    alignItems: 'flex-end',
  },
  alertLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff4f2',
    borderBottomWidth: 1,
    borderBottomColor: '#fde2e4',
  },
  disclaimerText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#d9480f',
    fontWeight: '600',
  },
  scroll: {
    padding: 20,
    paddingBottom: 32,
  },
  zoneCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  zoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  zoneMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  zoneMetaText: {
    marginLeft: 10,
    flex: 1,
  },
  zoneName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  zoneTimestamp: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  zoneStatus: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'right',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: YELLOW,
    borderRadius: 8,
  },
  reportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: YELLOW,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  reportBtnText: {
    marginLeft: 8,
    color: '#1a1a1a',
    fontWeight: '700',
    fontSize: 14,
  },
  howItWorks: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bullet: {
    fontSize: 16,
    lineHeight: 20,
    marginRight: 10,
    color: '#666',
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});