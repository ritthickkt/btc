import { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useIsDesktop } from '../hooks/useIsDesktop';

const YELLOW = '#F5C518';

const SNAPS = [
  { id: '1', image: 'https://via.placeholder.com/150', likes: 12, comments: 3 },
  { id: '2', image: 'https://via.placeholder.com/150', likes: 8, comments: 1 },
  { id: '3', image: 'https://via.placeholder.com/150', likes: 15, comments: 5 },
  { id: '4', image: 'https://via.placeholder.com/150', likes: 7, comments: 2 },
];

export default function SnapsScreen({ navigation }) {
  const isDesktop = useIsDesktop();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      <View style={[styles.header, isDesktop && styles.headerDesktop]}>
        <Text style={styles.title}>Snaps</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('Post')}>
          <Ionicons name="add" size={24} color="#1a1a1a" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={isDesktop ? styles.inner : null}>
        <Text style={styles.sectionTitle}>Recent Snaps</Text>
        <View style={[styles.snapsGrid, isDesktop && styles.snapsGridDesktop]}>
          {SNAPS.map((snap) => (
            <TouchableOpacity key={snap.id} style={[styles.snapCard, isDesktop && styles.snapCardDesktop]} activeOpacity={0.8}>
              <Image source={{ uri: snap.image }} style={styles.snapImage} />
              <View style={styles.snapOverlay}>
                <View style={styles.snapStats}>
                  <Ionicons name="heart" size={16} color="#fff" />
                  <Text style={styles.snapStatText}>{snap.likes}</Text>
                  <Ionicons name="chatbubble" size={16} color="#fff" />
                  <Text style={styles.snapStatText}>{snap.comments}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: YELLOW,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  snapsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  snapCard: {
    width: '48%',
    aspectRatio: 1,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  snapImage: {
    width: '100%',
    height: '100%',
  },
  snapOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
  },
  snapStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  snapStatText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 4,
    marginRight: 12,
  },
  snapCardDesktop: {
    width: '23%',
    aspectRatio: 1,
    marginHorizontal: '1%',
  },
  snapsGridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  headerDesktop: {
    paddingHorizontal: 40,
  },
  inner: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
});