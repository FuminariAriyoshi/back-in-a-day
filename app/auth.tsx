import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AuthScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { signIn, signUp } = useAuth();

    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const handleSubmit = async () => {
        setError(null);
        setSuccessMsg(null);

        if (!email.trim() || !password.trim()) {
            setError('メールアドレスとパスワードを入力してください');
            return;
        }

        if (!isLogin && password !== confirmPassword) {
            setError('パスワードが一致しません');
            return;
        }

        if (password.length < 6) {
            setError('パスワードは6文字以上にしてください');
            return;
        }

        setLoading(true);
        try {
            if (isLogin) {
                const { error } = await signIn(email.trim(), password);
                if (error) {
                    setError(error);
                } else {
                    router.replace('/(tabs)');
                }
            } else {
                const { error } = await signUp(email.trim(), password);
                if (error) {
                    setError(error);
                } else {
                    setSuccessMsg('確認メールを送信しました。メールを確認してください。');
                    setIsLogin(true);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View
                style={{
                    flex: 1,
                    backgroundColor: '#0a0a0a',
                    paddingTop: insets.top + 40,
                    paddingBottom: insets.bottom + 40,
                    paddingHorizontal: 28,
                    justifyContent: 'center',
                }}
            >
                {/* ロゴ・タイトル */}
                <View style={{ alignItems: 'center', marginBottom: 48 }}>
                    <View
                        style={{
                            width: 72,
                            height: 72,
                            borderRadius: 36,
                            backgroundColor: '#1a1a1a',
                            borderWidth: 1,
                            borderColor: '#2a2a2a',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 20,
                        }}
                    >
                        <Text style={{ fontSize: 32 }}>✦</Text>
                    </View>
                    <Text
                        style={{
                            fontSize: 28,
                            fontWeight: '700',
                            color: '#ffffff',
                            letterSpacing: -0.5,
                            marginBottom: 8,
                        }}
                    >
                        Back in a Day
                    </Text>
                    <Text style={{ fontSize: 15, color: '#888', textAlign: 'center' }}>
                        {isLogin ? 'アカウントにサインイン' : '新しいアカウントを作成'}
                    </Text>
                </View>

                {/* タブ切り替え */}
                <View
                    style={{
                        flexDirection: 'row',
                        backgroundColor: '#1a1a1a',
                        borderRadius: 12,
                        padding: 4,
                        marginBottom: 32,
                    }}
                >
                    <TouchableOpacity
                        style={{
                            flex: 1,
                            paddingVertical: 10,
                            borderRadius: 9,
                            backgroundColor: isLogin ? '#ffffff' : 'transparent',
                            alignItems: 'center',
                        }}
                        onPress={() => { setIsLogin(true); setError(null); setSuccessMsg(null); }}
                        activeOpacity={0.8}
                    >
                        <Text
                            style={{
                                fontSize: 14,
                                fontWeight: '600',
                                color: isLogin ? '#0a0a0a' : '#666',
                            }}
                        >
                            サインイン
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{
                            flex: 1,
                            paddingVertical: 10,
                            borderRadius: 9,
                            backgroundColor: !isLogin ? '#ffffff' : 'transparent',
                            alignItems: 'center',
                        }}
                        onPress={() => { setIsLogin(false); setError(null); setSuccessMsg(null); }}
                        activeOpacity={0.8}
                    >
                        <Text
                            style={{
                                fontSize: 14,
                                fontWeight: '600',
                                color: !isLogin ? '#0a0a0a' : '#666',
                            }}
                        >
                            サインアップ
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* フォーム */}
                <View style={{ gap: 12 }}>
                    <View>
                        <Text style={{ fontSize: 12, fontWeight: '600', color: '#888', marginBottom: 8, letterSpacing: 0.5 }}>
                            メールアドレス
                        </Text>
                        <TextInput
                            style={{
                                backgroundColor: '#1a1a1a',
                                borderWidth: 1,
                                borderColor: '#2a2a2a',
                                borderRadius: 12,
                                paddingHorizontal: 16,
                                paddingVertical: 14,
                                fontSize: 15,
                                color: '#ffffff',
                            }}
                            placeholder="you@example.com"
                            placeholderTextColor="#555"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            autoCorrect={false}
                            returnKeyType="next"
                        />
                    </View>

                    <View>
                        <Text style={{ fontSize: 12, fontWeight: '600', color: '#888', marginBottom: 8, letterSpacing: 0.5 }}>
                            パスワード
                        </Text>
                        <TextInput
                            style={{
                                backgroundColor: '#1a1a1a',
                                borderWidth: 1,
                                borderColor: '#2a2a2a',
                                borderRadius: 12,
                                paddingHorizontal: 16,
                                paddingVertical: 14,
                                fontSize: 15,
                                color: '#ffffff',
                            }}
                            placeholder="6文字以上"
                            placeholderTextColor="#555"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            returnKeyType={isLogin ? "done" : "next"}
                            onSubmitEditing={isLogin ? handleSubmit : undefined}
                        />
                    </View>

                    {!isLogin && (
                        <View>
                            <Text style={{ fontSize: 12, fontWeight: '600', color: '#888', marginBottom: 8, letterSpacing: 0.5 }}>
                                パスワード（確認）
                            </Text>
                            <TextInput
                                style={{
                                    backgroundColor: '#1a1a1a',
                                    borderWidth: 1,
                                    borderColor: '#2a2a2a',
                                    borderRadius: 12,
                                    paddingHorizontal: 16,
                                    paddingVertical: 14,
                                    fontSize: 15,
                                    color: '#ffffff',
                                }}
                                placeholder="もう一度入力"
                                placeholderTextColor="#555"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                                returnKeyType="done"
                                onSubmitEditing={handleSubmit}
                            />
                        </View>
                    )}
                </View>

                {/* エラー・成功メッセージ */}
                {error && (
                    <View
                        style={{
                            marginTop: 16,
                            padding: 14,
                            backgroundColor: '#2a1a1a',
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: '#5a2a2a',
                        }}
                    >
                        <Text style={{ fontSize: 13, color: '#ff6b6b' }}>{error}</Text>
                    </View>
                )}
                {successMsg && (
                    <View
                        style={{
                            marginTop: 16,
                            padding: 14,
                            backgroundColor: '#1a2a1a',
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: '#2a5a2a',
                        }}
                    >
                        <Text style={{ fontSize: 13, color: '#6bff6b' }}>{successMsg}</Text>
                    </View>
                )}

                {/* 送信ボタン */}
                <Pressable
                    style={({ pressed }) => ({
                        marginTop: 24,
                        backgroundColor: pressed ? '#e0e0e0' : '#ffffff',
                        borderRadius: 14,
                        paddingVertical: 16,
                        alignItems: 'center',
                        opacity: loading ? 0.7 : 1,
                    })}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#0a0a0a" />
                    ) : (
                        <Text style={{ fontSize: 16, fontWeight: '700', color: '#0a0a0a' }}>
                            {isLogin ? 'サインイン' : 'アカウント作成'}
                        </Text>
                    )}
                </Pressable>
            </View>
        </KeyboardAvoidingView>
    );
}
