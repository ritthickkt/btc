import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

const YELLOW = '#F5C518';

const STUDY_SESSIONS = [
  { id: '1', course: 'COMP1511', topic: 'Programming Fundamentals', time: '2-4 PM', location: 'CSE Lab', participants: 3 },
  { id: '2', course: 'MATH1131', topic: 'Calculus', time: '5-7 PM', location: 'Library', participants: 5 },
  { id: '3', course: 'PHYS1121', topic: 'Physics 1', time: '1-3 PM', location: 'Physics Building', participants: 2 },
];

export default function StudyScreen({ navigation }) {
  const [sessions, setSessions] = useState(STUDY_SESSIONS);

  const joinSession = (id) => {
    // Here you would join the study session
    alert(`Joined study session for ${sessions.find(s => s.id === id).course}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Text style={styles.title}>Study Sessions</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('PostStudy')}>
          <Ionicons name="add" size={24} color="#1a1a1a" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionTitle}>Available Sessions</Text>
        {sessions.map((session) => (
          <TouchableOpacity
            key={session.id}
            style={styles.sessionCard}
            activeOpacity={0.8}
            onPress={() => joinSession(session.id)}
          >
            <View style={styles.sessionHeader}>
              <View style={styles.courseBadge}>
                <Text style={styles.courseText}>{session.course}</Text>
              </View>
              <Text style={styles.timeText}>{session.time}</Text>
            </View>
            <Text style={styles.topicText}>{session.topic}</Text>
            <View style={styles.sessionFooter}>
              <View style={styles.location}>
                <Ionicons name="location-outline" size={16} color="#666" />
                <Text style={styles.locationText}>{session.location}</Text>
              </View>
              <View style={styles.participants}>
                <Ionicons name="people-outline" size={16} color="#666" />
                <Text style={styles.participantsText}>{session.participants}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
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
  sessionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  courseBadge: {
    backgroundColor: YELLOW,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  courseText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  timeText: {
    fontSize: 14,
    color: '#666',
  },
  topicText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  sessionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  participants: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantsText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
});