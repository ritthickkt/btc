import { useMemo, useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BUILDINGS } from './mapData';

const DEFAULT_CENTER = { lat: -33.9175, lng: 151.2313, zoom: 17 };

const buildMapUrl = ({ lat, lng }) => {
  const bboxSize = 0.006;
  const minLon = lng - bboxSize;
  const minLat = lat - bboxSize;
  const maxLon = lng + bboxSize;
  const maxLat = lat + bboxSize;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${minLon}%2C${minLat}%2C${maxLon}%2C${maxLat}&layer=mapnik&marker=${lat}%2C${lng}`;
};

// Fetch with 5 second timeout failsafe
async function fetchWithTimeout(url, options, timeout = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

async function searchEvents(query) {
  const details = {
    firstCall: false,
    sortType: 'date',
    desiredType: 'events',
    limit: 50,
    offset: 0,
    sortDirection: 'asc',
    searchQuery: query,
    eventsPeriodFilter: 'Upcoming',
    countryCode: 'AU',
    state: 'New South Wales',
    selectedUniversityId: '5',
    sessionid: 'ae925467-915f-4770-a040-adfb60d99c1e',
    currentUrl: 'https://campus.hellorubric.com/search?type=events',
    device: 'web_portal',
    version: 4,
    timestamp: Date.now(),
  };
  const body = `details=${encodeURIComponent(JSON.stringify(details))}&endpoint=getUnifiedSearch`;
  try {
    const res = await fetchWithTimeout('https://api.hellorubric.com/', {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'origin': 'https://campus.hellorubric.com',
        'referer': 'https://campus.hellorubric.com/',
      },
      body,
    });
    const data = await res.json();
    return data.results || [];
  } catch (e) {
    console.warn(`searchEvents failed for "${query}":`, e.message);
    return [];
  }
}

async function getEventDetails(eid) {
  const details = {
    offset: 0,
    limit: 4,
    sortType: 'rating',
    sortDirection: 'desc',
    reviewsRequired: false,
    desiredLevel: 'category',
    eventId: eid,
    category: 'event',
    currentUrl: `https://campus.hellorubric.com/?eid=${eid}`,
    device: 'web_portal',
    version: 4,
    timestamp: Date.now(),
  };
  const body = `details=${encodeURIComponent(JSON.stringify(details))}&endpoint=getUnifiedEventScreen`;
  try {
    const res = await fetchWithTimeout('https://api.hellorubric.com/', {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'origin': 'https://campus.hellorubric.com',
        'referer': 'https://campus.hellorubric.com/',
      },
      body,
    });
    const data = await res.json();
    return data.eventDetails || null;
  } catch (e) {
    console.warn(`getEventDetails failed for eid ${eid}:`, e.message);
    return null;
  }
}

function extractEid(destination) {
  const match = destination.match(/eid=(\d+)/);
  return match ? parseInt(match[1]) : null;
}

const FOOD_KEYWORDS = ['food', 'bbq', 'pizza', 'snacks', 'free food', 'lunch'];

export default function MapScreen() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState('buildings');
  const [foodEvents, setFoodEvents] = useState([]);
  const [foodLoading, setFoodLoading] = useState(false);
  const [foodLoaded, setFoodLoaded] = useState(false);
  const [debugMsg, setDebugMsg] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return BUILDINGS;
    const lower = search.toLowerCase();
    return BUILDINGS.filter((b) =>
      b.name.toLowerCase().includes(lower) ||
      b.code.toLowerCase().includes(lower) ||
      b.type.toLowerCase().includes(lower)
    );
  }, [search]);

  useEffect(() => {
    if (mode === 'food' && !foodLoaded) {
      setFoodLoading(true);
      setDebugMsg('Searching Rubric...');

      // Overall 30 second hard timeout
      const hardTimeout = setTimeout(() => {
        setFoodLoading(false);
        setFoodLoaded(true);
        setDebugMsg('Timed out — showing partial results');
      }, 30000);

      async function loadFood() {
        try {
          // Step 1: Search all keywords IN PARALLEL
          setDebugMsg('Fetching events...');
          const searchResults = await Promise.all(
            FOOD_KEYWORDS.map(kw => searchEvents(kw))
          );
          const allResults = searchResults.flat();

          // Step 2: Deduplicate
          const seen = new Set();
          const unique = allResults.filter(e => {
            if (seen.has(e.destination)) return false;
            seen.add(e.destination);
            return true;
          });

          setDebugMsg(`Found ${unique.length} events, getting locations...`);

          // Step 3: Get details IN PARALLEL (limit 15)
          const detailResults = await Promise.allSettled(
            unique.slice(0, 15).map(async (event) => {
              const eid = extractEid(event.destination);
              if (!eid) return null;
              const details = await getEventDetails(eid);
              if (details?.eventLatitude && details?.eventLongitude) {
                return {
                  id: eid,
                  title: details.eventName,
                  society: event.societyname,
                  time: details.eventTime,
                  lat: parseFloat(details.eventLatitude),
                  lng: parseFloat(details.eventLongitude),
                };
              }
              return null;
            })
          );

          const detailed = detailResults
            .filter(r => r.status === 'fulfilled' && r.value !== null)
            .map(r => r.value);

          clearTimeout(hardTimeout);
          setDebugMsg(`Done! ${detailed.length} events found`);
          setFoodEvents(detailed);
          setFoodLoaded(true);
        } catch (e) {
          clearTimeout(hardTimeout);
          setDebugMsg(`Error: ${e.message}`);
          setFoodLoaded(true);
        } finally {
          setFoodLoading(false);
        }
      }
      loadFood();
    }
  }, [mode]);

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
        <TouchableOpacity style={styles.clearBtn} onPress={() => { setSelected(null); setSearch(''); }}>
          <Ionicons name="refresh" size={18} color="#1a1a1a" />
        </TouchableOpacity>
      </View>

      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, mode === 'buildings' && styles.toggleActive]}
          onPress={() => { setMode('buildings'); setSelected(null); }}
        >
          <Text style={[styles.toggleText, mode === 'buildings' && styles.toggleTextActive]}>🏛 Buildings</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, mode === 'food' && styles.toggleActive]}
          onPress={() => { setMode('food'); setSelected(null); }}
        >
          <Text style={[styles.toggleText, mode === 'food' && styles.toggleTextActive]}>🍕 Free Food</Text>
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

      {mode === 'buildings' && (
        <>
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
        </>
      )}

      {mode === 'food' && (
        <>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>🍕 Free Food Events</Text>
            <Text style={styles.listSub}>{foodLoading ? debugMsg : `${foodEvents.length} events`}</Text>
          </View>
          {foodLoading && (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#F5C518" />
              <Text style={styles.loadingText}>{debugMsg}</Text>
            </View>
          )}
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {foodEvents.map((e) => (
              <TouchableOpacity
                key={e.id}
                style={[styles.listItem, selected?.id === e.id && styles.listItemActive]}
                onPress={() => setSelected({ lat: e.lat, lng: e.lng, id: e.id })}
                activeOpacity={0.8}
              >
                <View style={styles.listRow}>
                  <View style={[styles.markerDot, { backgroundColor: '#4CAF50' }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.listName}>{e.title}</Text>
                    <Text style={styles.listMeta}>{e.society} · {e.time}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#ccc" />
                </View>
              </TouchableOpacity>
            ))}
            {!foodLoading && foodEvents.length === 0 && foodLoaded && (
              <Text style={styles.emptyText}>No free food events found right now.</Text>
            )}
          </ScrollView>
        </>
      )}
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
  searchInput: { flex: 1, fontSize: 14, color: '#1a1a1a' },
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
  toggleRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  toggleActive: { backgroundColor: '#F5C518', borderColor: '#F5C518' },
  toggleText: { fontSize: 13, fontWeight: '600', color: '#999' },
  toggleTextActive: { color: '#1a1a1a' },
  mapWrapper: {
    height: 280,
    borderRadius: 18,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  iframe: { width: '100%', height: '100%' },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  listTitle: { fontSize: 18, fontWeight: '800', color: '#1a1a1a' },
  listSub: { fontSize: 12, color: '#999' },
  list: { flex: 1, paddingHorizontal: 16 },
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
  listItemActive: { borderColor: '#F5C518', backgroundColor: '#fffbdf' },
  listRow: { flexDirection: 'row', alignItems: 'center' },
  markerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F5C518',
    marginRight: 12,
  },
  listName: { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
  listMeta: { fontSize: 12, color: '#777', marginTop: 2 },
  loadingBox: { alignItems: 'center', paddingVertical: 24 },
  loadingText: { marginTop: 10, color: '#999', fontSize: 13 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 14 },
});
