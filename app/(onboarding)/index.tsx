import { useThemeColors } from '@/hooks/useThemeColors';
import { useAuth } from '@clerk/clerk-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    Image,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    Extrapolation,
    interpolate,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const SLIDES = [
    {
        key: 'schedule',
        title: 'Master Your Schedule',
        description: 'Transform your daily chaos into structured productivity with our intuitive time-blocking system.',
        image: require('@/assets/images/onboarding_schedule.png'),
    },
    {
        key: 'focus',
        title: 'Deep Focus Work',
        description: 'Enter a state of flow with dedicated focus modes designed to eliminate distractions.',
        image: require('@/assets/images/onboarding_focus.png'),
    },
    {
        key: 'habits',
        title: 'Build Lasting Habits',
        description: 'Track your consistency and build powerful routines that stick, one day at a time.',
        image: require('@/assets/images/onboarding_habits.png'),
    },
];

const ONBOARDING_KEY = 'hasOnboarded';

export default function OnboardingScreen() {
    const router = useRouter();
    const colors = useThemeColors();
    const { isSignedIn } = useAuth();
    const scrollX = useSharedValue(0);

    const flatListRef = React.useRef<Animated.FlatList<any>>(null);
    const [currentIndex, setCurrentIndex] = React.useState(0);

    const onScroll = useAnimatedScrollHandler((event) => {
        scrollX.value = event.contentOffset.x;
    });

    // Update current index based on scroll position to handle button logic
    const onViewableItemsChanged = React.useRef(({ viewableItems }: { viewableItems: any[] }) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    const handlePress = async () => {
        if (currentIndex < SLIDES.length - 1) {
            flatListRef.current?.scrollToIndex({
                index: currentIndex + 1,
                animated: true,
            });
        } else {
            try {
                await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
                if (isSignedIn) {
                    router.replace('/(tabs)');
                } else {
                    router.replace('/(auth)/sign-up');
                }
            } catch (e) {
                console.error('Failed to save onboarding status', e);
                if (isSignedIn) {
                    router.replace('/(tabs)');
                } else {
                    router.replace('/(auth)/sign-up');
                }
            }
        }
    };

    const Slide = ({ item, index }: { item: typeof SLIDES[0]; index: number }) => {
        const animatedStyle = useAnimatedStyle(() => {
            const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

            const rotateY = interpolate(
                scrollX.value,
                inputRange,
                [90, 0, -90],
                Extrapolation.CLAMP
            );

            const opacity = interpolate(
                scrollX.value,
                inputRange,
                [0, 1, 0],
                Extrapolation.CLAMP
            );

            const translateX = interpolate(
                scrollX.value,
                inputRange,
                [width / 2, 0, -width / 2],
                Extrapolation.CLAMP
            );

            return {
                opacity,
                transform: [
                    { perspective: 1000 },
                    { translateX },
                    { rotateY: `${rotateY}deg` },
                ],
            };
        });

        return (
            <View style={[styles.slideContainer, { backgroundColor: colors.background }]}>
                <Animated.View style={[styles.slideContent, animatedStyle]}>
                    <View style={styles.imageContainer}>
                        <Image
                            source={item.image}
                            style={styles.image}
                            resizeMode="contain"
                        />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={[styles.title, { color: colors.foreground }]}>{item.title}</Text>
                        <Text style={[styles.description, { color: colors.mutedForeground }]}>
                            {item.description}
                        </Text>
                    </View>
                </Animated.View>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Animated.FlatList
                ref={flatListRef}
                data={SLIDES}
                keyExtractor={(item) => item.key}
                renderItem={({ item, index }) => <Slide item={item} index={index} />}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={onScroll}
                scrollEventThrottle={16}
                bounces={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
            />

            <View style={styles.footer}>
                <View style={styles.pagination}>
                    {SLIDES.map((_, index) => {
                        const animatedDotStyle = useAnimatedStyle(() => {
                            const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
                            const opacity = interpolate(
                                scrollX.value,
                                inputRange,
                                [0.4, 1, 0.4],
                                Extrapolation.CLAMP
                            );
                            const scale = interpolate(
                                scrollX.value,
                                inputRange,
                                [0.8, 1.2, 0.8],
                                Extrapolation.CLAMP
                            );
                            return {
                                opacity,
                                transform: [{ scale }],
                                backgroundColor: colors.primary,
                            };
                        });
                        return <Animated.View key={index} style={[styles.dot, animatedDotStyle]} />;
                    })}
                </View>

                <TouchableOpacity
                    onPress={handlePress}
                    style={[styles.button, { backgroundColor: colors.primary }]}
                >
                    <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>
                        {currentIndex === SLIDES.length - 1 ? "Get Started" : "Next"}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    slideContainer: {
        width,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    slideContent: {
        width: width,
        height: '100%', // Use percentage instead of absolute height to fill container
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    imageContainer: {
        width: width * 0.8,
        height: width * 0.8,
        marginBottom: 40,
        justifyContent: 'center',
        alignItems: 'center',
        // Removed shadows for cleaner look with vintage line art
    },
    image: {
        width: '100%',
        height: '100%',
    },
    textContainer: {
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 16,
        textAlign: 'center',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'center',
        maxWidth: '90%',
    },
    footer: {
        padding: 24,
        gap: 24,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    button: {
        height: 56,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '700',
    },
});
