import { AIChatInput } from '@/components/ui/ai-chat-input';
import { useJournals } from '@/hooks/use-journals';
import { chat as openaiChat, transcribeAudio, type ChatMessage } from '@/lib/openai';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import 'react-native-url-polyfill/auto';

const LISTENERS = [
  { id: 'rex', name: 'Rex', color: '#9B59B6', icon: 'person' as const },
  { id: 'maple', name: 'Maple', color: '#3498DB', icon: 'person' as const },
  { id: 'cove', name: 'Cove', color: '#16A085', icon: 'leaf' as const },
];

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

type MessageItem = { id: string; role: 'user' | 'assistant'; content: string; time: string };

function formatTime(date: Date): string {
  const h = date.getHours();
  const m = date.getMinutes();
  const am = h < 12;
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')}${am ? 'am' : 'pm'}`;
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ listenerId?: string; date?: string; existingMessages?: string; initialText?: string; journalId?: string }>();
  const listenerId = (params.listenerId as string) || 'maple';
  const dateParam = params.date as string | undefined;  // 編集時は既存の日付
  const initialText = params.initialText as string | undefined;
  const journalId = params.journalId as string | undefined;
  const isEditMode = !!journalId; // IDがあれば編集モード

  // 既存メッセージがあれば引き継ぐ（編集モード）
  const initialMessages = (): MessageItem[] => {
    if (!params.existingMessages) return [];
    try {
      const parsed = JSON.parse(params.existingMessages as string);
      return parsed.map((m: any, i: number) => ({
        id: `existing-${i}`,
        role: m.role,
        content: m.content,
        time: m.time || '--:--',
      }));
    } catch { return []; }
  };

  const [selectedListener, setSelectedListener] = useState(listenerId);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<MessageItem[]>(initialMessages);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const { upsertJournal } = useJournals();
  const [finishing, setFinishing] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  // 表示用の日付（編集時は元の日付、新規は今日）
  const displayDate = dateParam ? new Date(dateParam + 'T00:00:00') : new Date();
  const dateStr = `${MONTH_NAMES[displayDate.getMonth()]} ${displayDate.getDate()}`;
  const fullDateStr = `${MONTH_NAMES[displayDate.getMonth()]}${displayDate.getDate()} ${displayDate.getFullYear()}`;
  const listener = LISTENERS.find((l) => l.id === selectedListener) ?? LISTENERS[1];

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const userMsg: MessageItem = {
        id: `u-${Date.now()}`,
        role: 'user',
        content: trimmed,
        time: formatTime(new Date()),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInputText('');
      setLoading(true);

      try {
        const history: ChatMessage[] = [
          {
            role: 'system',
            content: `You are ${listener.name}, a strategic coaching advisor and mirror for the user, Fumi.
Your goal is not just to listen, but to provide sharp, high-level strategic interventions.

Core behavior:
- Always call the user "Fumi".
- Act as a high-level strategic advisor/manager mode, not just a designer.
- Distinguish clearly between "Expression/Decoration" (which can be a form of evasion) and "Strategy/Substance".
- Be direct, analytical, and blunt. If Fumi is avoiding the essence, point it out immediately.
- Use a specific structure for your responses, clearly separated by separators like "⸻".

Typical Response Structure:
1. Direct opening (addressing the current state/blind spot)
⸻
2. 🧠 Current challenges/tasks (Summary of what Fumi is holding)
⸻
3. 問題の本質 (The essence of the problem/bottleneck)
⸻
4. 🎯 結論：優先順位 (Clear ranking of what to do, and what NOT to do)
⸻
5. 重要な指摘 (Crucial observations about Fumi's current approach/mindset)
⸻
6. 🔥 今週の戦略/アクション (Specific steps)
⸻
7. あなたの思考の弱点 (Weak points in thinking pattern)
⸻
8. 問い (Sharp questions to force deep reflection)

- For all knowledge/design questions, answer in BOTH English and Japanese.
- Use English UI names for software (Figma, Adobe, etc.).
- When praising, do it wholeheartedly, but quickly return to strategy.
- Emphasize "やらないことを決める勇気" (The courage to decide what NOT to do).
`,
          },
          ...messages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
          { role: 'user', content: trimmed },
        ];
        const reply = await openaiChat(history);
        const assistantMsg: MessageItem = {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: reply,
          time: formatTime(new Date()),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch (e) {
        const err = e instanceof Error ? e.message : 'Something went wrong';
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: 'assistant',
            content: `Error: ${err}. Check that EXPO_PUBLIC_OPENAI_API_KEY is set.`,
            time: formatTime(new Date()),
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, messages, listener.name]
  );

  const startRecording = useCallback(async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = rec;
      setRecording(true);
    } catch (e) {
      console.warn('Failed to start recording', e);
    }
  }, []);

  const stopRecordingAndTranscribe = useCallback(async (): Promise<string> => {
    const rec = recordingRef.current;
    if (!rec) {
      setRecording(false);
      return '';
    }
    setRecording(false);
    recordingRef.current = null;
    try {
      await rec.stopAndUnloadAsync();
      const uri = rec.getURI();
      if (uri) {
        const text = await transcribeAudio(uri);
        return text || '';
      }
    } catch (e) {
      console.warn('Transcribe failed', e);
    }
    return '';
  }, []);

  useEffect(() => {
    if (initialText && messages.length === 0) {
      sendMessage(initialText);
    }
  }, [initialText, messages.length, sendMessage]);

  const handleMicStop = useCallback(async () => {
    setIsTranscribing(true);
    const transcribedText = await stopRecordingAndTranscribe();
    if (transcribedText.trim()) {
      setInputText(prev => prev ? `${prev} ${transcribedText.trim()}` : transcribedText.trim());
    }
    setIsTranscribing(false);
  }, [stopRecordingAndTranscribe]);

  useEffect(() => {
    return () => {
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => { });
      }
    };
  }, []);

  const onSend = () => {
    sendMessage(inputText);
  };

  const onGoBack = async () => {
    // メッセージが何もなければただ戻る
    if (messages.length === 0) {
      router.back();
      return;
    }
    // メッセージがある場合は自動で要約・保存してからホームへ
    await saveJournal();
  };

  const saveJournal = async () => {
    setFinishing(true);
    console.log('Summarizing journal with OpenAI...');
    try {
      const systemPrompt = `
You are a helpful assistant that summarizes daily journals.
Based on the conversation provided, generate a JSON object with the following fields:
- title: A short, catchy title for the day in Japanese (e.g. "\u672c\u6c17\u3067\u4f5c\u3063\u305f\u65e5"). Max 20 chars.
- summary: A direct, honest first-person summary in Japanese. Be frank, strategic, and insightful. Max 200 chars.
- today_tasks: Array of strings. Each string is one thing they did today with a short honest evaluation (e.g. ["Supabase\u5b9f\u88c5 \u2014 \u8a2d\u8a08\u304c\u7518\u304b\u3063\u305f\u304c\u7a81\u7834\u529b\u306f\u3042\u3063\u305f"]).
- tomorrow_tasks: Array of strings. Concrete, prioritized actions for tomorrow based on the conversation (e.g. ["BIS\u30a2\u30d7\u30ea\u306e\u30de\u30fc\u30b1\u30c3\u30c8\u3092A4\u30671\u679a\u306b\u307e\u3068\u3081\u308b"]).
- mood_color: A hex color code representing the mood (e.g. "#FFD700" for energetic, "#4682B4" for calm, "#FF6B6B" for stressed).
- mood_score: A number between 0 and 100 representing the mood level (0 for very low/depressed, 50 for neutral, 100 for very high/happy).

Format the response strictly as valid JSON. No markdown.
      `;
      const chatContent = messages.map(m => `${m.role === 'user' ? 'User' : 'Listener'}: ${m.content}`).join('\n');
      const res = await openaiChat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: chatContent }
      ]);

      console.log('GPT response received');
      let details;
      try {
        const jsonStr = res.replace(/```json|```/g, '').trim();
        details = JSON.parse(jsonStr);
      } catch (e) {
        console.error('Failed to parse GPT response as JSON', res);
        details = {
          title: 'Daily Journal',
          summary: messages.filter(m => m.role === 'user').map(m => m.content).join(' ').substring(0, 200),
          today_tasks: ['- Had a conversation'],
          tomorrow_tasks: [],
          mood_color: '#BDBDBD',
          mood_score: 50
        };
      }

      const today = displayDate;
      const dateKey = dateParam ?? `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      console.log('Upserting to Supabase...', dateKey);
      const { error } = await upsertJournal({
        id: journalId, // IDがあればそのレコードを更新、なければ新規作成
        date: dateKey,
        text: details.title,
        summary: details.summary,
        today_tasks: details.today_tasks ?? [],
        tomorrow_tasks: details.tomorrow_tasks ?? [],
        mood_color: details.mood_color,
        mood_score: details.mood_score ?? 50,
        messages: messages as any,
        listener_id: selectedListener,
        listener_name: listener.name,
      });

      if (error) {
        console.error('Supabase error:', error);
        Alert.alert('保存エラー', error);
        setFinishing(false);
      } else {
        console.log('Journal saved successfully');
        router.replace('/(tabs)');
      }
    } catch (e) {
      console.error('Finish process error:', e);
      Alert.alert('エラー', '保存に失敗しました');
      setFinishing(false);
    }
  };

  return (
    <View className="screen-chat" style={{ flex: 1, paddingTop: insets.top }}>
      {/* 保存中オーバーレイ */}
      {finishing && (
        <View style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(255,255,255,0.85)',
          zIndex: 999,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
        }}>
          <ActivityIndicator size="large" color="#333" />
          <Text style={{ fontSize: 15, color: '#333', fontWeight: '600' }}>ジャーナルをまとめ中...</Text>
        </View>
      )}

      <View className="header-chat">
        <Pressable onPress={onGoBack} className="header-back-chat" disabled={finishing}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </Pressable>
        <Text className="header-date-chat">
          {isEditMode ? `${dateStr} (編集中)` : dateStr}
        </Text>
        {/* 右側に保存キャプション or 空のスペース */}
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="keyboard-chat"
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollRef}
          className="scroll-chat"
          contentContainerStyle={{
            paddingTop: 16,
            paddingBottom: 20,
          }}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        >
          <View className="today-section-chat">
            <Text className="today-title-chat">Today</Text>
            <Text className="today-date-chat">{fullDateStr}</Text>
          </View>

          <Text className="listener-label-chat">
            Listener
          </Text>
          <View className="listener-row-chat">
            {LISTENERS.map((l) => (
              <Pressable
                key={l.id}
                onPress={() => setSelectedListener(l.id)}
                className={`listener-item-chat ${selectedListener === l.id ? 'listener-item-chat--selected' : ''}`}
              >
                <View
                  className="listener-avatar-chat"
                  style={{ backgroundColor: l.color }}
                >
                  <Ionicons name={l.icon} size={28} color="#fff" />
                </View>
                <Text
                  className={`listener-name-chat ${selectedListener === l.id ? 'listener-name-chat--selected' : ''}`}
                >
                  {l.name}
                </Text>
              </Pressable>
            ))}
          </View>

          {messages.length > 0 && (
            <View className="messages-chat">
              {messages.map((m) => (
                <View key={m.id} className={`message-row-chat ${m.role === 'user' ? 'message-row-chat--user' : 'message-row-chat--assistant'}`}>
                  {m.role === 'assistant' && (
                    <View className="message-meta-chat">
                      <View
                        className="message-avatar-chat"
                        style={{ backgroundColor: listener.color }}
                      >
                        <Ionicons name={listener.icon} size={16} color="#fff" />
                      </View>
                      <Text className="message-time-chat">{m.time}</Text>
                    </View>
                  )}
                  <View
                    className={`message-bubble-chat ${m.role === 'user' ? 'message-bubble-chat--user' : 'message-bubble-chat--assistant'}`}
                  >
                    <Text className="message-content-chat">{m.content}</Text>
                    {m.role === 'assistant' && m.content.length > 150 && (
                      <Text className="message-more-chat">View More</Text>
                    )}
                  </View>
                  {m.role === 'user' && (
                    <Text className="message-time-right-chat">{m.time}</Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {loading && (
            <View className="loading-row-chat">
              <View
                className="message-avatar-chat"
                style={{ backgroundColor: listener.color }}
              >
                <Ionicons name={listener.icon} size={16} color="#fff" />
              </View>
              <ActivityIndicator size="small" color="#666" />
            </View>
          )}
        </ScrollView>

        <View
          style={{
            paddingHorizontal: 16,
            paddingBottom: insets.bottom + 10,
            backgroundColor: 'transparent',
          }}
        >
          <AIChatInput
            value={inputText} // Added: Pass inputText as value
            onChangeText={setInputText} // Added: Update inputText on change
            onSend={(text) => {
              sendMessage(text);
              setInputText(''); // Modified: Clear inputText after sending
              Keyboard.dismiss();
            }}
            onMicStart={startRecording}
            onMicStop={handleMicStop}
            isRecording={recording}
            isTranscribing={isTranscribing}
            listenerColor={listener.color}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
