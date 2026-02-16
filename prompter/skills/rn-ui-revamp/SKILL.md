---
name: rn-ui-revamp
description: React Native UI/UX revamp specialist. Use when improving visual polish, adding native-feel animations, enhancing gesture interactions, or making the app feel more like iOS/Android native apps. Covers navigation transitions, list animations, micro-interactions, and platform-specific patterns using Reanimated 4 and Gesture Handler.
---

# React Native UI/UX Revamp

Transform React Native apps to feel native with smooth animations and polished interactions.

## Quick Start

1. Identify component to revamp
2. Choose animation pattern from workflows below
3. Apply platform-specific adjustments (iOS HIG / Material Design)
4. Add haptic feedback for tactile polish

## Core Imports

```tsx
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
  withSequence, withDelay, interpolate, Extrapolation, runOnJS,
  FadeIn, FadeOut, SlideInRight, ZoomIn,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
```

## Timing & Spring Presets

```tsx
const TIMING = { instant: 100, fast: 200, normal: 300, slow: 500 };
const SPRING = {
  snappy: { damping: 15, stiffness: 300 },  // buttons, toggles
  bouncy: { damping: 10, stiffness: 200 },  // playful elements
  smooth: { damping: 20, stiffness: 150 },  // cards, modals
  gentle: { damping: 25, stiffness: 100 },  // page transitions
};
```

---

## Navigation Transitions

```tsx
// Expo Router stack with native feel
<Stack screenOptions={{
  animation: 'slide_from_right',
  gestureEnabled: true,
  cardShadowEnabled: true,
}}>
  <Stack.Screen name="modal" options={{
    presentation: 'modal',
    animation: 'slide_from_bottom',
  }} />
</Stack>
```

---

## List Animations

### Staggered Entry
```tsx
<Animated.View entering={FadeIn.delay(index * 50).springify()}>
  {children}
</Animated.View>
```

### Scroll-linked Header
```tsx
const headerStyle = useAnimatedStyle(() => ({
  height: interpolate(scrollY.value, [0, 150], [200, 60], Extrapolation.CLAMP),
}));
```

---

## Gesture Patterns

### Swipe-to-Delete
```tsx
const pan = Gesture.Pan()
  .onUpdate(e => { translateX.value = Math.min(0, e.translationX); })
  .onEnd(() => {
    if (translateX.value < -100) {
      translateX.value = withTiming(-SCREEN_WIDTH);
      runOnJS(onDelete)();
      runOnJS(Haptics.notificationAsync)(Haptics.NotificationFeedbackType.Success);
    } else {
      translateX.value = withSpring(0, SPRING.snappy);
    }
  });
```

### Drag-to-Reorder
```tsx
const pan = Gesture.Pan()
  .onStart(() => {
    isActive.value = true;
    runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
  })
  .onUpdate(e => { translateY.value = e.translationY; })
  .onEnd(() => {
    isActive.value = false;
    translateY.value = withSpring(0, SPRING.snappy);
  });
```

---

## Micro-Interactions

### Button Press
```tsx
const tap = Gesture.Tap()
  .onBegin(() => {
    scale.value = withSpring(0.95, SPRING.snappy);
    runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
  })
  .onFinalize(() => { scale.value = withSpring(1); })
  .onEnd(() => runOnJS(onPress)());
```

### Toggle Switch
```tsx
useEffect(() => {
  translateX.value = withSpring(value ? 20 : 0, SPRING.snappy);
}, [value]);
```

### Skeleton Shimmer
```tsx
shimmerX.value = withRepeat(withTiming(width * 2, { duration: 1500 }), -1, false);
```

---

## Bottom Sheet

```tsx
const pan = Gesture.Pan()
  .onUpdate(e => { if (e.translationY > 0) translateY.value = e.translationY; })
  .onEnd(e => {
    if (e.translationY > 100 || e.velocityY > 500) {
      translateY.value = withSpring(SCREEN_HEIGHT);
      runOnJS(onClose)();
    } else {
      translateY.value = withSpring(0, SPRING.smooth);
    }
  });
```

---

## Platform Patterns

### iOS
```tsx
// Blur header
<BlurView intensity={80} tint="light" />

// Action sheet with cancel button
<BottomSheet>
  {options.map(opt => <ActionItem />)}
  <CancelButton />
</BottomSheet>
```

### Android
```tsx
// Material ripple
<Pressable android_ripple={{ color: 'rgba(0,0,0,0.12)' }} />

// Elevated FAB
const style = useAnimatedStyle(() => ({
  elevation: isPressed.value ? 12 : 6,
}));
```

### Adaptive
```tsx
const AdaptiveButton = Platform.OS === 'android' ? MaterialButton : AnimatedButton;
```

---

## Haptics Quick Reference

```tsx
Haptics.selectionAsync();                                    // selection change
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);     // button tap
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);    // drag start
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);     // delete
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
```

---

## Performance Rules

1. Always use `useAnimatedStyle` - never inline animated styles
2. Prefer `withSpring` over `withTiming` - better interruption handling
3. Use `transform` over `width`/`height` - GPU accelerated
4. Set `scrollEventThrottle={16}` for scroll-linked animations
5. Use `entering`/`exiting` props for mount animations

```tsx
// Bad: layout thrash
{ width: width.value, height: height.value }

// Good: GPU transform
{ transform: [{ scaleX: scaleX.value }, { scaleY: scaleY.value }] }
```

---

## Resources

For complete implementations and advanced patterns:
- **Gesture compositions**: [references/gesture-patterns.md](references/gesture-patterns.md) - simultaneous, exclusive, fling, rotation, manual activation
- **Animation recipes**: [references/animation-recipes.md](references/animation-recipes.md) - counters, progress, loaders, expandable cards, shared elements, scroll-linked headers
