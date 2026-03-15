import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const DEFAULT_CENTER = { lat: -33.9175, lng: 151.2313 };

function stripHtml(html) {
  return html ? html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').toLowerCase() : '';
}

const FOOD_KEYWORDS = [
  'free food','bbq','barbeque','barbecue','pizza','snacks',
  'catering','refreshments','lunch','dinner','breakfast',
  'sausage','burger','cake','bake','eat','nibbles',
  'drinks and food','food provided','food will be','there will be food',
  'free drinks','complimentary food','light refreshments'
];

function hasFreeFood(description) {
  return FOOD_KEYWORDS.some(kw => stripHtml(description).includes(kw));
}

function parseEventDate(dateStr) {
  if (!dateStr) return null;
  try { return new Date(dateStr); } catch (e) { return null; }
}

function filterAndSortByDate(events) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const threeDaysEnd = new Date(todayStart);
  threeDaysEnd.setDate(threeDaysEnd.getDate() + 3);
  threeDaysEnd.setHours(23, 59, 59);
  return events
    .filter(e => { const d = parseEventDate(e.time); return d && d >= todayStart && d <= threeDaysEnd; })
    .sort((a, b) => parseEventDate(a.time) - parseEventDate(b.time));
}

async function fetchWithTimeout(url, options, timeout = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (e) { clearTimeout(timer); throw e; }
}

async function searchEvents(query) {
  const details = {
    firstCall: false, sortType: 'date', desiredType: 'events',
    limit: 50, offset: 0, sortDirection: 'asc', searchQuery: query,
    eventsPeriodFilter: 'Upcoming', countryCode: 'AU', state: 'New South Wales',
    selectedUniversityId: '5', sessionid: 'ae925467-915f-4770-a040-adfb60d99c1e',
    currentUrl: 'https://campus.hellorubric.com/search?type=events',
    device: 'web_portal', version: 4, timestamp: Date.now(),
  };
  const body = `details=${encodeURIComponent(JSON.stringify(details))}&endpoint=getUnifiedSearch`;
  try {
    const res = await fetchWithTimeout('https://api.hellorubric.com/', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded; charset=UTF-8', 'origin': 'https://campus.hellorubric.com', 'referer': 'https://campus.hellorubric.com/' },
      body,
    });
    const data = await res.json();
    return data.results || [];
  } catch (e) { return []; }
}

async function getEventDetails(eid) {
  const details = {
    eventId: String(eid),
    currentUrl: `https://campus.hellorubric.com/?eid=${eid}`,
    device: 'web_portal', version: 4, timestamp: Date.now(),
  };
  const body = `details=${encodeURIComponent(JSON.stringify(details))}&endpoint=${encodeURIComponent('https://appserver.getqpay.com:9090/AppServerSwapnil/event/details')}`;
  try {
    const res = await fetchWithTimeout('https://api.hellorubric.com/', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded; charset=UTF-8', 'origin': 'https://campus.hellorubric.com', 'referer': 'https://campus.hellorubric.com/' },
      body,
    });
    const data = await res.json();
    return data.eventDetails || null;
  } catch (e) { return null; }
}

function extractEid(destination) {
  const match = destination.match(/eid=(\d+)/);
  return match ? parseInt(match[1]) : null;
}

const SEARCH_KEYWORDS = ['food','bbq','pizza','snacks','free food','lunch','social','welcome','party'];

// Build Leaflet HTML with markers
function buildLeafletHtml(events, selectedId) {
  const markers = events.map(e => ({
    lat: e.lat,
    lng: e.lng,
    title: e.title,
    society: e.society,
    time: e.time,
    id: e.id,
    selected: e.id === selectedId,
  }));

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"/>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
  <style>
    body { margin: 0; padding: 0; }
    #map { width: 100%; height: 100vh; }
    .custom-marker {
      background: #F5C518;
      border: 2px solid #1a1a1a;
      border-radius: 50%;
      width: 18px;
      height: 18px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.4);
    }
    .custom-marker.selected {
      background: #FF6B00;
      width: 24px;
      height: 24px;
      border: 3px solid #1a1a1a;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map').setView([${DEFAULT_CENTER.lat}, ${DEFAULT_CENTER.lng}], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    var markers = ${JSON.stringify(markers)};

    markers.forEach(function(m) {
      var icon = L.divIcon({
        className: '',
        html: '<div class="custom-marker' + (m.selected ? ' selected' : '') + '"></div>',
        iconSize: m.selected ? [24, 24] : [18, 18],
        iconAnchor: m.selected ? [12, 12] : [9, 9],
      });
      var marker = L.marker([m.lat, m.lng], { icon: icon }).addTo(map);
      marker.bindPopup(
        '<b>' + m.title + '</b><br/>' +
        m.society + '<br/>' +
        '<span style="color:#F5C518;font-weight:bold">' + m.time + '</span>'
      );
      if (m.selected) {
        marker.openPopup();
        map.setView([m.lat, m.lng], 18);
      }
    });
  </script>
</body>
</html>`;
}

export default function MapScreen() {
  const [selected, setSelected] = useState(null);
  const [foodEvents, setFoodEvents] = useState([]);
  const [foodLoading, setFoodLoading] = useState(true);
  const [foodLoaded, setFoodLoaded] = useState(false);
  const [debugMsg, setDebugMsg] = useState('Searching Rubric...');

  useEffect(() => {
    const hardTimeout = setTimeout(() => {
      setFoodLoading(false); setFoodLoaded(true); setDebugMsg('Timed out');
    }, 60000);

    async function loadFood() {
      try {
        setDebugMsg('Fetching events...');
        const searchResults = await Promise.all(SEARCH_KEYWORDS.map(kw => searchEvents(kw)));
        const allResults = searchResults.flat();
        const seen = new Set();
        const unique = allResults.filter(e => {
          if (seen.has(e.destination)) return false;
          seen.add(e.destination); return true;
        });
        setDebugMsg(`Checking ${unique.length} events...`);
        const detailResults = await Promise.allSettled(
          unique.slice(0, 30).map(async (event) => {
            const eid = extractEid(event.destination);
            if (!eid) return null;
            const details = await getEventDetails(eid);
            if (!details) return null;
            if (!hasFreeFood(details.eventDescription || '') && !hasFreeFood(details.eventName || '')) return null;
            if (!details.eventLatitude || !details.eventLongitude) return null;
            return {
              id: eid, title: details.eventName, society: event.societyname,
              time: details.eventTime, address: details.eventAddress,
              lat: parseFloat(details.eventLatitude), lng: parseFloat(details.eventLongitude),
            };
          })
        );
        const sorted = filterAndSortByDate(
          detailResults.filter(r => r.status === 'fulfilled' && r.value !== null).map(r => r.value)
        );
        clearTimeout(hardTimeout);
        setDebugMsg(`Found ${sorted.length} events!`);
        setFoodEvents(sorted);
        setFoodLoaded(true);
      } catch (e) {
        clearTimeout(hardTimeout); setDebugMsg(`Error: ${e.message}`); setFoodLoaded(true);
      } finally { setFoodLoading(false); }
    }
    loadFood();
  }, []);

  function formatDate(dateStr) {
    const d = parseEventDate(dateStr);
    if (!d) return dateStr;
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (d.toDateString() === today.toDateString()) return `Today · ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    if (d.toDateString() === tomorrow.toDateString()) return `Tomorrow · ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }) + ` · ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  const leafletHtml = buildLeafletHtml(foodEvents, selected?.id);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.mapWrapper}>
        <iframe
          title="UNSW Free Food Map"
          srcDoc={leafletHtml}
          style={styles.iframe}
          frameBorder="0"
        />
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>🍕 Free Food</Text>
        <Text style={styles.listSub}>
          {foodLoading ? debugMsg : `${foodEvents.length} events · next 3 days`}
        </Text>
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
              <View style={styles.markerDot} />
              <View style={{ flex: 1 }}>
                <Text style={styles.listName}>{e.title}</Text>
                <Text style={styles.listMeta}>{e.society}</Text>
                <Text style={[styles.listMeta, { color: '#F5C518', fontWeight: '700' }]}>{formatDate(e.time)}</Text>
                <Text style={styles.listMeta}>{e.address}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#ccc" />
            </View>
          </TouchableOpacity>
        ))}
        {!foodLoading && foodEvents.length === 0 && foodLoaded && (
          <Text style={styles.emptyText}>No free food events in the next 3 days. Check back soon!</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  mapWrapper: { height: 280, borderRadius: 18, overflow: 'hidden', marginHorizontal: 16, marginTop: 12, marginBottom: 16, borderWidth: 1, borderColor: '#e8e8e8' },
  iframe: { width: '100%', height: '100%' },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 10 },
  listTitle: { fontSize: 18, fontWeight: '800', color: '#1a1a1a' },
  listSub: { fontSize: 12, color: '#999' },
  list: { flex: 1, paddingHorizontal: 16 },
  listItem: { paddingVertical: 14, paddingHorizontal: 14, borderRadius: 18, backgroundColor: '#fff', marginBottom: 12, borderWidth: 1, borderColor: 'transparent', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  listItemActive: { borderColor: '#F5C518', backgroundColor: '#fffbdf' },
  listRow: { flexDirection: 'row', alignItems: 'center' },
  markerDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#F5C518', marginRight: 12, alignSelf: 'flex-start', marginTop: 4 },
  listName: { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
  listMeta: { fontSize: 12, color: '#777', marginTop: 2 },
  loadingBox: { alignItems: 'center', paddingVertical: 24 },
  loadingText: { marginTop: 10, color: '#999', fontSize: 13 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 14 },
});
