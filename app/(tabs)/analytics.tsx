import { useJournals } from '@/hooks/use-journals';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, Path, Stop, LinearGradient as SvgGradient } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRAPH_WIDTH = SCREEN_WIDTH - 40;
const GRAPH_HEIGHT = 160;

const TIME_RANGES = ['1W', '1M', '6M', '1Y', '3Y', 'MAX'];

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const { journals } = useJournals();
  const [selectedRange, setSelectedRange] = useState('1Y');

  const filteredData = useMemo(() => {
    if (!journals || journals.length === 0) return [];

    const now = new Date();
    let cutoff = new Date();

    switch (selectedRange) {
      case '1W': cutoff.setDate(now.getDate() - 7); break;
      case '1M': cutoff.setMonth(now.getMonth() - 1); break;
      case '6M': cutoff.setMonth(now.getMonth() - 6); break;
      case '1Y': cutoff.setFullYear(now.getFullYear() - 1); break;
      case '3Y': cutoff.setFullYear(now.getFullYear() - 3); break;
      case 'MAX': cutoff = new Date(0); break;
    }

    const filtered = journals
      .filter(j => new Date(j.date) >= cutoff)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (filtered.length === 0) return [];

    const minTime = new Date(filtered[0].date).getTime();
    const maxTime = now.getTime();
    const timeRange = maxTime - minTime || 1;

    return filtered.map(j => ({
      x: ((new Date(j.date).getTime() - minTime) / timeRange) * GRAPH_WIDTH,
      y: GRAPH_HEIGHT - ((j.mood_score ?? 50) / 100) * GRAPH_HEIGHT,
      score: j.mood_score ?? 50,
      date: j.date,
      title: j.text
    }));
  }, [journals, selectedRange]);

  const latestJournal = journals && journals.length > 0 ? journals[0] : null;

  const currentDate = new Date();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dateStr = `${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}`;

  const dateRangeStr = useMemo(() => {
    if (filteredData.length === 0) return 'No data';
    const first = new Date(filteredData[0].date);
    const last = new Date();
    return `${monthNames[first.getMonth()]} ${first.getDate()} ${first.getFullYear()} - ${monthNames[last.getMonth()]} ${last.getDate()} ${last.getFullYear()}`;
  }, [filteredData]);

  const pathData = useMemo(() => {
    if (filteredData.length < 2) return "";
    return filteredData.reduce((acc, point, i) => {
      return i === 0 ? `M ${point.x},${point.y}` : `${acc} L ${point.x},${point.y}`;
    }, "");
  }, [filteredData]);

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
            {filteredData.length > 1 ? (
              <Svg width={GRAPH_WIDTH} height={GRAPH_HEIGHT}>
                <Defs>
                  <SvgGradient id="grad" x1="0" y1="0" x2="1" y2="0">
                    <Stop offset="0" stopColor="#B8E986" stopOpacity="1" />
                    <Stop offset="1" stopColor="#4FC3F7" stopOpacity="1" />
                  </SvgGradient>
                </Defs>
                <Path
                  d={pathData}
                  fill="none"
                  stroke="url(#grad)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {filteredData.map((point, i) => (
                  <Circle
                    key={i}
                    cx={point.x}
                    cy={point.y}
                    r="4"
                    fill={point.score > 70 ? "#FFD700" : point.score < 30 ? "#4FC3F7" : "#B8E986"}
                  />
                ))}
              </Svg>
            ) : filteredData.length === 1 ? (
              <View style={{ alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <View
                  style={{
                    width: 12, height: 12, borderRadius: 6,
                    backgroundColor: filteredData[0].score > 70 ? "#FFD700" : "#B8E986"
                  }}
                />
                <Text style={{ marginTop: 8, color: '#999' }}>One entry recorded</Text>
              </View>
            ) : (
              <View style={{ alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Text style={{ color: '#999' }}>No journals in this period</Text>
              </View>
            )}
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

        {latestJournal && (
          <>
            <View className="event-card-analytics">
              <View className="event-header-analytics">
                <Text className="event-title-analytics">
                  {latestJournal.text}
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
              <Text className="event-date-analytics">{new Date(latestJournal.date).toDateString()}</Text>
            </View>

            <View className="mood-card-analytics">
              <Text className="mood-text-analytics" numberOfLines={2}>
                {latestJournal.summary || "No summary available"}
              </Text>
              <View className="mood-icon-analytics">
                <LinearGradient
                  colors={latestJournal.mood_score && latestJournal.mood_score > 60 ? ['#FFD700', '#FFA500'] : ['#4FC3F7', '#B8E986']}
                  style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Ionicons
                    name={latestJournal.mood_score && latestJournal.mood_score > 60 ? "happy" : "rainy"}
                    size={24} color="#fff"
                  />
                </LinearGradient>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
