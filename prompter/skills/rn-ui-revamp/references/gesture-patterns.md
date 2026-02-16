# Gesture Patterns Reference

Complex gesture compositions for advanced interactions.

## Simultaneous Gestures

```tsx
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

// Pan + Pinch for image viewer
const ImageViewer = ({ source }: { source: ImageSource }) => {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (scale.value < 1) {
        scale.value = withSpring(1);
        savedScale.value = 1;
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      }
    });

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (scale.value > 1) {
        translateX.value = savedTranslateX.value + e.translationX;
        translateY.value = savedTranslateY.value + e.translationY;
      }
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1) {
        scale.value = withSpring(1);
        savedScale.value = 1;
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      } else {
        scale.value = withSpring(2);
        savedScale.value = 2;
      }
    });

  const composedGesture = Gesture.Simultaneous(
    Gesture.Race(doubleTapGesture, panGesture),
    pinchGesture
  );

  const imageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.Image source={source} style={[styles.image, imageStyle]} />
    </GestureDetector>
  );
};
```

## Exclusive Gestures

```tsx
// Long press OR tap (mutually exclusive)
const PressableItem = ({ onTap, onLongPress }: Props) => {
  const scale = useSharedValue(1);
  const isLongPressing = useSharedValue(false);

  const longPressGesture = Gesture.LongPress()
    .minDuration(500)
    .onStart(() => {
      isLongPressing.value = true;
      scale.value = withSpring(0.95);
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
    })
    .onEnd(() => {
      isLongPressing.value = false;
      scale.value = withSpring(1);
      runOnJS(onLongPress)();
    });

  const tapGesture = Gesture.Tap()
    .onEnd(() => {
      if (!isLongPressing.value) {
        runOnJS(onTap)();
      }
    });

  const composed = Gesture.Exclusive(longPressGesture, tapGesture);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={style}>{children}</Animated.View>
    </GestureDetector>
  );
};
```

## Rotational Gestures

```tsx
const RotatableElement = () => {
  const rotation = useSharedValue(0);
  const savedRotation = useSharedValue(0);

  const rotationGesture = Gesture.Rotation()
    .onUpdate((e) => {
      rotation.value = savedRotation.value + e.rotation;
    })
    .onEnd(() => {
      savedRotation.value = rotation.value;
    });

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}rad` }],
  }));

  return (
    <GestureDetector gesture={rotationGesture}>
      <Animated.View style={style}>{children}</Animated.View>
    </GestureDetector>
  );
};
```

## Fling Gestures

```tsx
// Card swipe with fling detection
const SwipeableCard = ({ onSwipeLeft, onSwipeRight }: Props) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const flingRightGesture = Gesture.Fling()
    .direction(Directions.RIGHT)
    .onEnd(() => {
      translateX.value = withSpring(SCREEN_WIDTH + 100);
      runOnJS(onSwipeRight)();
    });

  const flingLeftGesture = Gesture.Fling()
    .direction(Directions.LEFT)
    .onEnd(() => {
      translateX.value = withSpring(-SCREEN_WIDTH - 100);
      runOnJS(onSwipeLeft)();
    });

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY * 0.5;
    })
    .onEnd((e) => {
      if (Math.abs(e.velocityX) > 500) {
        const direction = e.velocityX > 0 ? 1 : -1;
        translateX.value = withSpring(direction * (SCREEN_WIDTH + 100));
        runOnJS(direction > 0 ? onSwipeRight : onSwipeLeft)();
      } else if (Math.abs(e.translationX) > SCREEN_WIDTH * 0.4) {
        const direction = e.translationX > 0 ? 1 : -1;
        translateX.value = withSpring(direction * (SCREEN_WIDTH + 100));
        runOnJS(direction > 0 ? onSwipeRight : onSwipeLeft)();
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const composed = Gesture.Race(flingLeftGesture, flingRightGesture, panGesture);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${interpolate(translateX.value, [-200, 0, 200], [-15, 0, 15])}deg` },
    ],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[styles.card, cardStyle]}>{children}</Animated.View>
    </GestureDetector>
  );
};
```

## Native Driver Scroll Integration

```tsx
// Gesture that works with ScrollView
const ScrollAwareGesture = () => {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  const panGesture = Gesture.Pan()
    .activeOffsetY([-20, 20]) // Only activate after 20px vertical movement
    .onUpdate((e) => {
      // Custom pan logic
    });

  const nativeGesture = Gesture.Native().withRef(scrollRef);
  
  // Allow scroll to work while custom pan is active
  const composed = Gesture.Simultaneous(panGesture, nativeGesture);

  return (
    <GestureDetector gesture={composed}>
      <Animated.ScrollView ref={scrollRef} onScroll={scrollHandler}>
        {children}
      </Animated.ScrollView>
    </GestureDetector>
  );
};
```

## Manual Gesture Activation

```tsx
// Gesture that requires explicit activation
const ControlledDrag = () => {
  const isEnabled = useSharedValue(false);
  const translateX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .manualActivation(true)
    .onTouchesMove((e, state) => {
      if (isEnabled.value) {
        state.activate();
      }
    })
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd(() => {
      translateX.value = withSpring(0);
    });

  const enableDrag = () => {
    isEnabled.value = true;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View>
      <Button title="Enable Drag" onPress={enableDrag} />
      <GestureDetector gesture={panGesture}>
        <Animated.View style={animatedStyle}>{children}</Animated.View>
      </GestureDetector>
    </View>
  );
};
```
