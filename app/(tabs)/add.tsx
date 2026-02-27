import { AIChatInput } from '@/components/ui/ai-chat-input';
import { transcribeAudio } from '@/lib/openai';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
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
  const [recording, setRecording] = useState(false);
  const [inputText, setInputText] = useState('');
  const recordingRef = useRef<Audio.Recording | null>(null);

  const currentDate = new Date();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dateStr = `${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}`;
  const fullDateStr = `${monthNames[currentDate.getMonth()]}${currentDate.getDate()} ${currentDate.getFullYear()}`;

  const selectedListenerData = LISTENERS.find((l) => l.id === selectedListener) || LISTENERS[1];

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

  const handleMicStop = useCallback(async () => {
    const transcribedText = await stopRecordingAndTranscribe();
    if (transcribedText.trim()) {
      setInputText(prev => prev ? `${prev} ${transcribedText.trim()}` : transcribedText.trim());
    }
  }, [stopRecordingAndTranscribe]);

  const handleSend = useCallback((text: string) => {
    router.push({
      pathname: '/chat',
      params: {
        listenerId: selectedListener,
        initialText: text,
      },
    });
  }, [selectedListener, router]);

  useEffect(() => {
    return () => {
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => { });
      }
    };
  }, []);

  return (
    <View className="screen-add" style={{ flex: 1 }}>
      <ScrollView
        className="scroll-add"
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: 40,
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

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View
          style={{
            paddingHorizontal: 16,
            paddingBottom: insets.bottom + 10,
            backgroundColor: 'transparent',
          }}
        >
          <AIChatInput
            value={inputText}
            onChangeText={setInputText}
            onSend={() => {
              handleSend(inputText);
              setInputText('');
              Keyboard.dismiss();
            }}
            onMicStart={startRecording}
            onMicStop={handleMicStop}
            isRecording={recording}
            listenerColor={selectedListenerData.color}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
