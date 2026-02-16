import { useTheme } from '@/context/ThemeContext';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Icon } from '@iconify/react';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = Math.min(SCREEN_WIDTH * 0.8, 300);

interface Props {
    visible: boolean;
    onClose: () => void;
}

const MENU_ITEMS = [
    { name: 'index', label: 'Today', icon: 'mdi:calendar-today', path: '/' },
    { name: 'explore', label: 'Week', icon: 'mdi:calendar-week', path: '/explore' },
];

export default function Sidebar({ visible, onClose }: Props) {
    const colors = useThemeColors();
    const { theme, setTheme } = useTheme();
    const router = useRouter();
    const pathname = usePathname();
    const isWeb = Platform.OS === 'web';

    const [anim] = React.useState(new Animated.Value(0));

    React.useEffect(() => {
        Animated.timing(anim, {
            toValue: visible ? 1 : 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [visible]);

    if (!visible && (anim as any)._value === 0) return null;

    const translateX = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [-SIDEBAR_WIDTH, 0],
    });

    const backdropOpacity = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    const handleNavigate = (path: string) => {
        router.push(path as any);
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
            <View style={styles.container}>
                <Animated.View
                    style={[
                        styles.backdrop,
                        {
                            opacity: backdropOpacity,
                            backgroundColor: 'rgba(0,0,0,0.4)',
                        }
                    ]}
                >
                    <Pressable style={styles.flex1} onPress={onClose} />
                </Animated.View>

                <Animated.View
                    style={[
                        styles.sidebar,
                        {
                            width: SIDEBAR_WIDTH,
                            backgroundColor: colors.card,
                            transform: [{ translateX }],
                        }
                    ]}
                >
                    <View style={[styles.header, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
                            {process.env.EXPO_PUBLIC_APP_NAME || 'Plana'}
                        </Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            {isWeb ? (
                                <Icon icon="mdi:close" width={22} color={colors.mutedForeground} />
                            ) : (
                                <Text style={{ color: colors.mutedForeground, fontSize: 22 }}>✕</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.menuList}>
                        {MENU_ITEMS.map((item) => {
                            const isActive = pathname === item.path || (item.path === '/' && pathname === '/(tabs)');
                            return (
                                <TouchableOpacity
                                    key={item.name}
                                    onPress={() => handleNavigate(item.path)}
                                    style={[
                                        styles.menuItem,
                                        isActive && { backgroundColor: colors.primary + '15' }
                                    ]}
                                >
                                    {isWeb ? (
                                        <Icon
                                            icon={item.icon}
                                            width={24}
                                            color={isActive ? colors.primary : colors.mutedForeground}
                                        />
                                    ) : (
                                        <Text style={{ fontSize: 20 }}>{item.name === 'index' ? '📅' : '📆'}</Text>
                                    )}
                                    <Text
                                        style={[
                                            styles.menuLabel,
                                            { color: isActive ? colors.primary : colors.foreground },
                                            isActive && styles.menuLabelActive
                                        ]}
                                    >
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <View style={[styles.footer, { borderTopColor: colors.border }]}>
                        <View style={[styles.themeToggle, { backgroundColor: colors.muted }]}>
                            <TouchableOpacity
                                onPress={() => setTheme('light')}
                                style={[styles.themeBtn, theme === 'light' && { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}
                            >
                                <Icon icon="mdi:white-balance-sunny" width={18} color={theme === 'light' ? colors.primary : colors.mutedForeground} />
                                <Text style={[styles.themeBtnLabel, { color: theme === 'light' ? colors.primary : colors.mutedForeground }]}>Light</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setTheme('dark')}
                                style={[styles.themeBtn, theme === 'dark' && { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}
                            >
                                <Icon icon="mdi:moon-waning-crescent" width={18} color={theme === 'dark' ? colors.primary : colors.mutedForeground} />
                                <Text style={[styles.themeBtnLabel, { color: theme === 'dark' ? colors.primary : colors.mutedForeground }]}>Dark</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setTheme('system')}
                                style={[styles.themeBtn, theme === 'system' && { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}
                            >
                                <Icon icon="mdi:laptop-mac" width={18} color={theme === 'system' ? colors.primary : colors.mutedForeground} />
                                <Text style={[styles.themeBtnLabel, { color: theme === 'system' ? colors.primary : colors.mutedForeground }]}>System</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={[styles.versionText, { color: colors.mutedForeground }]}>v1.0.0</Text>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
    },
    flex1: { flex: 1 },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    sidebar: {
        height: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 16,
    },
    header: {
        paddingTop: 12,
        paddingHorizontal: 20,
        paddingBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    closeBtn: { padding: 4 },
    menuList: {
        padding: 12,
        gap: 4,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
    },
    menuLabel: {
        fontSize: 15,
        fontWeight: '600',
    },
    menuLabelActive: {
        fontWeight: '800',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        borderTopWidth: 1,
        alignItems: 'center',
    },
    versionText: {
        fontSize: 12,
        fontWeight: '500',
        marginTop: 12,
    },
    themeToggle: {
        flexDirection: 'row',
        padding: 4,
        borderRadius: 10,
        width: '100%',
        gap: 4,
    },
    themeBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    themeBtnLabel: {
        fontSize: 12,
        fontWeight: '700',
    },
});
