import React, { useCallback } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';
import Activity from '../../model/Activity';
import ActivityCard from '../ActivityCard';

const SPRING_CONFIG = {
    damping: 15,
    stiffness: 200,
    mass: 1,
};

interface DraggableActivityProps {
    activity: Activity;
    onDragStart?: (activity: Activity) => void;
    onDragEnd?: (activity: Activity, absoluteY: number) => void;
    onDragCancel?: () => void;
}

export default function DraggableActivity({
    activity,
    onDragStart,
    onDragEnd,
    onDragCancel,
}: DraggableActivityProps) {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const scale = useSharedValue(1);
    const rotation = useSharedValue(0);
    const zIndex = useSharedValue(0);
    const opacity = useSharedValue(1);
    const isDragging = useSharedValue(false);
    const startY = useSharedValue(0);

    const handleDragStart = useCallback(() => {
        if (onDragStart) onDragStart(activity);
    }, [activity, onDragStart]);

    const handleDragEnd = useCallback(
        (absY: number) => {
            if (onDragEnd) onDragEnd(activity, absY);
        },
        [activity, onDragEnd],
    );

    const handleDragCancel = useCallback(() => {
        if (onDragCancel) onDragCancel();
    }, [onDragCancel]);

    const longPressGesture = Gesture.LongPress()
        .minDuration(300)
        .onStart(() => {
            isDragging.value = true;
            scale.value = withSpring(1.05, SPRING_CONFIG);
            rotation.value = withSpring(-2, SPRING_CONFIG);
            zIndex.value = 100;
            runOnJS(handleDragStart)();
        });

    const panGesture = Gesture.Pan()
        .activateAfterLongPress(300)
        .onStart(e => {
            isDragging.value = true;
            startY.value = e.absoluteY;
            scale.value = withSpring(1.05, SPRING_CONFIG);
            rotation.value = withSpring(-2, SPRING_CONFIG);
            zIndex.value = 100;
            runOnJS(handleDragStart)();
        })
        .onUpdate(e => {
            translateX.value = e.translationX;
            translateY.value = e.translationY;
        })
        .onEnd(e => {
            const absY = e.absoluteY;
            // Reset visual state
            translateX.value = withSpring(0, SPRING_CONFIG);
            translateY.value = withSpring(0, SPRING_CONFIG);
            scale.value = withSpring(1, SPRING_CONFIG);
            rotation.value = withSpring(0, SPRING_CONFIG);
            zIndex.value = 0;
            isDragging.value = false;

            runOnJS(handleDragEnd)(absY);
        })
        .onFinalize(() => {
            translateX.value = withSpring(0, SPRING_CONFIG);
            translateY.value = withSpring(0, SPRING_CONFIG);
            scale.value = withSpring(1, SPRING_CONFIG);
            rotation.value = withSpring(0, SPRING_CONFIG);
            zIndex.value = 0;
            isDragging.value = false;
        });

    const composedGesture = Gesture.Simultaneous(longPressGesture, panGesture);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value },
            { rotate: `${rotation.value}deg` },
        ],
        zIndex: zIndex.value,
        elevation: isDragging.value ? 20 : 0,
    }));

    return (
        <GestureDetector gesture={composedGesture}>
            <Animated.View style={animatedStyle}>
                <ActivityCard activity={activity} />
            </Animated.View>
        </GestureDetector>
    );
}
