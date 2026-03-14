import { useRef, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  FlatList,
  Image,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '../supabase/config';

const YELLOW = '#F5C518';

// ─── Camera item (index 0) ────────────────────────────────────────────────────
function CameraItem({ isActive, navigation, itemHeight }) {
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      navigation.navigate('Post', { photoUri: photo.uri });
    }
  };

  if (!permission) return <View style={[styles.cameraContainer, { height: itemHeight }]} />;

  if (!permission.granted) {
    return (
      <View style={[styles.permissionContainer, { height: itemHeight }]}>
        <Ionicons name="camera" size={64} color={YELLOW} />
        <Text style={styles.permissionTitle}>Camera Access Needed</Text>
        <Text style={styles.permissionSubtext}>Allow camera access to take snaps</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Allow Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.cameraContainer, { height: itemHeight }]}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        isActive={isActive}
      >
        <SafeAreaView style={styles.cameraOverlay} edges={['top', 'bottom']}>
          {/* Top: flip button */}
          <View style={styles.topControls}>
            <View style={styles.topSpacer} />
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setFacing(f => (f === 'back' ? 'front' : 'back'))}
            >
              <Ionicons name="camera-reverse" size={26} color="white" />
            </TouchableOpacity>
          </View>

          {/* Bottom: shutter + swipe hint */}
          <View style={styles.bottomSection}>
            <View style={styles.bottomControls}>
              <View style={styles.bottomSpacer} />
              <TouchableOpacity style={styles.shutterButton} onPress={takePicture}>
                <View style={styles.shutterInner} />
              </TouchableOpacity>
              <View style={styles.bottomSpacer} />
            </View>
            <View style={styles.swipeHint}>
              <Ionicons name="chevron-up" size={20} color="rgba(255,255,255,0.6)" />
              <Text style={styles.swipeHintText}>Swipe up for snaps</Text>
            </View>
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  );
}

// ─── Individual snap item ─────────────────────────────────────────────────────
function SnapItem({ snap, itemHeight }) {
  return (
    <View style={[styles.snapContainer, { height: itemHeight }]}>
      <Image source={{ uri: snap.image_url }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      <View style={styles.snapOverlay}>
        <Text style={styles.snapZid}>{snap.zid}</Text>
        {snap.caption ? <Text style={styles.snapCaption}>{snap.caption}</Text> : null}
      </View>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function SnapsScreen({ navigation }) {
  const { height: windowHeight } = useWindowDimensions();
  const [containerHeight, setContainerHeight] = useState(windowHeight);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [snaps, setSnaps] = useState([]);
  const [loading, setLoading] = useState(true);

  const listData = [{ id: 'camera' }, ...snaps];

  useFocusEffect(
    useCallback(() => {
      fetchSnaps();
    }, [])
  );

  const fetchSnaps = async () => {
    const { data, error } = await supabase
      .from('snaps')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) setSnaps(data);
    setLoading(false);
  };

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 });

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index ?? 0);
    }
  }, []);

  const getItemLayout = useCallback(
    (_, index) => ({ length: containerHeight, offset: containerHeight * index, index }),
    [containerHeight]
  );

  const renderItem = useCallback(
    ({ item, index }) => {
      if (item.id === 'camera') {
        return (
          <CameraItem
            isActive={currentIndex === 0}
            navigation={navigation}
            itemHeight={containerHeight}
          />
        );
      }
      return <SnapItem snap={item} itemHeight={containerHeight} />;
    },
    [currentIndex, containerHeight, navigation]
  );

  return (
    <View
      style={styles.container}
      onLayout={e => setContainerHeight(e.nativeEvent.layout.height)}
    >
      <StatusBar style="light" />
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={YELLOW} />
        </View>
      ) : (
        <FlatList
          data={listData}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          decelerationRate="fast"
          snapToAlignment="start"
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig.current}
          getItemLayout={getItemLayout}
          initialNumToRender={2}
          windowSize={3}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Camera item
  cameraContainer: {
    width: '100%',
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  topSpacer: {
    width: 44,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSection: {
    paddingBottom: 8,
  },
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingBottom: 12,
  },
  bottomSpacer: {
    width: 60,
  },
  shutterButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderWidth: 4,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  swipeHint: {
    alignItems: 'center',
    paddingBottom: 8,
  },
  swipeHintText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 2,
  },
  // Permission
  permissionContainer: {
    width: '100%',
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
    marginTop: 20,
    marginBottom: 10,
  },
  permissionSubtext: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 30,
  },
  permissionButton: {
    backgroundColor: YELLOW,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  // Snap item
  snapContainer: {
    width: '100%',
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  snapOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 32,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  snapZid: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  snapCaption: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
  },
});
