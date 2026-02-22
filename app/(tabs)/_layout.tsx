import { Tabs } from 'expo-router';
import React from 'react';

import { CustomTabBar } from '@/components/custom-tab-bar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="explore" options={{ title: 'Explore' }} />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Add',
          href: null, // hide from expo-router tab list in some contexts
        }}
      />
      <Tabs.Screen name="analytics" options={{ title: 'Analytics' }} />
      <Tabs.Screen name="listeners" options={{ title: 'Listeners' }} />
      <Tabs.Screen name="trends" options={{ title: 'Trends', href: null }} />
    </Tabs>
  );
}
