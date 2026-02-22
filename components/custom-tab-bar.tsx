import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { Platform, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const currentIndex = state.index;

  const onTabPress = (routeName: string, index: number) => {
    const event = navigation.emit({
      type: 'tabPress',
      target: state.routes[index].key,
      canPreventDefault: true,
    });
    if (!event.defaultPrevented) {
      navigation.navigate(state.routes[index].name, state.routes[index].params);
    }
  };

  const onAddPress = () => {
    if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('add');
  };

  const tabIconColor = (index: number) => (currentIndex === index ? '#333' : '#B0B0B0');
  const labelActive = (index: number) => currentIndex === index;

  return (
    <View
      className="tabbar-wrapper"
      style={{ paddingBottom: insets.bottom }}
    >
      <View className="tabbar-inner">
        <Pressable
          className="tabbar-tab"
          onPress={() => onTabPress('index', 0)}
          accessibilityRole="button"
          accessibilityLabel="Home"
        >
          <MaterialIcons name="home" size={26} color={tabIconColor(0)} />
          <Text className={`tabbar-label ${labelActive(0) ? 'tabbar-label--active' : ''}`}>
            Home
          </Text>
        </Pressable>

        <Pressable
          className="tabbar-tab"
          onPress={() => onTabPress('explore', 1)}
          accessibilityRole="button"
          accessibilityLabel="Explore"
        >
          <MaterialIcons name="explore" size={26} color={tabIconColor(1)} />
          <Text className={`tabbar-label ${labelActive(1) ? 'tabbar-label--active' : ''}`}>
            Explore
          </Text>
        </Pressable>

        <Pressable
          className="tabbar-fab"
          onPress={onAddPress}
          accessibilityRole="button"
          accessibilityLabel="Add"
        >
          <View className="tabbar-fab-circle">
            <Text className="tabbar-fab-icon">+</Text>
          </View>
        </Pressable>

        <Pressable
          className="tabbar-tab"
          onPress={() => onTabPress('analytics', 3)}
          accessibilityRole="button"
          accessibilityLabel="Analytics"
        >
          <MaterialIcons name="analytics" size={26} color={tabIconColor(3)} />
          <Text className={`tabbar-label ${labelActive(3) ? 'tabbar-label--active' : ''}`}>
            Analytics
          </Text>
        </Pressable>

        <Pressable
          className="tabbar-tab"
          onPress={() => onTabPress('listeners', 4)}
          accessibilityRole="button"
          accessibilityLabel="Listeners"
        >
          <MaterialIcons name="people" size={26} color={tabIconColor(4)} />
          <Text className={`tabbar-label ${labelActive(4) ? 'tabbar-label--active' : ''}`}>
            Listeners
          </Text>
        </Pressable>
      </View>
      <View className="tabbar-bottom-line" />
    </View>
  );
}
