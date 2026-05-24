import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

import { HapticTab } from '../../components/haptic-tab';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#15b8c7',
        tabBarInactiveTintColor: '#789',
        tabBarStyle: { backgroundColor: '#071014', borderTopColor: '#18343c' },
        headerStyle: { backgroundColor: '#071014' },
        headerTintColor: '#f3fbff',
        headerTitleStyle: { fontWeight: '800' },
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Ionicons size={size} name="grid-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="models"
        options={{
          title: 'Models',
          tabBarIcon: ({ color, size }) => <Ionicons size={size} name="hardware-chip-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="operations"
        options={{
          title: 'Ops',
          tabBarIcon: ({ color, size }) => <Ionicons size={size} name="pulse-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color, size }) => <Ionicons size={size} name="albums-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color, size }) => <Ionicons size={size} name="person-circle-outline" color={color} />,
        }}
      />
    </Tabs>
  );
}
