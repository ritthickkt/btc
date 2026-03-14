import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabase/config';

const YELLOW = '#F5C518';

export default function PostScreen({ navigation, route }) {
  const [caption, setCaption] = useState('');
  const [sending, setSending] = useState(false);
  const photoUri = route.params?.photoUri;

  const handleSend = async () => {
    if (!photoUri) {
      Alert.alert('No photo', 'Go back and take a photo first');
      return;
    }

    setSending(true);
    try {
      // 1. Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');

      const zid = user.email.split('@')[0];
      const fileName = `${user.id}/${Date.now()}.jpg`;

      // 2. Upload photo to storage
      const formData = new FormData();
      formData.append('file', { uri: photoUri, name: fileName, type: 'image/jpeg' });

      const { error: uploadError } = await supabase.storage
        .from('snaps')
        .upload(fileName, formData);

      if (uploadError) throw uploadError;

      // 3. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('snaps')
        .getPublicUrl(fileName);

      // 4. Insert snap record
      const { error: insertError } = await supabase.from('snaps').insert({
        user_id: user.id,
        zid,
        image_url: publicUrl,
        caption: caption.trim(),
      });

      if (insertError) throw insertError;

      navigation.goBack();
    } catch (err) {
      Alert.alert('Failed to send', err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {photoUri && (
        <Image
          source={{ uri: photoUri }}
          style={styles.photoBackground}
          resizeMode="cover"
        />
      )}
      <SafeAreaView style={styles.overlay} edges={['top', 'bottom']}>
        {/* Close button */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.goBack()}
            disabled={sending}
          >
            <Ionicons name="close" size={26} color="white" />
          </TouchableOpacity>
        </View>

        {/* Caption + send */}
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.bottomBar}>
            <TextInput
              style={styles.captionInput}
              placeholder="Add a caption..."
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={caption}
              onChangeText={setCaption}
              maxLength={200}
              multiline
              editable={!sending}
            />
            <TouchableOpacity
              style={[styles.sendButton, sending && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#1a1a1a" />
              ) : (
                <>
                  <Text style={styles.sendText}>Send</Text>
                  <Ionicons name="send" size={18} color="#1a1a1a" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  photoBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBar: {
    padding: 16,
    gap: 12,
  },
  captionInput: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: 'white',
    minHeight: 52,
  },
  sendButton: {
    backgroundColor: YELLOW,
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    alignSelf: 'flex-end',
    minWidth: 110,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
});
