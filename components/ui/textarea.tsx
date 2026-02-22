import { cn } from "@/lib/utils";
import * as React from "react";
import { Platform, TextInput } from "react-native";

// Detect if we are in a web environment to use the user's specific web structure
// but provide a fallback for native.
const Textarea = React.forwardRef<any, any>(
    ({ className, ...props }, ref) => {
        if (Platform.OS === 'web') {
            return (
                <textarea
                    className={cn(
                        "flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm shadow-black/5 transition-shadow placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50",
                        className,
                    )}
                    ref={ref}
                    {...props}
                />
            );
        }

        return (
            <TextInput
                className={cn(
                    "flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm shadow-black/5 placeholder:text-muted-foreground/70",
                    className,
                )}
                ref={ref}
                multiline
                textAlignVertical="top"
                placeholderTextColor="rgba(0,0,0,0.4)"
                {...props}
            />
        );
    }
);
Textarea.displayName = "Textarea";

export { Textarea };
