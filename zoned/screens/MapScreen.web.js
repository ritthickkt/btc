import { useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BUILDINGS, FILTERS } from './mapData';

const DEFAULT_CENTER = { lat: -33.9175, lng: 151.2313, zoom: 17 };

const buildMapUrl = ({ lat, lng, zoom }) => {
  // OpenStreetMap embed URL with optional marker and bounding box.
  const bboxSize = 0.006;
  const minLon = lng - bboxSize;
  const minLat = lat - bboxSize;
  const maxLon = lng + bboxSize;
  const maxLat = lat + bboxSize;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${minLon}%2C${minLat}%2C${maxLon}%2C${maxLat}&layer=mapnik&marker=${lat}%2C${lng}`;
};

export default function MapScreen() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return BUILDINGS;
    const lower = search.toLowerCase();
    return BUILDINGS.filter((b) =>
      b.name.toLowerCase().includes(lower) ||
      b.code.toLowerCase().includes(lower) ||
      b.type.toLowerCase().includes(lower)
    );
  }, [search]);

  const mapTarget = selected ?? DEFAULT_CENTER;
  const mapUrl = buildMapUrl(mapTarget);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color="#999" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search buildings..."
            placeholderTextColor="#bbb"
          />
        </View>
        <TouchableOpacity style={styles.clearBtn} onPress={() => setSelected(null)}>
          <Ionicons name="refresh" size={18} color="#1a1a1a" />
        </TouchableOpacity>
      </View>

      <View style={styles.mapWrapper}>
        <iframe
          title="UNSW Campus Map"
          src={mapUrl}
          style={styles.iframe}
          frameBorder="0"
          allowFullScreen
        />
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Buildings</Text>
        <Text style={styles.listSub}>{filtered.length} results</Text>
      </View>
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {filtered.map((b) => (
          <TouchableOpacity
            key={b.id}
            style={[styles.listItem, selected?.id === b.id && styles.listItemActive]}
            onPress={() => setSelected(b)}
            activeOpacity={0.8}
          >
            <View style={styles.listRow}>
              <View style={styles.markerDot} />
              <View style={{ flex: 1 }}>
                <Text style={styles.listName}>{b.name}</Text>
                <Text style={styles.listMeta}>{b.code} · {b.type}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#ccc" />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1a1a1a',
  },
  clearBtn: {
    marginLeft: 10,
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  mapWrapper: {
    height: 320,
    borderRadius: 18,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  iframe: {
    width: '100%',
    height: '100%',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  listSub: {
    fontSize: 12,
    color: '#999',
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listItem: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: '#fff',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  listItemActive: {
    borderColor: '#F5C518',
    backgroundColor: '#fffbdf',
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  markerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F5C518',
    marginRight: 12,
  },
  listName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  listMeta: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
});
