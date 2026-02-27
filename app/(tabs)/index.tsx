import { useAuth } from '@/contexts/AuthContext';
import { useJournals } from '@/hooks/use-journals';
import { Ionicons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MOOD_COLORS = [
  '#9B59B6',
  '#E91E8C',
  '#2196F3',
  '#FBC02D',
  '#26A69A',
  '#1565C0',
  '#BDBDBD',
];

const LISTENERS = [
  { id: 'rex', name: 'Rex', color: '#9B59B6', icon: 'person' as const },
  { id: 'maple', name: 'Maple', color: '#3498DB', icon: 'person' as const },
  { id: 'cove', name: 'Cove', color: '#16A085', icon: 'leaf' as const },
];

function getWeekEndingToday(): { date: Date; dayName: string; dayNum: number; monthName: string; isToday: boolean; dateKey: string }[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const out: { date: Date; dayName: string; dayNum: number; monthName: string; isToday: boolean; dateKey: string }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    out.push({
      date: d,
      dayName: DAY_NAMES[d.getDay()],
      dayNum: d.getDate(),
      monthName: MONTH_NAMES[d.getMonth()],
      isToday: i === 0,
      dateKey: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
    });
  }
  return out;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signOut, user } = useAuth();
  const { journalsByDate, loading: journalsLoading, fetchJournals } = useJournals();

  // 画面に戻ってきたときにデータを再取得する
  useFocusEffect(
    useCallback(() => {
      fetchJournals();
    }, [fetchJournals])
  );

  const week = useMemo(() => getWeekEndingToday(), []);
  const todayIndex = 6;
  const [selectedDayIndex, setSelectedDayIndex] = useState(todayIndex);
  const [selectedListener, setSelectedListener] = useState('maple');

  const selectedDay = week[selectedDayIndex];
  const isSelectedToday = selectedDay?.isToday ?? false;

  const journalsForDay = selectedDay ? (journalsByDate[selectedDay.dateKey] || []) : [];
  const hasJournalForSelected = journalsForDay.length > 0;

  // 選択されたセッションのインデックス
  const [sessionIndex, setSessionIndex] = useState(0);

  // 日付が変わったときにセッションインデックスをリセット
  useEffect(() => {
    setSessionIndex(0);
  }, [selectedDayIndex]);

  const selectedEntry = journalsForDay[sessionIndex] || journalsForDay[0];

  const selectedListenerData = LISTENERS.find((l) => l.id === selectedListener) || LISTENERS[1];
  const headerDateStr = week.length ? `${week[6].monthName} ${week[6].dayNum} ${week[6].date.getFullYear()}` : '';

  const handleSignOut = () => {
    Alert.alert('サインアウト', 'サインアウトしますか？', [
      { text: 'キャンセル', style: 'cancel' },
      { text: 'サインアウト', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <View className="screen-home">
      <ScrollView
        className="scroll-home"
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 100,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="header-home">
          <View className="header-left-home">
            <Text className="title-home">
              Daily Journal & History
            </Text>
            <Text className="date-home">
              {headerDateStr}
            </Text>
          </View>
          <TouchableOpacity
            className="avatar-btn-home"
            activeOpacity={0.7}
            onPress={handleSignOut}
          >
            <Ionicons name="person-circle-outline" size={40} color="#666" />
          </TouchableOpacity>
        </View>

        {/* 1週間・右端が今日 */}
        <View className="week-row-home">
          {week.map((day, index) => (
            <TouchableOpacity
              key={day.dateKey}
              className={`day-cell-home ${selectedDayIndex === index ? 'day-cell-home--selected' : ''}`}
              onPress={() => setSelectedDayIndex(index)}
              activeOpacity={0.8}
            >
              <Text
                className={`day-name-home ${selectedDayIndex === index ? 'day-name-home--selected' : ''}`}
              >
                {day.dayName}
              </Text>
              <Text
                className={`day-num-home ${selectedDayIndex === index ? 'day-num-home--selected' : ''}`}
              >
                {day.dayNum}
              </Text>
              <View
                className="mood-dot-home"
                style={{
                  backgroundColor: journalsByDate[day.dateKey]?.[0] ? (journalsByDate[day.dateKey][0].mood_color || '#4CD964') : MOOD_COLORS[index],
                  width: selectedDayIndex === index ? 12 : 8,
                  height: selectedDayIndex === index ? 12 : 8,
                  borderRadius: selectedDayIndex === index ? 6 : 4,
                }}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* ローディング中 */}
        {journalsLoading ? (
          <View style={{ flex: 1, alignItems: 'center', paddingTop: 60 }}>
            <ActivityIndicator size="large" color="#888" />
          </View>
        ) : hasJournalForSelected && selectedEntry ? (
          /* 選択した日にジャーナルがある場合: カード表示 */
          <View className="items-center">
            {/* 複数セッションがある場合のタブ切替 */}
            {journalsForDay.length > 1 && (
              <View style={{ flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 20, padding: 4, marginBottom: 16, alignSelf: 'center' }}>
                {journalsForDay.map((_, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => setSessionIndex(idx)}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 6,
                      borderRadius: 16,
                      backgroundColor: sessionIndex === idx ? '#fff' : 'transparent',
                    }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '700', color: sessionIndex === idx ? '#000' : '#888' }}>
                      Session {journalsForDay.length - idx}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {/* ジャーナル時のサークル表示 */}
            <View className="empty-placeholder-home">
              <LinearGradient
                colors={[selectedEntry.mood_color || '#E0E0E0', '#F5F5F5']}
                style={{
                  width: 200,
                  height: 200,
                  borderRadius: 100,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MaterialIcons name="auto-awesome" size={60} color="#1a1a1a" style={{ opacity: 0.15 }} />
              </LinearGradient>
            </View>

            <View
              className="journal-card-home w-full"
              style={{ backgroundColor: '#fff' }}
            >
              <Text
                className="card-title-home"
                style={{ color: '#000', opacity: 0.4 }}
              >
                {selectedEntry.text.toUpperCase()}
              </Text>

              {/* 要約 */}
              <Text className="journal-text-home" style={{ color: '#1a1a1a', fontWeight: 'bold', fontSize: 22, marginTop: 10 }}>
                {selectedEntry.summary || selectedEntry.text}
              </Text>

              {/* 今日やったこと */}
              {selectedEntry.today_tasks && selectedEntry.today_tasks.length > 0 && (
                <View style={{ marginTop: 20, padding: 18, backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 16 }}>
                  <Text style={{ fontSize: 11, fontWeight: '800', marginBottom: 12, opacity: 0.35, letterSpacing: 1 }}>TODAY'S LOG</Text>
                  {selectedEntry.today_tasks.map((task: string, idx: number) => (
                    <View key={idx} style={{ flexDirection: 'row', marginBottom: 8, gap: 10 }}>
                      <Text style={{ fontSize: 14, color: '#666' }}>•</Text>
                      <Text style={{ fontSize: 14, color: '#333', lineHeight: 22, flex: 1 }}>{task}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* 明日やること */}
              {selectedEntry.tomorrow_tasks && selectedEntry.tomorrow_tasks.length > 0 && (
                <View style={{ marginTop: 12, padding: 18, backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' }}>
                  <Text style={{ fontSize: 11, fontWeight: '800', marginBottom: 12, opacity: 0.35, letterSpacing: 1 }}>TOMORROW'S PLAN</Text>
                  {selectedEntry.tomorrow_tasks.map((task: string, idx: number) => (
                    <View key={idx} style={{ flexDirection: 'row', marginBottom: 8, gap: 10, alignItems: 'flex-start' }}>
                      <Text style={{ fontSize: 14, color: '#1a1a1a', fontWeight: '700' }}>{idx + 1}.</Text>
                      <Text style={{ fontSize: 14, color: '#333', lineHeight: 22, flex: 1 }}>{task}</Text>
                    </View>
                  ))}
                </View>
              )}

              <View className="listener-row-home" style={{ marginTop: 24 }}>
                <View className="listener-avatar-home" style={{ backgroundColor: 'rgba(0,0,0,0.08)', width: 32, height: 32 }}>
                  <Ionicons name="person" size={16} color="#666" />
                </View>
                <Text className="listener-label-home" style={{ color: '#666', fontSize: 13 }}>
                  Listener: {selectedEntry.listener_name}
                </Text>
              </View>

              {/* 会話ログ */}
              {selectedEntry.messages && selectedEntry.messages.length > 0 && (
                <View style={{ marginTop: 24, padding: 16, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', marginBottom: 14, opacity: 0.35, letterSpacing: 0.5 }}>CONVERSATION LOG</Text>
                  {selectedEntry.messages.slice(0, 3).map((m: any, idx: number) => (
                    <View key={idx} style={{ marginBottom: 10 }}>
                      <Text style={{ fontSize: 13, color: '#666', lineHeight: 18 }}>
                        <Text style={{ fontWeight: '700', color: '#444' }}>{m.role === 'user' ? 'Me' : selectedEntry.listener_name}: </Text>
                        {m.content}
                      </Text>
                    </View>
                  ))}
                  {selectedEntry.messages.length > 3 && (
                    <Text style={{ fontSize: 12, opacity: 0.4, fontStyle: 'italic', marginTop: 4 }}>+ {(selectedEntry.messages.length - 3)} messages</Text>
                  )}
                </View>
              )}

              {/* 編集ボタン */}
              <TouchableOpacity
                onPress={() => router.push({
                  pathname: '/chat',
                  params: {
                    listenerId: selectedEntry.listener_id,
                    date: selectedEntry.date,
                    journalId: selectedEntry.id,
                    existingMessages: JSON.stringify(selectedEntry.messages ?? []),
                  }
                })}
                activeOpacity={0.8}
                style={{
                  marginTop: 24,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  paddingVertical: 14,
                  paddingHorizontal: 20,
                  backgroundColor: 'rgba(0,0,0,0.04)',
                  borderRadius: 18,
                }}
              >
                <Ionicons name="chatbubble-ellipses-outline" size={18} color="#1a1a1a" />
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#1a1a1a' }}>続きを話す / 編集</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* ジャーナルがない場合 */
          <>
            <View className="empty-today-section-home">
              <Text className="empty-today-text-home">
                {isSelectedToday ? 'Today' : `${selectedDay?.dayName} ${selectedDay?.dayNum}`}
              </Text>
              <Text className="empty-fulldate-home">
                {selectedDay
                  ? `${selectedDay.monthName}${selectedDay.dayNum} ${selectedDay.date.getFullYear()}`
                  : ''}
              </Text>
            </View>

            <View className="empty-placeholder-home">
              <LinearGradient
                colors={['#E0E0E0', '#F5F5F5']}
                style={{
                  width: 200,
                  height: 200,
                  borderRadius: 100,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="chatbubble-ellipses" size={60} color="#1a1a1a" style={{ opacity: 0.1 }} />
              </LinearGradient>
            </View>

            <View className="empty-listener-section-home">
              <Text className="empty-listener-title-home">
                Listener
              </Text>
              <View className="empty-listener-row-home">
                {LISTENERS.map((listener) => (
                  <TouchableOpacity
                    key={listener.id}
                    className={`empty-listener-item-home ${selectedListener === listener.id ? 'empty-listener-item-home--selected' : ''}`}
                    onPress={() => setSelectedListener(listener.id)}
                    activeOpacity={0.8}
                  >
                    <View
                      className="empty-listener-avatar-home"
                      style={{ backgroundColor: listener.color }}
                    >
                      <Ionicons name={listener.icon} size={32} color="#fff" />
                    </View>
                    <Text
                      className={`empty-listener-name-home ${selectedListener === listener.id ? 'empty-listener-name-home--selected' : ''}`}
                    >
                      {listener.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Text className="empty-prompt-home">
              Start to talk!
            </Text>
          </>
        )}
      </ScrollView>

      {/* ジャーナルがないとき: タップでチャット画面へ */}
      {!journalsLoading && !hasJournalForSelected && (
        <Pressable
          className="input-bar-home"
          style={{ bottom: insets.bottom + 10 }}
          onPress={() => router.push({ pathname: '/chat', params: { listenerId: selectedListener, date: selectedDay?.dateKey } })}
        >
          <View
            className="input-bar-avatar-home"
            style={{ backgroundColor: selectedListenerData.color }}
          >
            <Ionicons name={selectedListenerData.icon} size={24} color="#fff" />
          </View>
          <Text className="input-bar-placeholder-home">
            Start to talk!
          </Text>
          <View className="input-bar-send-home">
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </View>
        </Pressable>
      )}
    </View>
  );
}
