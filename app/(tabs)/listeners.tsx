import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LISTENERS = [
  {
    id: 'rex',
    name: 'Rex',
    description: 'Energetic and supportive. Always ready to cheer you on and keep the conversation lively.',
    color: '#9B59B6',
    icon: 'person',
  },
  {
    id: 'maple',
    name: 'Maple',
    description: 'Warm and empathetic. Loves deep conversations and quiet moments of reflection.',
    color: '#3498DB',
    icon: 'person',
  },
  {
    id: 'cove',
    name: 'Cove',
    description: 'A friend who is knowledgeable and a bit clumsy. Someone who listens without judgment.',
    color: '#16A085',
    icon: 'leaf',
  },
];

export default function ListenersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const listener = LISTENERS[currentIndex];

  const currentDate = new Date();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dateStr = `${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}`;

  const onNext = () => setCurrentIndex((prev) => (prev + 1) % LISTENERS.length);
  const onSelect = () => router.back();

  return (
    <View className="screen-listeners">
      <ScrollView
        className="scroll-listeners"
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 120,
          paddingHorizontal: 20,
          alignItems: 'center',
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="header-listeners">
          <TouchableOpacity
            className="header-back-listeners"
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <View className="header-center-listeners">
            <Text className="header-date-listeners">{dateStr}</Text>
            <Text className="header-title-listeners">
              Choose Your Companion
            </Text>
          </View>
          <TouchableOpacity className="header-profile-listeners" activeOpacity={0.7}>
            <Ionicons name="person-circle-outline" size={32} color="#666" />
          </TouchableOpacity>
        </View>

        <View className="card-listeners">
          <LinearGradient
            colors={['#FFFFFF', '#F8F0FF', '#F0E6FA']}
            style={{ padding: 32, paddingTop: 40, paddingBottom: 40 }}
          >
            <View className="companion-area-listeners">
              <View
                className="companion-circle-listeners"
                style={{ backgroundColor: listener.color }}
              >
                <Ionicons name={listener.icon as any} size={80} color="rgba(255,255,255,0.9)" />
              </View>
            </View>
            <Text className="companion-name-listeners">
              {listener.name}
            </Text>
            <Text className="companion-desc-listeners">
              {listener.description}
            </Text>
          </LinearGradient>
        </View>

        <View className="actions-listeners">
          <TouchableOpacity
            className="next-btn-listeners"
            onPress={onNext}
            activeOpacity={0.8}
          >
            <Text className="next-btn-text-listeners">
              Next Listener
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity
            className="select-btn-listeners"
            onPress={onSelect}
            activeOpacity={0.8}
          >
            <Text className="select-btn-text-listeners">
              Select {listener.name}
            </Text>
            <View className="check-circle-listeners">
              <Ionicons name="checkmark" size={16} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
