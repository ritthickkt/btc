import { useState } from 'react';
import {
  StyleSheet, Text, View, FlatList, TouchableOpacity, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

const YELLOW = '#F5C518';
const { width } = Dimensions.get('window');
const CARD_W = Math.min(width - 40, 420);

// Mock data until snaps table is created
const MOCK_SNAPS = [
  { id: '1', zid: 'alex_j', caption: 'sunset from the quad 🌅', location: 'Quad Lawn', likes: 42, comments: 0, color: '#2d2d2d' },
  { id: '2', zid: 'priya_m', caption: 'library grind szn 📚', location: 'Main Library', likes: 18, comments: 3, color: '#1a3a4a' },
  { id: '3', zid: 'tom_w', caption: 'free bbq outside roundhouse!!!', location: 'Roundhouse', likes: 91, comments: 12, color: '#3a2a1a' },
  { id: '4', zid: 'sarah_k', caption: 'comp1511 exam szn rip 💀', location: 'Red Centre', likes: 55, comments: 7, color: '#1a2a1a' },
];

function SnapCard({ snap, onLike, liked }) {
  return (
    <View style={[styles.snapCard, { backgroundColor: snap.color }]}>
      <View style={styles.snapOverlay} />
      <View style={styles.snapMeta}>
        <View style={styles.snapLeft}>
          <Text style={styles.snapUser}>@{snap.zid}</Text>
          <Text style={styles.snapCaption}>{snap.caption}</Text>
          {snap.location && (
            <View style={styles.snapLocationBadge}>
              <Ionicons name="location" size={12} color="#fff" />
              <Text style={styles.snapLocationText}>{snap.location}</Text>
            </View>
          )}
        </View>
        <View style={styles.snapActions}>
          <TouchableOpacity onPress={() => onLike(snap.id)} style={styles.snapActionBtn}>
            <Ionicons name={liked ? 'heart' : 'heart-outline'} size={26} color={liked ? '#ff6b6b' : '#fff'} />
            <Text style={styles.snapActionCount}>{snap.likes + (liked ? 1 : 0)}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.snapActionBtn}>
            <Ionicons name="chatbubble-outline" size={24} color="#fff" />
            <Text style={styles.snapActionCount}>{snap.comments}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function SnapsScreen() {
  const [likedIds, setLikedIds] = useState(new Set());

  const handleLike = (id) => {
    setLikedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      <FlatList
        data={MOCK_SNAPS}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <SnapCard snap={item} onLike={handleLike} liked={likedIds.has(item.id)} />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  list: { paddingVertical: 12, alignItems: 'center', gap: 12, paddingBottom: 32 },
  snapCard: {
    width: CARD_W, aspectRatio: 9 / 16,
    borderRadius: 20, overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  snapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  snapMeta: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  snapLeft: { flex: 1, marginRight: 16 },
  snapUser: { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 4 },
  snapCaption: { fontSize: 14, color: 'rgba(255,255,255,0.9)', lineHeight: 19, marginBottom: 8 },
  snapLocationBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  snapLocationText: { fontSize: 12, color: '#fff', fontWeight: '500' },
  snapActions: { alignItems: 'center', gap: 16 },
  snapActionBtn: { alignItems: 'center', gap: 4 },
  snapActionCount: { fontSize: 13, color: '#fff', fontWeight: '600' },
});