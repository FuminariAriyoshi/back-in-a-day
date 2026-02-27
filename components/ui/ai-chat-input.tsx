import { Mic, Paperclip, Send } from "lucide-react-native";
import React, { useCallback, useRef } from "react";
import {
    Platform,
    Pressable,
    StyleSheet,
    TextInput,
    View,
} from "react-native";

interface AIChatInputProps {
    value: string;
    onChangeText: (text: string) => void;
    onSend?: (text: string) => void;
    onMicStart?: () => void;
    onMicStop?: () => void;
    isRecording?: boolean;
    isTranscribing?: boolean;
    listenerColor?: string;
}

const AIChatInput = ({
    value,
    onChangeText,
    onSend,
    onMicStart,
    onMicStop,
    isRecording = false,
    isTranscribing = false,
    listenerColor = "#6A3DE8",
}: AIChatInputProps) => {
    const inputRef = useRef<TextInput>(null);

    const handleSend = useCallback(() => {
        if (!value.trim()) return;
        onSend?.(value.trim());
    }, [value, onSend]);

    const handleMicToggle = useCallback(() => {
        if (isRecording) {
            onMicStop?.();
        } else {
            onMicStart?.();
        }
    }, [isRecording, onMicStart, onMicStop]);

    return (
        <View style={styles.container}>
            {/* Text Input area */}
            <TextInput
                ref={inputRef}
                style={[styles.textInput, Platform.OS === 'web' && { outlineWidth: 0 } as any]}
                value={isTranscribing ? "Thinking..." : value}
                onChangeText={onChangeText}
                placeholder={isTranscribing ? "Transcribing..." : "Start to talk!"}
                placeholderTextColor="#9CA3AF"
                multiline
                textAlignVertical="top"
                returnKeyType="default"
                underlineColorAndroid="transparent"
                selectionColor="#6A3DE8"
                editable={!isTranscribing}
            />

            {/* Bottom action row */}
            <View style={styles.actionRow}>
                {/* Attach button */}
                <Pressable style={styles.iconBtn} hitSlop={8} disabled={isTranscribing}>
                    <Paperclip size={20} color="#888" />
                </Pressable>

                <View style={styles.rightBtns}>
                    {/* Mic toggle button */}
                    <Pressable
                        style={[styles.iconBtn, isRecording && styles.micActiveBg]}
                        onPress={handleMicToggle}
                        hitSlop={8}
                        disabled={isTranscribing}
                    >
                        <Mic size={20} color={isRecording ? "#EF4444" : isTranscribing ? "#CCC" : "#555"} />
                    </Pressable>

                    {/* Send button */}
                    <Pressable
                        style={[
                            styles.sendBtn,
                            { backgroundColor: (value.trim() && !isTranscribing) ? listenerColor : "#18181B" },
                        ]}
                        onPress={handleSend}
                        hitSlop={8}
                        disabled={!value.trim() || isTranscribing}
                    >
                        <Send size={18} color="#fff" />
                    </Pressable>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        // PromptInput: rounded-3xl border p-2 bg-white
        backgroundColor: "#ffffff",
        borderRadius: 28,
        borderWidth: 1,
        borderColor: "#E5E7EB",  // border-input 相当
        paddingHorizontal: 8,
        paddingTop: 8,
        paddingBottom: 4,
        // shadow-xs 相当（控えめな影）
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
        elevation: 1,
    },
    textInput: {
        // PromptInputTextarea: min-h-[44px] text-primary bg-transparent border-none
        fontSize: 15,
        color: "#111827",
        minHeight: 44,
        maxHeight: 120,
        paddingHorizontal: 8,
        paddingVertical: 6,
        backgroundColor: "transparent",
        lineHeight: 22,
        // focus ring 完全排除
        borderWidth: 0,
    },
    actionRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 4,
        paddingTop: 6,
        paddingBottom: 2,
        borderTopWidth: 1,
        borderTopColor: "#F3F4F6",
    },
    rightBtns: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    iconBtn: {
        padding: 8,
        borderRadius: 100,
    },
    micActiveBg: {
        backgroundColor: "#FEF2F2",
    },
    sendBtn: {
        padding: 8,
        borderRadius: 100,
        alignItems: "center",
        justifyContent: "center",
    },
});

export { AIChatInput };
