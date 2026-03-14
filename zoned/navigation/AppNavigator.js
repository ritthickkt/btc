import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { Dimensions, Platform } from 'react-native';
import { supabase } from '../supabase/config';

import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';
import SnapsScreen from '../screens/SnapsScreen';
import PostScreen from '../screens/PostScreen';
import EvadeScreen from '../screens/EvadeScreen';
import StudyScreen from '../screens/StudyScreen';
import PostStudyScreen from '../screens/PostStudyScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Home:    ['home',    'home-outline'],
  Map:     ['map',     'map-outline'],
  Snaps:   ['camera',  'camera-outline'],
  Evade:   ['shield',  'shield-outline'],
  Study:   ['school',  'school-outline'],
  Profile: ['person',  'person-outline'],
};

// Buddies tab gets its own stack so PostStudy can push on top
function BuddiesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StudyBuddy" component={StudyBuddyScreen} />
      <Stack.Screen
        name="PostStudy"
        component={PostStudyScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
    </Stack.Navigator>
  );
}

function AppTabs({ isDesktop }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#1a1a1a',
        tabBarInactiveTintColor: '#b0b0b0',
        tabBarStyle: [styles.tabBar, isDesktop && styles.tabBarDesktop],
        tabBarLabelStyle: [styles.tabLabel, isDesktop && styles.tabLabelDesktop],
        tabBarIcon: ({ focused }) => {
          const [active, inactive] = TAB_ICONS[route.name];
          return (
            <View style={[focused ? styles.activeIconWrap : null, isDesktop && focused && styles.activeIconWrapDesktop]}>
              <Ionicons
                name={focused ? active : inactive}
                size={isDesktop ? 24 : 22}
                color={focused ? '#1a1a1a' : '#b0b0b0'}
              />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Snaps" component={SnapsScreen} />
      <Tab.Screen name="Evade" component={EvadeScreen} />
      <Tab.Screen name="Study" component={StudyScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      if (Platform.OS === 'web') {
        await supabase.auth.signOut(); // Clear any cached session on web
      }
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    const updateIsDesktop = () => {
      const { width } = Dimensions.get('window');
      setIsDesktop(Platform.OS === 'web' && width >= 768);
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    updateIsDesktop();
    const dimSubscription = Dimensions.addEventListener('change', updateIsDesktop);

    return () => {
      subscription.unsubscribe();
      dimSubscription?.remove();
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color="#F5C518" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="AppTabs" component={() => <AppTabs isDesktop={isDesktop} />} />
          <Stack.Screen name="Post" component={PostScreen} />
          <Stack.Screen name="PostStudy" component={PostStudyScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    height: 80,
    paddingBottom: 16,
    paddingTop: 8,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  activeIconWrap: {
    backgroundColor: '#F5C518',
    borderRadius: 10,
    width: 40,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconWrapDesktop: {
    borderRadius: 8,
    width: 48,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBarDesktop: {
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabLabelDesktop: {
    fontSize: 12,
  },
});
