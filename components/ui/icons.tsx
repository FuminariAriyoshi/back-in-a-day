import * as React from "react";
import { Platform } from "react-native";
import { Line, Path, Svg } from "react-native-svg";

export const SendIcon = (props: any) => {
    if (Platform.OS === 'web') {
        return (
            <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                {...props}
            >
                <path
                    d="M12 5.25L12 18.75"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M18.75 12L12 5.25L5.25 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        );
    }
    return (
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
            <Path
                d="M12 5.25L12 18.75"
                stroke={props.color || "currentColor"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <Path
                d="M18.75 12L12 5.25L5.25 12"
                stroke={props.color || "currentColor"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
};

export const MicIcon = (props: any) => {
    if (Platform.OS === 'web') {
        return (
            <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.0"
                strokeLinecap="round"
                strokeLinejoin="round"
                {...props}
            >
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
            </svg>
        );
    }
    return (
        <Svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke={props.color || "currentColor"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <Path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <Path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <Line x1="12" y1="19" x2="12" y2="23" />
        </Svg>
    );
};
