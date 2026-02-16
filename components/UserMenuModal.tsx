import { useThemeColors } from '@/hooks/useThemeColors';
import { useClerk, useUser } from '@clerk/clerk-expo';
import { Icon } from '@iconify/react';
import React from 'react';
import {
    Animated,
    Dimensions,
    Image,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
    visible: boolean;
    onClose: () => void;
}

export default function UserMenuModal({ visible, onClose }: Props) {
    const { user } = useUser();
    const { signOut } = useClerk();
    const colors = useThemeColors();
    const isWeb = Platform.OS === 'web';

    const [anim] = React.useState(new Animated.Value(0));

    React.useEffect(() => {
        Animated.spring(anim, {
            toValue: visible ? 1 : 0,
            tension: 50,
            friction: 8,
            useNativeDriver: true,
        }).start();
    }, [visible]);

    if (!visible && (anim as any)._value === 0) return null;

    const handleSignOut = async () => {
        try {
            await signOut();
            onClose();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const translateY = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [SCREEN_HEIGHT, 0],
    });

    const backdropOpacity = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
            <View style={styles.container}>
                <Animated.View
                    style={[
                        styles.backdrop,
                        {
                            opacity: backdropOpacity,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                        }
                    ]}
                >
                    <Pressable style={styles.flex1} onPress={onClose} />
                </Animated.View>

                <Animated.View
                    style={[
                        styles.sheet,
                        {
                            backgroundColor: colors.card,
                            transform: [{ translateY }],
                        }
                    ]}
                >
                    <View style={[styles.handle, { backgroundColor: colors.border }]} />

                    <View style={styles.header}>
                        <View style={[styles.avatarContainer, { borderColor: colors.border }]}>
                            {user?.imageUrl ? (
                                <Image source={{ uri: user.imageUrl }} style={styles.avatarImage} />
                            ) : (
                                <View style={[styles.avatarFallback, { backgroundColor: colors.primary }]}>
                                    <Text style={styles.avatarText}>{user?.firstName?.[0] || 'U'}</Text>
                                </View>
                            )}
                        </View>
                        <View style={styles.userInfo}>
                            <Text style={[styles.userName, { color: colors.foreground }]}>
                                {user?.fullName || 'User'}
                            </Text>
                            <Text style={[styles.userEmail, { color: colors.mutedForeground }]}>
                                {user?.primaryEmailAddress?.emailAddress}
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    <View style={styles.menuItems}>
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => {
                                // In a real app, you might navigate to a profile screen
                                onClose();
                            }}
                        >
                            <View style={[styles.iconBox, { backgroundColor: colors.muted }]}>
                                <Icon icon="mdi:account-outline" width={20} color={colors.foreground} />
                            </View>
                            <Text style={[styles.menuItemLabel, { color: colors.foreground }]}>Manage account</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
                            <View style={[styles.iconBox, { backgroundColor: colors.destructive + '15' }]}>
                                <Icon icon="mdi:logout" width={20} color={colors.destructive} />
                            </View>
                            <Text style={[styles.menuItemLabel, { color: colors.destructive }]}>Sign out</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    flex1: { flex: 1 },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    sheet: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 20,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 20,
        gap: 16,
    },
    avatarContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        overflow: 'hidden',
        borderWidth: 1,
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    avatarFallback: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '700',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 2,
    },
    userEmail: {
        fontSize: 14,
    },
    divider: {
        height: 1,
        marginHorizontal: 24,
        marginBottom: 16,
    },
    menuItems: {
        paddingHorizontal: 16,
        gap: 8,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        gap: 12,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuItemLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
});
