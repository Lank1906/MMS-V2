import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
          index: 'home',
          rented_rooms: 'bed',
          profile: 'person',
        };
        return <Ionicons name={icons[route.name] || 'ellipse'} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#2ecc71',
      tabBarInactiveTintColor: 'gray',
      headerShown: false,
    })}>
      <Tabs.Screen name="index" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="rented_rooms" options={{ title: 'Phòng thuê' }} />
      <Tabs.Screen name="profile" options={{ title: 'Cá nhân' }} />
      <Tabs.Screen name="[roomId]" options={{ href: null }} />
    </Tabs>
  );
}
