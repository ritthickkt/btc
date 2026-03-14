import { useState } from 'react';
import {
  StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

const YELLOW = '#F5C518';

// Mock data until food_reports table is created
const MOCK_REPORTS = [
  { id: '1', location: 'Quad Lawn', report_count: 3, created_at: new Date(Date.now() - 37 * 60000).toISOString() },
  { id: '2', location: 'Scientia Building', report_count: 1, created_at: new Date(Date.now() - 17 * 60000).toISOString() },
];

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export default function FoodScreen() {
  const [reports, setReports] = useState(MOCK_REPORTS);
  const [newLocation, setNewLocation] = useState('');

  const handleReport = () => {
    if (!newLocation.trim()) return;
    const newReport = {
      id: Date.now().toString(),
      location: newLocation.trim(),
      report_count: 1,
      created_at: new Date().toISOString(),
    };
    setReports(prev => [newReport, ...prev]);
    setNewLocation('');
  };

  const handleUpvote = (id) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, report_count: r.report_count + 1 } : r));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <FlatList
        data={reports}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>🍕 Free Food</Text>
            <Text style={styles.headerSub}>Spotted free food on campus? Let everyone know!</Text>
            <View style={styles.reportBox}>
              <Text style={styles.reportBoxTitle}>Report Free Food</Text>
              <View style={styles.reportRow}>
                <TextInput
                  style={styles.reportInput}
                  placeholder="e.g. CATS102 Business Building, Lawn opp Ainsworth"
                  placeholderTextColor="#aaa"
                  value={newLocation}
                  onChangeText={setNewLocation}
                />
                <TouchableOpacity
                  style={[styles.reportBtn, !newLocation.trim() && { opacity: 0.5 }]}
                  onPress={handleReport}
                  disabled={!newLocation.trim()}
                  activeOpacity={0.8}
                >
                  <Ionicons name="megaphone-outline" size={16} color="#111" />
                  <Text style={styles.reportBtnText}>Report</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.sectionLabel}>Active Reports</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.reportCard}>
            <Text style={styles.reportEmoji}>🍕</Text>
            <View style={styles.reportCardMid}>
              <View style={styles.reportLocRow}>
                <Ionicons name="location" size={14} color={YELLOW} />
                <Text style={styles.reportLoc}>{item.location}</Text>
              </View>
              <View style={styles.reportMeta}>
                <Ionicons name="people-outline" size={13} color="#aaa" />
                <Text style={styles.reportMetaText}>{item.report_count} report{item.report_count !== 1 ? 's' : ''}</Text>
                <Ionicons name="time-outline" size={13} color="#aaa" />
                <Text style={styles.reportMetaText}>{timeAgo(item.created_at)}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.upvoteBtn} onPress={() => handleUpvote(item.id)} activeOpacity={0.7}>
              <Text style={styles.upvoteBtnText}>+1</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}><Text style={styles.emptyText}>No active reports</Text></View>
        }
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  list: { paddingBottom: 40 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#111', marginBottom: 4 },
  headerSub: { fontSize: 14, color: '#888', marginBottom: 20 },
  reportBox: { borderWidth: 1, borderColor: '#e8e8e8', borderRadius: 14, padding: 16, marginBottom: 24 },
  reportBoxTitle: { fontSize: 15, fontWeight: '700', color: '#111', marginBottom: 12 },
  reportRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  reportInput: {
    flex: 1, backgroundColor: '#f5f5f5', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: '#111', borderWidth: 1, borderColor: '#eee',
  },
  reportBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: YELLOW, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
  },
  reportBtnText: { fontSize: 14, fontWeight: '700', color: '#111' },
  sectionLabel: { fontSize: 15, fontWeight: '700', color: '#111', marginBottom: 10 },
  reportCard: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  reportEmoji: { fontSize: 32, marginRight: 14 },
  reportCardMid: { flex: 1 },
  reportLocRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  reportLoc: { fontSize: 15, fontWeight: '700', color: '#111' },
  reportMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  reportMetaText: { fontSize: 12, color: '#aaa' },
  upvoteBtn: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  upvoteBtnText: { fontSize: 14, fontWeight: '700', color: '#333' },
  empty: { paddingTop: 40, alignItems: 'center' },
  emptyText: { fontSize: 15, color: '#ccc' },
});