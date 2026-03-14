import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useIsDesktop } from '../hooks/useIsDesktop';

const YELLOW = '#F5C518';

export default function PostScreen({ navigation }) {
  const [caption, setCaption] = useState('');
  const isDesktop = useIsDesktop();

  const handlePost = () => {
    if (!caption.trim()) {
      Alert.alert('Error', 'Please add a caption');
      return;
    }
    // Here you would upload the snap and caption
    Alert.alert('Success', 'Snap posted!', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      <View style={[styles.header, isDesktop && styles.headerDesktop]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.title}>New Snap</Text>
        <TouchableOpacity onPress={handlePost}>
          <Text style={styles.postText}>Post</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.content, isDesktop && styles.contentDesktop]}>
        <View style={isDesktop ? styles.inner : null}>
        <View style={[styles.imagePlaceholder, isDesktop && styles.imagePlaceholderDesktop]}>
          <Ionicons name="camera" size={isDesktop ? 64 : 48} color="#ccc" />
          <Text style={styles.placeholderText}>Tap to add photo</Text>
        </View>

        <View style={styles.captionSection}>
          <Text style={styles.label}>Caption</Text>
          <TextInput
            style={[styles.captionInput, isDesktop && styles.captionInputDesktop]}
            placeholder="What's happening?"
            value={caption}
            onChangeText={setCaption}
            multiline
            maxLength={200}
          />
          <Text style={styles.charCount}>{caption.length}/200</Text>
        </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  postText: {
    fontSize: 16,
    fontWeight: '600',
    color: YELLOW,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  imagePlaceholder: {
    height: 200,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 16,
    color: '#999',
  },
  captionSection: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  captionInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  headerDesktop: {
    paddingHorizontal: 40,
  },
  contentDesktop: {
    alignItems: 'center',
  },
  inner: {
    maxWidth: 600,
    width: '100%',
  },
  imagePlaceholderDesktop: {
    height: 300,
  },
  captionInputDesktop: {
    maxWidth: 600,
  },
});