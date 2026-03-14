import { useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, KeyboardAvoidingView,
  Platform, Keyboard, TouchableWithoutFeedback, Modal, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabase/config';
import { UNSW_LOCATIONS } from '../constants/buildings';

const YELLOW = '#F5C518';

export default function PostStudyScreen({ navigation }) {
  const [course, setCourse] = useState('');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
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
      zid,
      course: course.trim().toUpperCase(),
      topic: topic.trim(),
      description: description.trim(),
      location,
    });

    setPosting(false);

    if (!error) {
      navigation.goBack();
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <SafeAreaView style={styles.safe} edges={['top']}>
          <StatusBar style="dark" />

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="close" size={22} color="#1a1a1a" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>New Post</Text>
            <TouchableOpacity
              style={[styles.postBtn, posting && { opacity: 0.6 }]}
              onPress={handlePost}
              disabled={posting}
              activeOpacity={0.85}
            >
              {posting
                ? <ActivityIndicator size="small" color="#1a1a1a" />
                : <Text style={styles.postBtnText}>Post</Text>
              }
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Course */}
            <Text style={styles.label}>Course Code</Text>
            <View style={[styles.inputWrap, errors.course && styles.inputError]}>
              <Ionicons name="book-outline" size={17} color="#aaa" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. COMP1511"
                placeholderTextColor="#ccc"
                value={course}
                onChangeText={(t) => { setCourse(t); setErrors(e => ({ ...e, course: null })); }}
                autoCapitalize="characters"
                autoCorrect={false}
              />
            </View>
            {errors.course && <Text style={styles.errorText}>{errors.course}</Text>}

            {/* Topic */}
            <Text style={styles.label}>Topic</Text>
            <View style={[styles.inputWrap, errors.topic && styles.inputError]}>
              <Ionicons name="create-outline" size={17} color="#aaa" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Linked Lists, Integration..."
                placeholderTextColor="#ccc"
                value={topic}
                onChangeText={(t) => { setTopic(t); setErrors(e => ({ ...e, topic: null })); }}
              />
            </View>
            {errors.topic && <Text style={styles.errorText}>{errors.topic}</Text>}

            {/* Location */}
            <Text style={styles.label}>Location</Text>
            <TouchableOpacity
              style={[styles.inputWrap, styles.locationPickerBtn, errors.location && styles.inputError]}
              onPress={() => setShowLocationPicker(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="location-outline" size={17} color="#aaa" style={styles.inputIcon} />
              <Text style={[styles.locationValue, !location && styles.locationPlaceholder]}>
                {location || 'Select a building...'}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#ccc" />
            </TouchableOpacity>
            {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}

            {/* Description */}
            <Text style={styles.label}>Description <Text style={styles.optional}>(optional)</Text></Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="What are you working on? Any details for potential buddies..."
                placeholderTextColor="#ccc"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={15} color="#aaa" />
              <Text style={styles.infoText}>
                Your post will be visible to all UNSW students on zoned.
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>

        {/* Location Picker Modal */}
        <Modal
          visible={showLocationPicker}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowLocationPicker(false)}
        >
          <SafeAreaView style={styles.pickerModal} edges={['top']}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Location</Text>
              <TouchableOpacity onPress={() => setShowLocationPicker(false)}>
                <Ionicons name="close" size={22} color="#1a1a1a" />
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
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.pickerItem, location === item && styles.pickerItemActive]}
                  onPress={() => {
                    setLocation(item);
                    setErrors(e => ({ ...e, location: null }));
                    setShowLocationPicker(false);
                    setLocationSearch('');
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="location-outline"
                    size={16}
                    color={location === item ? '#1a1a1a' : '#aaa'}
                    style={{ marginRight: 12 }}
                  />
                  <Text style={[styles.pickerItemText, location === item && styles.pickerItemTextActive]}>
                    {item}
                  </Text>
                  {location === item && <Ionicons name="checkmark" size={16} color="#1a1a1a" />}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  postBtn: {
    backgroundColor: YELLOW,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
    shadowColor: YELLOW,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  postBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
  },

  scroll: {
    padding: 24,
    paddingBottom: 48,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#555',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  optional: {
    fontWeight: '400',
    color: '#bbb',
    textTransform: 'none',
    letterSpacing: 0,
    fontSize: 12,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f6f6f6',
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 6,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: '#ffc9c9',
    backgroundColor: '#fff5f5',
  },
  inputIcon: {
    marginTop: 15,
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 15,
    color: '#1a1a1a',
  },
  textArea: {
    paddingTop: 15,
    minHeight: 100,
  },
  errorText: {
    fontSize: 12,
    color: '#e03131',
    marginBottom: 14,
    marginLeft: 4,
  },
  locationPickerBtn: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  locationValue: {
    flex: 1,
    fontSize: 15,
    color: '#1a1a1a',
  },
  locationPlaceholder: {
    color: '#ccc',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#aaa',
    lineHeight: 18,
  },

  // Location picker modal
  pickerModal: {
    flex: 1,
    backgroundColor: '#fff',
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  pickerSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 12,
    backgroundColor: '#f6f6f6',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  pickerSearchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1a1a1a',
  },
  pickerList: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  pickerItemActive: {
    backgroundColor: '#FFFBEB',
    marginHorizontal: -20,
    paddingHorizontal: 20,
    borderBottomColor: '#FFF0B0',
  },
  pickerItemText: {
    flex: 1,
    fontSize: 15,
    color: '#444',
  },
  pickerItemTextActive: {
    fontWeight: '700',
    color: '#1a1a1a',
  },
});
