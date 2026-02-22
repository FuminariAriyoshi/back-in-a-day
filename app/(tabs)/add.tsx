import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LISTENERS = [
  { id: 'rex', name: 'Rex', color: '#9B59B6', icon: 'person' },
  { id: 'maple', name: 'Maple', color: '#3498DB', icon: 'person', selected: true },
  { id: 'cove', name: 'Cove', color: '#16A085', icon: 'leaf' },
];

export default function AddScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedListener, setSelectedListener] = useState('maple');
  const currentDate = new Date();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dateStr = `${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}`;
  const fullDateStr = `${monthNames[currentDate.getMonth()]}${currentDate.getDate()} ${currentDate.getFullYear()}`;

  const selectedListenerData = LISTENERS.find((l) => l.id === selectedListener) || LISTENERS[1];

  return (
    <View className="screen-add">
      <ScrollView
        className="scroll-add"
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 100,
          paddingHorizontal: 20,
          alignItems: 'center',
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="header-add">
          <Text className="header-date-add">{dateStr}</Text>
          <TouchableOpacity className="header-avatar-add" activeOpacity={0.7}>
            <Ionicons name="person-circle-outline" size={40} color="#666" />
          </TouchableOpacity>
        </View>

        <View className="today-section-add">
          <Text className="today-text-add">Today</Text>
          <Text className="full-date-add">{fullDateStr}</Text>
        </View>

        <View className="placeholder-container-add">
          <LinearGradient
            colors={['#E0E0E0', '#F5F5F5']}
            style={{ width: 200, height: 200, borderRadius: 100, alignItems: 'center', justifyContent: 'center' }}
          >
            <View className="placeholder-inner-add" />
          </LinearGradient>
        </View>

        <View className="listener-section-add">
          <Text className="listener-title-add">Listener</Text>
          <View className="listener-row-add">
            {LISTENERS.map((listener) => (
              <TouchableOpacity
                key={listener.id}
                className={`listener-item-add ${selectedListener === listener.id ? 'listener-item-add--selected' : ''}`}
                onPress={() => setSelectedListener(listener.id)}
                activeOpacity={0.8}
              >
                <View
                  className="listener-avatar-add"
                  style={{ backgroundColor: listener.color }}
                >
                  <Ionicons name={listener.icon as any} size={32} color="#fff" />
                </View>
                <Text
                  className={`listener-name-add ${selectedListener === listener.id ? 'listener-name-add--selected' : ''}`}
                >
                  {listener.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text className="prompt-text-add">Start to talk!</Text>
      </ScrollView>

      <Pressable
        className="input-bar-add"
        style={{ bottom: insets.bottom + 10 }}
        onPress={() => router.push({ pathname: '/chat', params: { listenerId: selectedListener } })}
      >
        <View
          className="input-bar-avatar-add"
          style={{ backgroundColor: selectedListenerData.color }}
        >
          <Ionicons name={selectedListenerData.icon as any} size={24} color="#fff" />
        </View>
        <Text className="input-bar-placeholder-add">
          Start to talk!
        </Text>
        <View className="input-bar-send-add">
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </View>
      </Pressable>
    </View>
  );
}
