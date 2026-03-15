import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';

const FOOD_KEYWORDS = ['food', 'bbq', 'pizza', 'snacks', 'free food', 'lunch'];

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
  const res = await fetch('https://api.hellorubric.com/', {
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
  const res = await fetch('https://api.hellorubric.com/', {
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
}

function extractEid(destination) {
  const match = destination.match(/eid=(\d+)/);
  return match ? parseInt(match[1]) : null;
}

export default function MapScreen() {
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [debug, setDebug] = useState('Starting...');

  useEffect(() => {
    async function loadFoodEvents() {
      try {
        setDebug('Searching events...');
        const allResults = [];
        for (const keyword of FOOD_KEYWORDS) {
          const results = await searchEvents(keyword);
          setDebug(`Found ${results.length} for "${keyword}"`);
          allResults.push(...results);
        }
        const seen = new Set();
        const unique = allResults.filter(e => {
          if (seen.has(e.destination)) return false;
          seen.add(e.destination);
          return true;
        });
        setDebug(`Getting details for ${unique.length} events...`);
        const detailed = [];
        for (const event of unique.slice(0, 20)) {
          const eid = extractEid(event.destination);
          if (!eid) continue;
          const details = await getEventDetails(eid);
          if (details?.eventLatitude && details?.eventLongitude) {
            detailed.push({
              id: eid,
              title: details.eventName,
              society: event.societyname,
              time: details.eventTime,
              lat: parseFloat(details.eventLatitude),
              lng: parseFloat(details.eventLongitude),
            });
          }
        }
        setDebug(`Done! Found ${detailed.length} food events`);
        setMarkers(detailed);
      } catch (e) {
        setDebug(`Error: ${e.message}`);
      } finally {
        setLoading(false);
      }
    }
    loadFoodEvents();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.debugBox}>
        <Text style={styles.debugText}>{debug}</Text>
      </View>
      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#FFD700" />
          <Text style={styles.loadingText}>Finding free food...</Text>
        </View>
      )}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: -33.9173,
          longitude: 151.2313,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {markers.map(marker => (
          <Marker
            key={marker.id}
            coordinate={{ latitude: marker.lat, longitude: marker.lng }}
            pinColor="green"
          >
            <Callout>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{marker.title}</Text>
                <Text style={styles.calloutSociety}>{marker.society}</Text>
                <Text style={styles.calloutTime}>{marker.time}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  debugBox: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    zIndex: 999,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 8,
    borderRadius: 8,
  },
  debugText: { color: 'white', fontSize: 12 },
  loader: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    zIndex: 999,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  loadingText: { marginTop: 6, fontWeight: '600' },
  callout: { width: 200, padding: 4 },
  calloutTitle: { fontWeight: 'bold', fontSize: 14 },
  calloutSociety: { color: '#666', fontSize: 12 },
  calloutTime: { color: '#999', fontSize: 11, marginTop: 2 },
});
