import { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity,
  TextInput, Animated, ScrollView, Platform,
} from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabase/config';

import {
  BUILDINGS,
  FILTERS,
  LOCATION_COORDS,
  TYPE_CONFIG,
  UNSW_REGION,
} from './mapData';

// Renders two concentric circles to simulate a heat glow
function HeatCircle({ coordinate, intensity }) {
  const r = 60 + intensity * 140;   // 60m–200m radius
  const alpha1 = 0.08 + intensity * 0.18;
  const alpha2 = 0.14 + intensity * 0.24;

  // colour: yellow → orange → red as intensity rises
  const red = 255;
  const green = Math.floor(200 - intensity * 200);
  const blue = 0;

  return (
    <>
      <Circle
        center={coordinate}
        radius={r}
        fillColor={`rgba(${red},${green},${blue},${alpha1})`}
        strokeWidth={0}
      />
      <Circle
        center={coordinate}
        radius={r * 0.5}
        fillColor={`rgba(${red},${green},${blue},${alpha2})`}
        strokeWidth={0}
      />
    </>
  );
}

export default function MapScreen() {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [heatPoints, setHeatPoints] = useState([]);

  const slideAnim = useRef(new Animated.Value(320)).current;
  const insets = useSafeAreaInsets();

  // Fetch crowd data from study posts
  useEffect(() => {
    async function loadHeatData() {
      const { data } = await supabase
        .from('study_posts')
        .select('location')
        .order('created_at', { ascending: false })
        .limit(200);

      if (!data?.length) return;

      const counts = {};
      data.forEach(p => {
        counts[p.location] = (counts[p.location] || 0) + 1;
      });

      const points = Object.entries(counts)
        .map(([location, count]) => {
          const coords = LOCATION_COORDS[location];
          return coords ? { ...coords, count } : null;
        })
        .filter(Boolean);

      setHeatPoints(points);
    }

    loadHeatData();
  }, []);

  const maxCount = Math.max(...heatPoints.map(p => p.count), 1);

  const filtered = BUILDINGS.filter(b => {
    const matchesFilter = activeFilter === 'All' || b.type === activeFilter;
    const matchesQuery =
      query.trim() === '' ||
      b.name.toLowerCase().includes(query.toLowerCase()) ||
      b.code.toLowerCase().includes(query.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  const openSheet = (building) => {
    setSelectedBuilding(building);
    Animated.spring(slideAnim, {
      toValue: 0, useNativeDriver: true, tension: 70, friction: 11,
    }).start();
  };

  const closeSheet = () => {
    Animated.timing(slideAnim, {
      toValue: 320, duration: 220, useNativeDriver: true,
    }).start(() => setSelectedBuilding(null));
  };

  const config = selectedBuilding ? TYPE_CONFIG[selectedBuilding.type] : null;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <MapView
        style={styles.map}
        initialRegion={UNSW_REGION}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {/* Heatmap circles */}
        {showHeatmap && heatPoints.map((point, i) => (
          <HeatCircle
            key={i}
            coordinate={{ latitude: point.latitude, longitude: point.longitude }}
            intensity={point.count / maxCount}
          />
        ))}

        {/* Building markers */}
        {filtered.map(b => (
          <Marker
            key={b.id}
            coordinate={{ latitude: b.lat, longitude: b.lng }}
            onPress={() => openSheet(b)}
            pinColor={TYPE_CONFIG[b.type]?.color ?? '#1a1a1a'}
          />
        ))}
      </MapView>

      {/* Top overlay */}
      <SafeAreaView edges={['top']} style={styles.topOverlay} pointerEvents="box-none">

        {/* Search + heatmap toggle row */}
        <View style={styles.topRow}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={16} color="#aaa" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search buildings..."
              placeholderTextColor="#bbb"
              value={query}
              onChangeText={setQuery}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Ionicons name="close-circle" size={16} color="#ccc" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[styles.heatBtn, showHeatmap && styles.heatBtnActive]}
            onPress={() => setShowHeatmap(v => !v)}
            activeOpacity={0.8}
          >
            <Ionicons name="flame" size={18} color={showHeatmap ? '#1a1a1a' : '#888'} />
          </TouchableOpacity>
        </View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScroll}
          contentContainerStyle={styles.filtersContent}
        >
          {FILTERS.map(f => {
            const active = activeFilter === f;
            const typeColor = f === 'All' ? '#1a1a1a' : (TYPE_CONFIG[f]?.color ?? '#1a1a1a');
            const textColor = active
              ? (typeColor === '#F5C518' || typeColor === '#1a1a1a' ? (typeColor === '#F5C518' ? '#1a1a1a' : '#fff') : '#fff')
              : '#666';
            return (
              <TouchableOpacity
                key={f}
                style={[styles.chip, active && { backgroundColor: typeColor, borderColor: typeColor }]}
                onPress={() => setActiveFilter(f)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, { color: active ? textColor : '#666' }]}>{f}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Heatmap legend */}
        {showHeatmap && (
          <View style={styles.legend}>
            <Text style={styles.legendLabel}>Low</Text>
            <View style={styles.legendBar}>
              {['#FFD700', '#FF8C00', '#FF3300'].map((c, i) => (
                <View key={i} style={[styles.legendSegment, { backgroundColor: c }]} />
              ))}
            </View>
            <Text style={styles.legendLabel}>High</Text>
            <Text style={styles.legendSub}>  crowd</Text>
          </View>
        )}
      </SafeAreaView>

      {/* Building count badge */}
      <View
        style={[styles.countBadge, { bottom: selectedBuilding ? 330 : insets.bottom + 100 }]}
        pointerEvents="none"
      >
        <Text style={styles.countText}>{filtered.length} buildings</Text>
      </View>

      {/* Building detail sheet */}
      {selectedBuilding && (
        <Animated.View
          style={[
            styles.sheet,
            { transform: [{ translateY: slideAnim }], paddingBottom: insets.bottom + 12 },
          ]}
        >
          <View style={styles.sheetHandle} />
          <View style={styles.sheetBody}>
            <View style={styles.sheetTitleRow}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={styles.buildingName}>{selectedBuilding.name}</Text>
                <View style={styles.badges}>
                  <View style={styles.codeBadge}>
                    <Text style={styles.codeText}>{selectedBuilding.code}</Text>
                  </View>
                  <View style={[styles.typeBadge, {
                    backgroundColor: config.color + '22',
                    borderColor: config.color + '44',
                  }]}>
                    <Text style={[styles.typeText, {
                      color: config.color === '#F5C518' ? '#b8930a' : config.color,
                    }]}>
                      {selectedBuilding.type}
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity onPress={closeSheet} style={styles.closeBtn}>
                <Ionicons name="close" size={18} color="#666" />
              </TouchableOpacity>
            </View>
            <Text style={styles.buildingDesc}>{selectedBuilding.description}</Text>
            <View style={styles.moreInfo}>
              <Ionicons name="time-outline" size={14} color="#ccc" />
              <Text style={styles.moreInfoText}>More details coming soon</Text>
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },

  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 10,
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1a1a1a',
  },
  heatBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  heatBtnActive: {
    backgroundColor: '#F5C518',
    shadowColor: '#F5C518',
    shadowOpacity: 0.4,
  },

  filtersScroll: { marginTop: 10 },
  filtersContent: { paddingHorizontal: 16, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
  },

  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  legendLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#888',
  },
  legendBar: {
    flexDirection: 'row',
    borderRadius: 4,
    overflow: 'hidden',
    height: 10,
    width: 60,
  },
  legendSegment: {
    flex: 1,
  },
  legendSub: {
    fontSize: 11,
    color: '#aaa',
  },

  countBadge: {
    position: 'absolute',
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  countText: { fontSize: 12, fontWeight: '700', color: '#555' },

  sheet: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 16,
  },
  sheetHandle: {
    width: 38, height: 4, borderRadius: 2,
    backgroundColor: '#e0e0e0',
    alignSelf: 'center',
    marginTop: 12, marginBottom: 2,
  },
  sheetBody: { paddingHorizontal: 20, paddingTop: 16 },
  sheetTitleRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  buildingName: {
    fontSize: 20, fontWeight: '800', color: '#1a1a1a',
    marginBottom: 8, letterSpacing: -0.3,
  },
  badges: { flexDirection: 'row', gap: 6 },
  codeBadge: {
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 6, backgroundColor: '#f2f2f2',
  },
  codeText: { fontSize: 12, fontWeight: '700', color: '#666' },
  typeBadge: {
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 6, borderWidth: 1,
  },
  typeText: { fontSize: 12, fontWeight: '700' },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#f4f4f4',
    alignItems: 'center', justifyContent: 'center',
  },
  buildingDesc: { fontSize: 14, color: '#666', lineHeight: 21, marginBottom: 16 },
  moreInfo: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingTop: 14, borderTopWidth: 1, borderTopColor: '#f2f2f2', marginBottom: 4,
  },
  moreInfoText: { fontSize: 12, color: '#bbb', fontWeight: '500' },
});
