import { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const YELLOW = '#F5C518';

const STUDY_BUDDIES = [
  {
    id: '1',
    name: 'Alex Johnson',
    course: 'COMP1511',
    location: 'Main Library',
    headline: 'Linked Lists',
    details: 'Working on lab05, need help with pointer stuff',
    timeAgo: '2h ago',
  },
  {
    id: '2',
    name: 'Priya Mehta',
    course: 'MATH1131',
    location: 'Ainsworth Building',
    headline: 'Integration',
    details: 'Studying for finals, happy to work through practice problems together',
    timeAgo: '3h ago',
  },
  {
    id: '3',
    name: 'Tom Wilson',
    course: 'COMP2521',
    location: 'Red Centre',
    headline: 'Graph Algorithms',
    details: "Assignment 2 - Dijkstra's algorithm implementation",
    timeAgo: '3h ago',
  },
  {
    id: '4',
    name: 'Nina Kim',
    course: 'DESN1000',
    location: 'Law Library',
    headline: 'UX Principles',
    details: 'Looking for group to critique UX case studies',
    timeAgo: '4h ago',
  },
];

function getAvatarColor(name) {
  const colors = ['#FFD43B', '#74C0FC', '#8CE99A', '#FFA8A8', '#E599F7', '#FFC078', '#63E6BE', '#A9E34B'];
  return colors[name.charCodeAt(0) % colors.length];
}

export default function StudyScreen({ navigation }) {
  const [tab, setTab] = useState('Browse');
  const [query, setQuery] = useState('');
  const [showPostModal, setShowPostModal] = useState(false);

  const [postName, setPostName] = useState('');
  const [postCourse, setPostCourse] = useState('');
  const [postTopic, setPostTopic] = useState('');
  const [postLocation, setPostLocation] = useState('Main Library');
  const [postDetails, setPostDetails] = useState('');
  const [postPhoto, setPostPhoto] = useState(null);

  const [buddies, setBuddies] = useState(STUDY_BUDDIES);
  const [requests, setRequests] = useState([
    {
      id: 'r1',
      name: 'Liam Nguyen',
      course: 'COMP1521',
      location: 'Main Library',
      message: '"Hey! Can we study together for the midterm?"',
      timeAgo: '33m ago',
    },
    {
      id: 'r2',
      name: 'Emily Zhang',
      course: 'MATH1231',
      location: 'Red Centre',
      message: '"I saw your post — I\'m working on the same topic!"',
      timeAgo: '1h ago',
    },
    {
      id: 'r3',
      name: 'Oscar Patel',
      course: 'COMP2521',
      location: 'Ainsworth Building',
      message: '"Want to pair up for the assignment?"',
      timeAgo: '1h ago',
    },
    {
      id: 'r4',
      name: 'Chloe Martin',
      course: 'FINS1613',
      location: 'ASB (Australian School of Business)',
      message: '"Looking for a study partner, are you free?"',
      timeAgo: '2h ago',
    },
  ]);

  const filteredBuddies = useMemo(() => {
    if (!query.trim()) return buddies;
    const lower = query.toLowerCase();
    return buddies.filter((buddy) =>
      buddy.name.toLowerCase().includes(lower) ||
      buddy.course.toLowerCase().includes(lower) ||
      buddy.headline.toLowerCase().includes(lower)
    );
  }, [query, buddies]);

  const handleAccept = (id) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const handleDecline = (id) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const canPost = Boolean(postName.trim() && postCourse.trim() && postTopic.trim());

  const requestImagePermission = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      return status === 'granted';
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestImagePermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.75,
    });

    if (!result.canceled) {
      setPostPhoto(result.assets?.[0]?.uri || null);
    }
  };

  const takePhoto = async () => {
    const hasPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (!hasPermission.granted) return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.75,
    });

    if (!result.canceled) {
      setPostPhoto(result.assets?.[0]?.uri || null);
    }
  };

  const closePostModal = () => {
    setShowPostModal(false);
    setPostName('');
    setPostCourse('');
    setPostTopic('');
    setPostLocation('Main Library');
    setPostDetails('');
    setPostPhoto(null);
  };

  const handlePostStatus = () => {
    if (!canPost) {
      // Minimal validation
      return;
    }

    const newBuddy = {
      id: `${Date.now()}`,
      name: postName.trim(),
      course: postCourse.trim(),
      location: postLocation.trim() || 'Main Library',
      headline: postTopic.trim(),
      details: postDetails.trim() || 'Looking for someone to study with!',
      timeAgo: 'Just now',
      isMine: true,
      photoUri: postPhoto,
    };

    setBuddies((prev) => [newBuddy, ...prev]);
    setQuery('');
    closePostModal();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Text style={styles.screenTitle}>Study Buddies</Text>
        <TouchableOpacity style={styles.postBtn} onPress={() => setShowPostModal(true)}>
          <Ionicons name="add" size={18} color="#1a1a1a" />
          <Text style={styles.postBtnText}>Post</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showPostModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Post Study Status</Text>
              <TouchableOpacity onPress={closePostModal}>
                <Ionicons name="close" size={20} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <TextInput
                style={styles.input}
                placeholder="Your name"
                value={postName}
                onChangeText={setPostName}
              />
              <TextInput
                style={styles.input}
                placeholder="Course (e.g. COMP1511)"
                value={postCourse}
                onChangeText={setPostCourse}
              />
              <TextInput
                style={styles.input}
                placeholder="Topic"
                value={postTopic}
                onChangeText={setPostTopic}
              />
              <TextInput
                style={styles.input}
                placeholder="Location"
                value={postLocation}
                onChangeText={setPostLocation}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="What are you working on?"
                value={postDetails}
                onChangeText={setPostDetails}
                multiline
                numberOfLines={4}
              />

              <Text style={styles.sectionLabel}>Add a photo (optional)</Text>
              {postPhoto ? (
                <View style={styles.photoPreviewWrapper}>
                  <Image source={{ uri: postPhoto }} style={styles.photoPreview} />
                  <TouchableOpacity style={styles.photoRemove} onPress={() => setPostPhoto(null)}>
                    <Ionicons name="close" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.photoRow}>
                  <TouchableOpacity style={styles.photoBtn} onPress={takePhoto}>
                    <Ionicons name="camera" size={18} color="#1a1a1a" />
                    <Text style={styles.photoBtnText}>Take Photo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.photoBtn} onPress={pickImage}>
                    <Ionicons name="image" size={18} color="#1a1a1a" />
                    <Text style={styles.photoBtnText}>Upload</Text>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                style={[styles.postStatusBtn, !canPost && styles.postStatusBtnDisabled]}
                onPress={handlePostStatus}
                disabled={!canPost}
              >
                <Text style={styles.postStatusText}>Post Status</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, tab === 'Browse' && styles.tabActive]}
          onPress={() => setTab('Browse')}
        >
          <Text style={[styles.tabText, tab === 'Browse' && styles.tabTextActive]}>Browse</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, tab === 'Requests' && styles.tabActive]}
          onPress={() => setTab('Requests')}
        >
          <Text style={[styles.tabText, tab === 'Requests' && styles.tabTextActive]}>Requests</Text>
          <View style={styles.requestBadge}>
            <Text style={styles.requestBadgeText}>{requests.length}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {tab === 'Browse' ? (
        <>
          <View style={styles.searchBarWrapper}>
            <Ionicons name="search" size={18} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by course, topic, or name..."
              placeholderTextColor="#999"
              value={query}
              onChangeText={setQuery}
            />
            <TouchableOpacity style={styles.filterBtn}>
              <Ionicons name="funnel" size={18} color="#1a1a1a" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {filteredBuddies.map((buddy) => (
              <View key={buddy.id} style={[styles.card, buddy.isMine && styles.cardMine]}>
                <View style={styles.cardHeader}>
                  <View style={[styles.avatar, { backgroundColor: getAvatarColor(buddy.name) }]}>

                    <Text style={styles.avatarText}>{buddy.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}</Text>
                  </View>
                  <View style={styles.cardInfo}>
                    <View style={styles.cardTitleRow}>
                      <Text style={styles.cardName}>{buddy.name}</Text>
                    <View style={styles.cardTitleRight}>
                      {buddy.isMine && (
                        <View style={styles.youBadge}>
                          <Text style={styles.youBadgeText}>Your post</Text>
                        </View>
                      )}
                      <Text style={styles.cardTime}>{buddy.timeAgo}</Text>
                    </View>
                    </View>
                    <View style={styles.badgesRow}>
                      <View style={styles.badge}>
                        <Ionicons name="book" size={12} color="#555" />
                        <Text style={styles.badgeText}>{buddy.course}</Text>
                      </View>
                      <View style={styles.badgeSecondary}>
                        <Ionicons name="location-outline" size={12} color="#555" />
                        <Text style={styles.badgeText}>{buddy.location}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {buddy.photoUri ? (
                  <Image source={{ uri: buddy.photoUri }} style={styles.postImage} />
                ) : null}

                <Text style={styles.postTitle}>{buddy.headline}</Text>
                <Text style={styles.postBody}>{buddy.details}</Text>

                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.requestBtn}>
                    <Ionicons name="person-add" size={16} color="#1a1a1a" />
                    <Text style={styles.requestText}>Send Request</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.messageBtn}>
                    <Ionicons name="paper-plane" size={16} color="#555" />
                    <Text style={styles.messageText}>Message</Text>
                  </TouchableOpacity>
                </View>

                {buddy.isMine ? (
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => setBuddies((prev) => prev.filter((b) => b.id !== buddy.id))}
                  >
                    <Ionicons name="trash" size={18} color="#d32f2f" />
                    <Text style={styles.deleteText}>Remove</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ))}
          </ScrollView>
        </>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {requests.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Nothing here yet</Text>
              <Text style={styles.emptySubtitle}>Your incoming requests will show up here.</Text>
            </View>
          ) : (
            requests.map((request) => (
              <View key={request.id} style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <View style={[styles.avatar, { backgroundColor: getAvatarColor(request.name) }]}>
                    <Text style={styles.avatarText}>{request.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}</Text>
                  </View>
                  <View style={styles.requestInfo}>
                    <Text style={styles.requestName}>{request.name}</Text>
                    <View style={styles.requestMeta}>
                      <Text style={styles.requestCourse}>{request.course}</Text>
                      <Text style={styles.requestLocation}>{request.location}</Text>
                    </View>
                  </View>
                  <Text style={styles.requestTime}>{request.timeAgo}</Text>
                </View>
                <Text style={styles.requestMessage}>{request.message}</Text>
                <View style={styles.requestActions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.acceptBtn]}
                    onPress={() => handleAccept(request.id)}
                  >
                    <Text style={styles.actionText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.declineBtn]}
                    onPress={() => handleDecline(request.id)}
                  >
                    <Text style={[styles.actionText, styles.declineText]}>Decline</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
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
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  postBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: YELLOW,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  postBtnText: {
    marginLeft: 8,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    marginRight: 12,
  },
  tabActive: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e6e6e6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: '#1a1a1a',
  },
  requestBadge: {
    marginLeft: 8,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ff6b6b',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  requestBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
    margin: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#1a1a1a',
  },
  filterBtn: {
    marginLeft: 10,
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  scroll: {
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardMine: {
    borderColor: YELLOW,
    borderWidth: 1,
    borderRadius: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#1a1a1a',
    fontWeight: '700',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  cardTime: {
    fontSize: 12,
    color: '#999',
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 8,
  },
  badgeSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  badgeText: {
    fontSize: 12,
    color: '#555',
    marginLeft: 4,
  },
  cardTitleRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  youBadge: {
    backgroundColor: '#ffe6a1',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  youBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8a6d00',
  },
  postImage: {
    width: '100%',
    height: 160,
    borderRadius: 14,
    marginBottom: 12,
  },
  postTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  postBody: {
    fontSize: 14,
    color: '#666',
    marginBottom: 14,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  requestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: YELLOW,
    borderRadius: 14,
  },
  requestText: {
    marginLeft: 8,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  messageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 14,
  },
  messageText: {
    marginLeft: 8,
    fontWeight: '700',
    color: '#555',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 14,
    padding: 12,
    fontSize: 14,
    marginBottom: 12,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  sectionLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    marginTop: 6,
  },
  photoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  photoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#f5f5f5',
    marginRight: 10,
  },
  photoBtnText: {
    marginLeft: 8,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  postStatusBtn: {
    backgroundColor: YELLOW,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 24,
  },
  postStatusBtnDisabled: {
    backgroundColor: '#f1f1f1',
  },
  postStatusText: {
    fontWeight: '800',
    color: '#1a1a1a',
    fontSize: 15,
  },
  photoPreviewWrapper: {
    position: 'relative',
    marginBottom: 14,
  },
  photoPreview: {
    width: '100%',
    height: 160,
    borderRadius: 14,
  },
  photoRemove: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#f1f1f1',
    backgroundColor: '#fff',
  },
  deleteText: {
    marginLeft: 8,
    fontWeight: '700',
    color: '#d32f2f',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    maxWidth: 260,
  },
  requestCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  requestInfo: {
    flex: 1,
    marginLeft: 12,
  },
  requestName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  requestMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  requestCourse: {
    fontSize: 12,
    color: '#555',
    marginRight: 12,
  },
  requestLocation: {
    fontSize: 12,
    color: '#555',
  },
  requestTime: {
    fontSize: 12,
    color: '#999',
  },
  requestMessage: {
    fontSize: 14,
    color: '#555',
    marginBottom: 14,
  },
  requestActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  acceptBtn: {
    backgroundColor: '#4ade80',
  },
  declineBtn: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  actionText: {
    fontWeight: '700',
    color: '#1a1a1a',
  },
  declineText: {
    color: '#555',
  },
});
