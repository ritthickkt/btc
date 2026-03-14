import { StyleSheet, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function MapScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.body}>
        <Ionicons name="map-outline" size={56} color="#ddd" />
        <Text style={styles.title}>Map not available on web</Text>
        <Text style={styles.sub}>Open the app on iOS or Android to explore the UNSW campus map.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 12 },
  title: { fontSize: 17, fontWeight: '700', color: '#333', textAlign: 'center' },
  sub: { fontSize: 14, color: '#aaa', textAlign: 'center', lineHeight: 20 },
});