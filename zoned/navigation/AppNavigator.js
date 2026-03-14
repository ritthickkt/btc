import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';

import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import MapScreen from '../screens/MapScreen';
import StudyBuddyScreen from '../screens/StudyBuddyScreen';
import PostStudyScreen from '../screens/PostStudyScreen';
import PostScreen from '../screens/PostScreen';
import SnapsScreen from '../screens/SnapsScreen';
import FoodScreen from '../screens/FoodScreen';
import EvadeScreen from '../screens/EvadeScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const YELLOW = '#F5C518';

const TAB_ITEMS = [
  { name: 'Map',     icon: 'map-outline',     activeIcon: 'map' },
  { name: 'Study',   icon: 'people-outline',  activeIcon: 'people' },
  { name: 'Snaps',   icon: 'camera-outline',  activeIcon: 'camera' },
  { name: 'Post',    icon: 'add-circle-outline', activeIcon: 'add-circle' },
  { name: 'Food',    icon: 'pizza-outline',   activeIcon: 'pizza' },
  { name: 'Evade',   icon: 'shield-outline',  activeIcon: 'shield' },
  { name: 'Profile', icon: 'person-outline',  activeIcon: 'person' },
];

function BuddiesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StudyBuddy" component={StudyBuddyScreen} />
      <Stack.Screen name="PostStudy" component={PostStudyScreen} options={{ animation: 'slide_from_bottom' }} />
    </Stack.Navigator>
  );
}

function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const item = TAB_ITEMS.find(t => t.name === route.name);
        return {
          headerShown: false,
          tabBarShowLabel: true,
          tabBarActiveTintColor: YELLOW,
          tabBarInactiveTintColor: '#999',
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabLabel,
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? item?.activeIcon : item?.icon}
              size={22}
              color={color}
            />
          ),
        };
      }}
    >
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Study" component={BuddiesStack} />
      <Tab.Screen name="Snaps" component={SnapsScreen} />
      <Tab.Screen name="Post" component={PostScreen} />
      <Tab.Screen name="Food" component={FoodScreen} />
      <Tab.Screen name="Evade" component={EvadeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator({ user }) {
  return user ? <AppTabs /> : <AuthStack />;
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
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
});