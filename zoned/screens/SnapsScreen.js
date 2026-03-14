import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  useWindowDimensions,
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
  const { height: windowHeight } = useWindowDimensions();
  const headerHeight = 88; // Approx height (including safe area padding)

  const renderSnap = ({ item }) => (
    <View style={[styles.snapPage, { height: windowHeight - headerHeight }]}>  
      <Image source={{ uri: item.image }} style={styles.snapImage} />
      <View style={styles.snapOverlay}>
        <View style={styles.snapStats}>
          <Ionicons name="heart" size={18} color="#fff" />
          <Text style={styles.snapStatText}>{item.likes}</Text>
          <Ionicons name="chatbubble" size={18} color="#fff" />
          <Text style={styles.snapStatText}>{item.comments}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      <View style={[styles.header, isDesktop && styles.headerDesktop]}>
        <Text style={styles.title}>Snaps</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('Post')}>
          <Ionicons name="add" size={24} color="#1a1a1a" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={SNAPS}
        keyExtractor={(item) => item.id}
        renderItem={renderSnap}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        decelerationRate="fast"
        snapToAlignment="start"
        contentContainerStyle={styles.flatListContent}
      />
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
  flatListContent: {
    paddingTop: 20,
    paddingBottom: 32,
  },
  snapPage: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: 'rgba(0,0,0,0.45)',
    padding: 16,
  },
  snapStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  snapStatText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
    marginRight: 16,
  },
  headerDesktop: {
    paddingHorizontal: 40,
  },
});