import { useState, useCallback, useRef } from 'react';
import {
  StyleSheet, Text, View, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, KeyboardAvoidingView,
  Platform, Animated, Keyboard, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../supabase/config';

const YELLOW = '#F5C518';

const AVATAR_COLORS = ['#FFD43B', '#74C0FC', '#8CE99A', '#FFA8A8', '#E599F7', '#FFC078', '#63E6BE', '#A9E34B'];
const getAvatarColor = (str) => AVATAR_COLORS[(str?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function Avatar({ zid, size = 44 }) {
  const initials = zid ? zid.slice(0, 2).toUpperCase() : '?';
  const bg = getAvatarColor(zid);
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.36 }]}>{initials}</Text>
    </View>
  );
}

function BrowseCard({ post, onSendRequest, alreadySent, isOwn }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Avatar zid={post.zid} />
        <View style={styles.cardHeaderText}>
          <View style={styles.cardNameRow}>
            <Text style={styles.cardName}>{post.zid}</Text>
            <View style={styles.timeRow}>
              <Ionicons name="time-outline" size={12} color="#aaa" />
              <Text style={styles.timeText}>{timeAgo(post.created_at)}</Text>
            </View>
          </View>
          <View style={styles.cardBadges}>
            <View style={styles.courseBadge}>
              <Ionicons name="book-outline" size={11} color="#555" />
              <Text style={styles.courseBadgeText}>{post.course}</Text>
            </View>
            <View style={styles.locationBadge}>
              <Ionicons name="location-outline" size={11} color="#555" />
              <Text style={styles.locationBadgeText}>{post.location}</Text>
            </View>
          </View>
        </View>
      </View>

      <Text style={styles.cardTopic}>{post.topic}</Text>
      {!!post.description && <Text style={styles.cardDesc}>{post.description}</Text>}

      {!isOwn && (
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.sendBtn, alreadySent && styles.sendBtnSent]}
            onPress={() => !alreadySent && onSendRequest(post)}
            activeOpacity={alreadySent ? 1 : 0.8}
          >
            <Ionicons name={alreadySent ? 'checkmark' : 'person-add'} size={14} color="#111" />
            <Text style={styles.sendBtnText}>{alreadySent ? 'Request Sent' : 'Send Request'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.messageBtn} activeOpacity={0.7}>
            <Ionicons name="paper-plane-outline" size={14} color="#888" />
            <Text style={styles.messageBtnText}>Message</Text>
          </TouchableOpacity>
        </View>
      )}
      {isOwn && <Text style={styles.ownPostText}>Your post</Text>}
    </View>
  );
}

function RequestCard({ request, onAccept, onDecline }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Avatar zid={request.requester_zid} />
        <View style={styles.cardHeaderText}>
          <View style={styles.cardNameRow}>
            <Text style={styles.cardName}>{request.requester_zid}</Text>
            <View style={styles.timeRow}>
              <Ionicons name="time-outline" size={12} color="#aaa" />
              <Text style={styles.timeText}>{timeAgo(request.created_at)}</Text>
            </View>
          </View>
          <View style={styles.cardBadges}>
            <View style={styles.courseBadge}>
              <Ionicons name="book-outline" size={11} color="#555" />
              <Text style={styles.courseBadgeText}>{request.study_posts?.course}</Text>
            </View>
            <View style={styles.locationBadge}>
              <Ionicons name="location-outline" size={11} color="#555" />
              <Text style={styles.locationBadgeText}>{request.study_posts?.location}</Text>
            </View>
          </View>
        </View>
      </View>
      {!!request.message && <Text style={styles.requestMessage}>"{request.message}"</Text>}
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.acceptBtn} onPress={() => onAccept(request)} activeOpacity={0.8}>
          <Ionicons name="checkmark-circle" size={15} color="#111" />
          <Text style={styles.acceptBtnText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.declineBtn} onPress={() => onDecline(request)} activeOpacity={0.8}>
          <Ionicons name="close-circle-outline" size={15} color="#555" />
          <Text style={styles.declineBtnText}>Decline</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function StudyBuddyScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('browse');
  const [posts, setPosts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [sentPostIds, setSentPostIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [requestTarget, setRequestTarget] = useState(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const sheetAnim = useRef(new Animated.Value(300)).current;

  const openRequestSheet = (post) => {
    setRequestTarget(post); setMessage('');
    Animated.spring(sheetAnim, { toValue: 0, useNativeDriver: true, tension: 70, friction: 12 }).start();
  };

  const closeRequestSheet = () => {
    Keyboard.dismiss();
    Animated.timing(sheetAnim, { toValue: 300, duration: 220, useNativeDriver: true }).start(() => setRequestTarget(null));
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
    const [postsRes, requestsRes, sentRes] = await Promise.all([
      supabase.from('study_posts').select('*').order('created_at', { ascending: false }),
      supabase.from('study_requests').select('*, study_posts(course, location, topic)').eq('post_owner_id', user.id).eq('status', 'pending'),
      supabase.from('study_requests').select('post_id').eq('requester_id', user.id),
    ]);
    setPosts(postsRes.data ?? []);
    setRequests(requestsRes.data ?? []);
    setSentPostIds(new Set((sentRes.data ?? []).map(r => r.post_id)));
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  const handleSendRequest = async () => {
    if (!requestTarget || !currentUser) return;
    setSending(true);
    const zid = currentUser.email.split('@')[0];
    await supabase.from('study_requests').insert({
      post_id: requestTarget.id,
      requester_id: currentUser.id,
      requester_zid: zid,
      post_owner_id: requestTarget.user_id,
      message: message.trim() || 'Hey! Can we study together?',
    });
    setSentPostIds(prev => new Set([...prev, requestTarget.id]));
    setSending(false);
    closeRequestSheet();
  };

  const handleAccept = async (request) => {
    await supabase.from('study_requests').update({ status: 'accepted' }).eq('id', request.id);
    setRequests(prev => prev.filter(r => r.id !== request.id));
  };

  const handleDecline = async (request) => {
    await supabase.from('study_requests').update({ status: 'declined' }).eq('id', request.id);
    setRequests(prev => prev.filter(r => r.id !== request.id));
  };

  const filteredPosts = posts.filter(p => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return p.course?.toLowerCase().includes(q) || p.topic?.toLowerCase().includes(q) || p.zid?.toLowerCase().includes(q) || p.location?.toLowerCase().includes(q);
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Study Buddies</Text>
        <TouchableOpacity style={styles.postBtn} onPress={() => navigation.navigate('PostStudy')} activeOpacity={0.85}>
          <Ionicons name="add" size={16} color="#111" />
          <Text style={styles.postBtnText}>Post</Text>
        </TouchableOpacity>
      </View>

      {/* Tab toggle */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'browse' && styles.tabBtnActive]}
          onPress={() => setActiveTab('browse')}
          activeOpacity={0.8}
        >
          <Ionicons name="search-outline" size={15} color={activeTab === 'browse' ? '#111' : '#999'} />
          <Text style={[styles.tabLabel, activeTab === 'browse' && styles.tabLabelActive]}>Browse</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'requests' && styles.tabBtnActive]}
          onPress={() => setActiveTab('requests')}
          activeOpacity={0.8}
        >
          <Ionicons name="mail-outline" size={15} color={activeTab === 'requests' ? '#111' : '#999'} />
          <Text style={[styles.tabLabel, activeTab === 'requests' && styles.tabLabelActive]}>Requests</Text>
          {requests.length > 0 && (
            <View style={styles.badge}><Text style={styles.badgeText}>{requests.length}</Text></View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search */}
      {activeTab === 'browse' && (
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={16} color="#aaa" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by course, topic, or name..."
            placeholderTextColor="#bbb"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color="#ccc" />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.filterBtn}>
            <Ionicons name="filter-outline" size={16} color="#888" />
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color={YELLOW} /></View>
      ) : activeTab === 'browse' ? (
        <FlatList
          data={filteredPosts}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <BrowseCard
              post={item}
              onSendRequest={openRequestSheet}
              alreadySent={sentPostIds.has(item.id)}
              isOwn={item.user_id === currentUser?.id}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={48} color="#ddd" />
              <Text style={styles.emptyText}>No study posts yet</Text>
              <Text style={styles.emptySubText}>Be the first to post!</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <RequestCard request={item} onAccept={handleAccept} onDecline={handleDecline} />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="mail-outline" size={48} color="#ddd" />
              <Text style={styles.emptyText}>No pending requests</Text>
            </View>
          }
        />
      )}

      {/* Request sheet */}
      {requestTarget && (
        <>
          <TouchableOpacity style={styles.backdrop} onPress={closeRequestSheet} activeOpacity={1} />
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'position' : 'height'} style={styles.sheetKAV}>
            <Animated.View style={[styles.sheet, { transform: [{ translateY: sheetAnim }] }]}>
              <View style={styles.sheetHandle} />
              <Text style={styles.sheetTitle}>Send Request</Text>
              <Text style={styles.sheetSubtitle}>
                Joining <Text style={{ fontWeight: '700' }}>{requestTarget.topic}</Text> at {requestTarget.location}
              </Text>
              <TextInput
                style={styles.sheetInput}
                placeholder="Write a message... (optional)"
                placeholderTextColor="#bbb"
                value={message}
                onChangeText={setMessage}
                multiline
                maxLength={200}
              />
              <TouchableOpacity
                style={[styles.sheetSendBtn, sending && { opacity: 0.6 }]}
                onPress={handleSendRequest}
                disabled={sending}
                activeOpacity={0.85}
              >
                {sending ? <ActivityIndicator color="#111" /> : <Text style={styles.sheetSendBtnText}>Send Request</Text>}
              </TouchableOpacity>
            </Animated.View>
          </KeyboardAvoidingView>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#111', letterSpacing: -0.5 },
  postBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: YELLOW, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 22,
  },
  postBtnText: { fontSize: 14, fontWeight: '700', color: '#111' },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: 20, marginBottom: 14,
    borderRadius: 14, borderWidth: 1, borderColor: '#e8e8e8',
    overflow: 'hidden', backgroundColor: '#fff',
  },
  tabBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 12,
  },
  tabBtnActive: { backgroundColor: '#f5f5f5' },
  tabLabel: { fontSize: 14, fontWeight: '600', color: '#999' },
  tabLabelActive: { color: '#111', fontWeight: '700' },
  badge: { backgroundColor: '#e03131', borderRadius: 9, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  badgeText: { fontSize: 11, fontWeight: '800', color: '#fff' },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 20, backgroundColor: '#fff',
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12,
    marginBottom: 14, borderWidth: 1, borderColor: '#eee',
  },
  searchInput: { flex: 1, fontSize: 14, color: '#111' },
  filterBtn: { padding: 2, marginLeft: 6 },
  list: { paddingHorizontal: 20, paddingBottom: 32, gap: 12 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '700', color: '#bbb' },
  emptySubText: { fontSize: 13, color: '#ccc', textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#f0f0f0' },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  avatar: { alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { fontWeight: '800', color: '#111' },
  cardHeaderText: { flex: 1 },
  cardNameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 },
  cardName: { fontSize: 15, fontWeight: '700', color: '#111' },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  timeText: { fontSize: 11, color: '#aaa', fontWeight: '500' },
  cardBadges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  courseBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#f5f5f5', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  courseBadgeText: { fontSize: 11, fontWeight: '700', color: '#444' },
  locationBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#f5f5f5', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  locationBadgeText: { fontSize: 11, fontWeight: '600', color: '#666' },
  cardTopic: { fontSize: 15, fontWeight: '700', color: '#111', marginBottom: 4 },
  cardDesc: { fontSize: 13, color: '#777', lineHeight: 19, marginBottom: 4 },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 },
  sendBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: YELLOW, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 22 },
  sendBtnSent: { backgroundColor: '#f0f0f0' },
  sendBtnText: { fontSize: 13, fontWeight: '700', color: '#111' },
  messageBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 9 },
  messageBtnText: { fontSize: 13, fontWeight: '600', color: '#888' },
  ownPostText: { fontSize: 12, color: '#aaa', fontWeight: '500', marginTop: 10 },
  requestMessage: { fontSize: 14, color: '#666', fontStyle: 'italic', lineHeight: 20, marginBottom: 4 },
  acceptBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: YELLOW, paddingHorizontal: 18, paddingVertical: 9, borderRadius: 22 },
  acceptBtnText: { fontSize: 13, fontWeight: '700', color: '#111' },
  declineBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1.5, borderColor: '#ddd', paddingHorizontal: 16, paddingVertical: 9, borderRadius: 22 },
  declineBtnText: { fontSize: 13, fontWeight: '600', color: '#555' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' },
  sheetKAV: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 24, paddingBottom: 40, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 16 },
  sheetHandle: { width: 38, height: 4, borderRadius: 2, backgroundColor: '#e0e0e0', alignSelf: 'center', marginTop: 12, marginBottom: 16 },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: '#111', marginBottom: 4 },
  sheetSubtitle: { fontSize: 13, color: '#888', marginBottom: 16 },
  sheetInput: { backgroundColor: '#f6f6f6', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#111', minHeight: 80, textAlignVertical: 'top', marginBottom: 16 },
  sheetSendBtn: { backgroundColor: YELLOW, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  sheetSendBtnText: { fontSize: 16, fontWeight: '700', color: '#111' },
});