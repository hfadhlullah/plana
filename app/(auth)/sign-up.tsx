
import { useThemeColors } from '@/hooks/useThemeColors';
import { useWarmUpBrowser } from '@/hooks/useWarmUpBrowser';
import { useOAuth } from '@clerk/clerk-expo';
import { Icon } from '@iconify/react';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

WebBrowser.maybeCompleteAuthSession();

export default function SignUpScreen() {
    useWarmUpBrowser();
    const router = useRouter();
    const colors = useThemeColors();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });

    const onGoogleSignUp = React.useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const { createdSessionId, signIn, signUp, setActive } = await startOAuthFlow();

            if (createdSessionId) {
                setActive && setActive({ session: createdSessionId });
            } else {
                // Use signIn or signUp for next steps such as MFA
                setError('Authentication incomplete. Please checking your account details.');
            }
        } catch (err: any) {
            console.error('OAuth error', err);
            setError('Failed to sign up with Google. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.foreground }]}>
                    Join {process.env.EXPO_PUBLIC_APP_NAME || 'Plana'}
                </Text>
                <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
                    Create an account to start your journey.
                </Text>
            </View>

            <View style={styles.content}>
                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <TouchableOpacity
                    onPress={onGoogleSignUp}
                    disabled={loading}
                    style={[styles.socialButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                    {loading ? (
                        <ActivityIndicator color={colors.foreground} />
                    ) : (
                        <>
                            <Icon icon="logos:google-icon" width={24} height={24} />
                            <Text style={[styles.socialButtonText, { color: colors.foreground }]}>
                                Sign Up with Google
                            </Text>
                        </>
                    )}
                </TouchableOpacity>

                {/* Removed manual email fields as per user request to only use Clerk/Social */}
            </View>

            <View style={styles.footer}>
                <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
                    Already have an account?
                </Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')}>
                    <Text style={[styles.linkText, { color: colors.primary }]}>Sign In</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 48,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 8,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
    },
    content: {
        gap: 16,
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 16,
    },
    socialButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    errorText: {
        color: '#E57373',
        textAlign: 'center',
        marginBottom: 16,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 40,
        gap: 8,
    },
    footerText: {
        fontSize: 14,
    },
    linkText: {
        fontSize: 14,
        fontWeight: '700',
    },
});
