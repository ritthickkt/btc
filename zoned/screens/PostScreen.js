import { useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, Modal, FlatList,
  KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabase/config';
import { UNSW_LOCATIONS } from '../constants/buildings';

const YELLOW = '#F5C518';

export default function PostScreen({ navigation }) {
  const [name, setName] = useState('');
  const [course, setCourse] = useState('');
  const [topic, setTopic] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [posting, setPosting] = useState(false);
  const [errors, setErrors] = useState({});

  const filteredLocations = UNSW_LOCATIONS.filter(l =>
    l.toLowerCase().includes(locationSearch.toLowerCase())
  );

  const validate = () => {
    const e = {};
    if (!course.trim()) e.course = 'Course code is required';
    if (!topic.trim()) e.topic = 'Topic is required';
    if (!location) e.location = 'Please select a location';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePost = async () => {
    Keyboard.dismiss();
    if (!validate()) return;
    setPosting(true);
    const { data: { user } } = await supabase.auth.getUser();
    const zid = user.email.split('@')[0];
    const { error } = await supabase.from('study_posts').insert({
      user_id: user.id,
      zid: name.trim() || zid,
      course: course.trim().toUpperCase(),
      topic: topic.trim(),
      description: description.trim(),
      location,
    });
    setPosting(false);
    if (!error) {
      setName(''); setCourse(''); setTopic(''); setDescription(''); setLocation('');
      navigation.navigate('Buddies');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <SafeAreaView style={styles.safe} edges={['top']}>
          <StatusBar style="dark" />

          {/* Modal overlay style header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Post Study Status</Text>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#111" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

            <TextInput
              style={[styles.input, errors.course && styles.inputFocused]}
              placeholder="Your name"
              placeholderTextColor="#aaa"
              value={name}
              onChangeText={setName}
            />

            <TextInput
              style={[styles.input, errors.course && styles.inputError]}
              placeholder="Course (e.g. COMP1511)"
              placeholderTextColor="#aaa"
              value={course}
              onChangeText={(t) => { setCourse(t); setErrors(e => ({ ...e, course: null })); }}
              autoCapitalize="characters"
            />
            {errors.course && <Text style={styles.errorText}>{errors.course}</Text>}

            <TextInput
              style={[styles.input, errors.topic && styles.inputError]}
              placeholder="Topic"
              placeholderTextColor="#aaa"
              value={topic}
              onChangeText={(t) => { setTopic(t); setErrors(e => ({ ...e, topic: null })); }}
            />
            {errors.topic && <Text style={styles.errorText}>{errors.topic}</Text>}

            <TouchableOpacity
              style={[styles.input, styles.dropdownInput, errors.location && styles.inputError]}
              onPress={() => setShowLocationPicker(true)}
              activeOpacity={0.7}
            >
              <Text style={[styles.dropdownText, !location && { color: '#aaa' }]}>
                {location || 'Location'}
              </Text>
              <Ionicons name="chevron-down" size={18} color="#aaa" />
            </TouchableOpacity>
            {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}

            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top', paddingTop: 16 }]}
              placeholder="What are you working on?"
              placeholderTextColor="#aaa"
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <Text style={styles.photoLabel}>Add a photo (optional)</Text>
            <View style={styles.photoRow}>
              <TouchableOpacity style={styles.photoBtn} activeOpacity={0.7}>
                <Ionicons name="camera-outline" size={18} color="#111" />
                <Text style={styles.photoBtnText}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.photoBtn} activeOpacity={0.7}>
                <Ionicons name="image-outline" size={18} color="#111" />
                <Text style={styles.photoBtnText}>Upload</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.postBtn, posting && { opacity: 0.6 }]}
              onPress={handlePost}
              disabled={posting}
              activeOpacity={0.85}
            >
              {posting
                ? <ActivityIndicator color="#111" />
                : <Text style={styles.postBtnText}>Post Status</Text>
              }
            </TouchableOpacity>

          </ScrollView>
        </SafeAreaView>

        {/* Location Picker Modal */}
        <Modal visible={showLocationPicker} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowLocationPicker(false)}>
          <SafeAreaView style={styles.pickerModal} edges={['top']}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Location</Text>
              <TouchableOpacity onPress={() => setShowLocationPicker(false)}>
                <Ionicons name="close" size={22} color="#111" />
              </TouchableOpacity>
            </View>
            <View style={styles.pickerSearch}>
              <Ionicons name="search-outline" size={16} color="#aaa" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.pickerSearchInput}
                placeholder="Search buildings..."
                placeholderTextColor="#bbb"
                value={locationSearch}
                onChangeText={setLocationSearch}
              />
            </View>
            <FlatList
              data={filteredLocations}
              keyExtractor={item => item}
              contentContainerStyle={styles.pickerList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.pickerItem, location === item && styles.pickerItemActive]}
                  onPress={() => { setLocation(item); setErrors(e => ({ ...e, location: null })); setShowLocationPicker(false); setLocationSearch(''); }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="location-outline" size={16} color={location === item ? '#111' : '#aaa'} style={{ marginRight: 12 }} />
                  <Text style={[styles.pickerItemText, location === item && styles.pickerItemTextActive]}>{item}</Text>
                  {location === item && <Ionicons name="checkmark" size={16} color="#111" />}
                </TouchableOpacity>
              )}
            />
          </SafeAreaView>
        </Modal>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111' },
  closeBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#f5f5f5',
    alignItems: 'center', justifyContent: 'center',
  },
  scroll: { padding: 20, paddingBottom: 40 },
  input: {
    backgroundColor: '#f2f2f2',
    borderRadius: 14,
    paddingHorizontal: 18, paddingVertical: 16,
    fontSize: 15, color: '#111',
    marginBottom: 12,
    borderWidth: 1.5, borderColor: 'transparent',
  },
  inputFocused: { borderColor: YELLOW },
  inputError: { borderColor: '#ffc9c9', backgroundColor: '#fff5f5' },
  dropdownInput: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dropdownText: { fontSize: 15, color: '#111', flex: 1 },
  errorText: { fontSize: 12, color: '#e03131', marginBottom: 8, marginLeft: 4 },
  photoLabel: { fontSize: 15, fontWeight: '700', color: '#111', marginBottom: 12, marginTop: 4 },
  photoRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  photoBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderWidth: 1.5, borderColor: '#e0e0e0',
    borderRadius: 14, paddingVertical: 14,
    backgroundColor: '#fff',
  },
  photoBtnText: { fontSize: 14, fontWeight: '600', color: '#111' },
  postBtn: {
    backgroundColor: YELLOW, borderRadius: 14,
    paddingVertical: 18, alignItems: 'center',
  },
  postBtnText: { fontSize: 16, fontWeight: '700', color: '#111' },
  pickerModal: { flex: 1, backgroundColor: '#fff' },
  pickerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f2f2f2' },
  pickerTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  pickerSearch: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginVertical: 12, backgroundColor: '#f6f6f6', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
  pickerSearchInput: { flex: 1, fontSize: 15, color: '#111' },
  pickerList: { paddingHorizontal: 20, paddingBottom: 40 },
  pickerItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  pickerItemActive: { backgroundColor: '#FFFBEB', marginHorizontal: -20, paddingHorizontal: 20 },
  pickerItemText: { flex: 1, fontSize: 15, color: '#444' },
  pickerItemTextActive: { fontWeight: '700', color: '#111' },
});