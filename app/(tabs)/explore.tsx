import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

const PROMPTS = [
  'What made you smile today?',
  'One thing you\'re grateful for',
  'How are you really feeling right now?',
];

const TIPS = [
  { icon: 'leaf' as const, title: 'Breathing', subtitle: '2 min calm' },
  { icon: 'moon' as const, title: 'Sleep', subtitle: 'Wind down tips' },
  { icon: 'heart' as const, title: 'Self-care', subtitle: 'Quick ideas' },
];

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="screen-explore">
      <ScrollView
        className="scroll-explore"
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 100,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="title-explore">Explore</Text>
        <Text className="subtitle-explore">
          Prompts and ideas for your journal
        </Text>

        <View className="section-explore">
          <Text className="section-title-explore">
            Today's prompts
          </Text>
          {PROMPTS.map((prompt, index) => (
            <TouchableOpacity
              key={index}
              className="prompt-card-explore"
              activeOpacity={0.8}
            >
              <Ionicons name="chatbubble-outline" size={20} color="#6A3DE8" />
              <Text className="prompt-text-explore">{prompt}</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          className="mindmap-card-explore"
          activeOpacity={0.9}
        >
          <View className="mindmap-icon-explore">
            <Ionicons name="git-network" size={32} color="#6A3DE8" />
          </View>
          <View className="mindmap-text-explore">
            <Text className="mindmap-title-explore">
              Mind Map
            </Text>
            <Text className="mindmap-subtitle-explore">
              Unlock by keeping a 7-day streak
            </Text>
          </View>
          <Ionicons name="lock-closed" size={20} color="#999" />
        </TouchableOpacity>

        <View className="section-explore">
          <Text className="section-title-explore">
            Quick tips
          </Text>
          <View className="tips-row-explore">
            {TIPS.map((tip, index) => (
              <TouchableOpacity
                key={index}
                className="tip-card-explore"
                activeOpacity={0.8}
              >
                <View className="tip-icon-explore">
                  <Ionicons name={tip.icon} size={24} color="#6A3DE8" />
                </View>
                <Text className="tip-title-explore">
                  {tip.title}
                </Text>
                <Text className="tip-subtitle-explore">{tip.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
