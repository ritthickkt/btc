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

const ZONES = [
  { id: '1', name: 'Lower Campus', description: 'Scientia, Roundhouse & the Quad', evading: false },
  { id: '2', name: 'Science Precinct', description: 'Physics, Chemistry, BioSci & more', evading: false },
  { id: '3', name: 'Engineering', description: 'Ainsworth, Electrical & CSE', evading: false },
  { id: '4', name: 'Upper Campus', description: 'Library, Mathews & Law', evading: false },
];

export default function EvadeScreen({ navigation }) {
  const [zones, setZones] = useState(ZONES);

  const toggleEvade = (id) => {
    setZones(zones.map(zone =>
      zone.id === id ? { ...zone, evading: !zone.evading } : zone
    ));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Text style={styles.title}>Evade Zones</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.description}>
          Select zones you want to avoid. The app will help you navigate around these areas.
        </Text>

        <View style={styles.zonesList}>
          {zones.map((zone) => (
            <View key={zone.id} style={styles.zoneCard}>
              <View style={styles.zoneInfo}>
                <Ionicons name="location-outline" size={24} color="#666" />
                <View style={styles.zoneText}>
                  <Text style={styles.zoneName}>{zone.name}</Text>
                  <Text style={styles.zoneDesc}>{zone.description}</Text>
                </View>
              </View>
              <Switch
                value={zone.evading}
                onValueChange={() => toggleEvade(zone.id)}
                trackColor={{ false: '#ccc', true: YELLOW }}
                thumbColor={zone.evading ? '#fff' : '#f4f3f4'}
              />
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.saveBtn} activeOpacity={0.8}>
          <Text style={styles.saveText}>Save Preferences</Text>
        </TouchableOpacity>
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
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  scroll: {
    padding: 20,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    lineHeight: 22,
  },
  zonesList: {
    marginBottom: 32,
  },
  zoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  zoneInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  zoneText: {
    marginLeft: 12,
    flex: 1,
  },
  zoneName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  zoneDesc: {
    fontSize: 14,
    color: '#666',
  },
  saveBtn: {
    backgroundColor: YELLOW,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
});