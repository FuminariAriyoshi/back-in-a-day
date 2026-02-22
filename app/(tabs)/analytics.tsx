import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRAPH_WIDTH = SCREEN_WIDTH - 40;
const GRAPH_HEIGHT = 200;

const TIME_RANGES = ['1W', '1M', '6M', '1Y', '3Y', 'MAX'];
const SELECTED_RANGE = '1Y';

const graphData = [
  { x: 0, y: 120 },
  { x: 50, y: 80 },
  { x: 100, y: 150 },
  { x: 150, y: 100 },
  { x: 200, y: 180 },
  { x: 250, y: 140 },
  { x: 300, y: 160 },
];

const EVENT_DATE = 'Wed Nov 11 2024';
const EVENT_TITLE = 'I got married!';
const MOOD_ENTRY = 'Happy!';

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const [selectedRange, setSelectedRange] = useState(SELECTED_RANGE);
  const currentDate = new Date();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dateStr = `${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}`;
  const dateRangeStr = `Aug 15 2024-Aug 15 2025`;

  const maxY = Math.max(...graphData.map((d) => d.y));
  const minY = Math.min(...graphData.map((d) => d.y));
  const rangeY = maxY - minY || 1;
  const eventX = 200;

  return (
    <View className="screen-analytics">
      <ScrollView
        className="scroll-analytics"
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 100,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="header-analytics">
          <Text className="header-date-analytics">{dateStr}</Text>
          <TouchableOpacity className="header-avatar-analytics" activeOpacity={0.7}>
            <Ionicons name="person-circle-outline" size={40} color="#666" />
          </TouchableOpacity>
        </View>

        <Text className="daterange-label-analytics">{dateRangeStr}</Text>

        <View className="graph-container-analytics">
          <View className="graph-wrapper-analytics" style={{ height: GRAPH_HEIGHT }}>
            <View
              className="event-marker-analytics"
              style={{ left: (eventX / GRAPH_WIDTH) * GRAPH_WIDTH }}
            >
              <View className="event-marker-label-analytics">
                <Text className="event-marker-text-analytics">Nov 11</Text>
                <View className="event-marker-icon-analytics">
                  <LinearGradient
                    colors={['#FFD700', '#FFA500']}
                    style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Ionicons name="sunny" size={16} color="#fff" />
                  </LinearGradient>
                </View>
              </View>
            </View>

            <View
              className="graph-line-container-analytics"
              style={{ width: GRAPH_WIDTH, height: GRAPH_HEIGHT }}
            >
              <View
                className="graph-line-analytics"
                style={{ top: GRAPH_HEIGHT / 2 - 1.5 }}
              >
                <LinearGradient
                  colors={['#B8E986', '#4FC3F7']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ width: '100%', height: '100%', borderRadius: 1.5 }}
                />
              </View>
              {graphData.map((point, index) => {
                const x = (point.x / GRAPH_WIDTH) * GRAPH_WIDTH;
                const y = GRAPH_HEIGHT - ((point.y - minY) / rangeY) * GRAPH_HEIGHT;
                return (
                  <View
                    key={index}
                    className="graph-point-analytics"
                    style={{ left: x - 4, top: y - 4 }}
                  />
                );
              })}
            </View>
          </View>
        </View>

        <View className="timerange-analytics">
          {TIME_RANGES.map((range) => (
            <TouchableOpacity
              key={range}
              className={`timerange-btn-analytics ${selectedRange === range ? 'timerange-btn-analytics--selected' : ''}`}
              onPress={() => setSelectedRange(range)}
              activeOpacity={0.7}
            >
              <Text
                className={`timerange-text-analytics ${selectedRange === range ? 'timerange-text-analytics--selected' : ''}`}
              >
                {range}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="event-card-analytics">
          <View className="event-header-analytics">
            <Text className="event-title-analytics">
              {EVENT_TITLE}
            </Text>
            <View className="event-icon-analytics">
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}
              >
                <Ionicons name="sunny" size={32} color="#fff" />
              </LinearGradient>
            </View>
          </View>
          <Text className="event-date-analytics">{EVENT_DATE}</Text>
        </View>

        <View className="mood-card-analytics">
          <Text className="mood-text-analytics">{MOOD_ENTRY}</Text>
          <View className="mood-icon-analytics">
            <LinearGradient
              colors={['#4FC3F7', '#B8E986']}
              style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}
            >
              <Ionicons name="happy" size={24} color="#fff" />
            </LinearGradient>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
