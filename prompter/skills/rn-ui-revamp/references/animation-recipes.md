# Animation Recipes

Copy-paste solutions for common animation patterns.

## Entrance Animations

### Fade In Up (Hero)

```tsx
const HeroSection = () => (
  <Animated.View
    entering={FadeInUp.duration(600).springify().damping(15)}
  >
    <Text style={styles.heroTitle}>Welcome</Text>
  </Animated.View>
);
```

### Staggered Cards

```tsx
const CardGrid = ({ items }: { items: Item[] }) => (
  <View style={styles.grid}>
    {items.map((item, index) => (
      <Animated.View
        key={item.id}
        entering={FadeInUp.delay(index * 100).springify()}
        exiting={FadeOutDown.duration(200)}
      >
        <Card item={item} />
      </Animated.View>
    ))}
  </View>
);
```

### Slide In From Edge

```tsx
// Sidebar entrance
const Sidebar = ({ isOpen }: { isOpen: boolean }) => {
  const translateX = useSharedValue(-SIDEBAR_WIDTH);

  useEffect(() => {
    translateX.value = withSpring(
      isOpen ? 0 : -SIDEBAR_WIDTH,
      { damping: 20, stiffness: 200 }
    );
  }, [isOpen]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return <Animated.View style={[styles.sidebar, style]} />;
};
```

## Number Counters

### Animated Counter

```tsx
const AnimatedCounter = ({ value }: { value: number }) => {
  const animatedValue = useSharedValue(0);

  useEffect(() => {
    animatedValue.value = withTiming(value, { duration: 1000 });
  }, [value]);

  const animatedProps = useAnimatedProps(() => ({
    text: `${Math.round(animatedValue.value)}`,
  }));

  return (
    <AnimatedTextInput
      editable={false}
      animatedProps={animatedProps}
      style={styles.counter}
    />
  );
};
```

### Flip Number

```tsx
const FlipDigit = ({ digit, previousDigit }: { digit: number; previousDigit: number }) => {
  const rotateX = useSharedValue(0);

  useEffect(() => {
    if (digit !== previousDigit) {
      rotateX.value = withSequence(
        withTiming(-90, { duration: 150 }),
        withTiming(0, { duration: 150 })
      );
    }
  }, [digit]);

  const style = useAnimatedStyle(() => ({
    transform: [{ rotateX: `${rotateX.value}deg` }],
  }));

  return (
    <Animated.View style={[styles.digit, style]}>
      <Text style={styles.digitText}>{digit}</Text>
    </Animated.View>
  );
};
```

## Progress Indicators

### Circular Progress

```tsx
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const CircularProgress = ({ progress }: { progress: number }) => {
  const animatedProgress = useSharedValue(0);
  const RADIUS = 40;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  useEffect(() => {
    animatedProgress.value = withTiming(progress, { duration: 1000 });
  }, [progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - animatedProgress.value),
  }));

  return (
    <Svg width={100} height={100}>
      <Circle cx={50} cy={50} r={RADIUS} stroke="#E0E0E0" strokeWidth={8} fill="none" />
      <AnimatedCircle
        cx={50}
        cy={50}
        r={RADIUS}
        stroke="#4CAF50"
        strokeWidth={8}
        fill="none"
        strokeDasharray={CIRCUMFERENCE}
        animatedProps={animatedProps}
        strokeLinecap="round"
        transform="rotate(-90 50 50)"
      />
    </Svg>
  );
};
```

### Linear Progress Bar

```tsx
const ProgressBar = ({ progress }: { progress: number }) => {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withSpring(progress * 100, { damping: 15 });
  }, [progress]);

  const style = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View style={styles.progressTrack}>
      <Animated.View style={[styles.progressFill, style]} />
    </View>
  );
};
```

## Loaders

### Spinner

```tsx
const Spinner = () => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={style}>
      <LoaderIcon size={24} />
    </Animated.View>
  );
};
```

### Bouncing Dots

```tsx
const BouncingDots = () => {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    const bounce = (sv: Animated.SharedValue<number>, delay: number) => {
      sv.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(-10, { duration: 300 }),
            withTiming(0, { duration: 300 })
          ),
          -1,
          true
        )
      );
    };
    bounce(dot1, 0);
    bounce(dot2, 150);
    bounce(dot3, 300);
  }, []);

  const style = (sv: Animated.SharedValue<number>) =>
    useAnimatedStyle(() => ({
      transform: [{ translateY: sv.value }],
    }));

  return (
    <View style={styles.dotsContainer}>
      <Animated.View style={[styles.dot, style(dot1)]} />
      <Animated.View style={[styles.dot, style(dot2)]} />
      <Animated.View style={[styles.dot, style(dot3)]} />
    </View>
  );
};
```

## Interactive Elements

### Expandable Card

```tsx
const ExpandableCard = ({ title, content }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const height = useSharedValue(0);
  const rotation = useSharedValue(0);

  const toggle = () => {
    setExpanded(!expanded);
    height.value = withSpring(expanded ? 0 : 200, { damping: 15 });
    rotation.value = withSpring(expanded ? 0 : 180);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const contentStyle = useAnimatedStyle(() => ({
    height: height.value,
    opacity: interpolate(height.value, [0, 200], [0, 1]),
  }));

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={styles.card}>
      <Pressable onPress={toggle} style={styles.header}>
        <Text>{title}</Text>
        <Animated.View style={chevronStyle}>
          <ChevronDown />
        </Animated.View>
      </Pressable>
      <Animated.View style={[styles.content, contentStyle]}>
        <Text>{content}</Text>
      </Animated.View>
    </View>
  );
};
```

### Heart/Like Animation

```tsx
const LikeButton = ({ onLike }: { onLike: () => void }) => {
  const [liked, setLiked] = useState(false);
  const scale = useSharedValue(1);
  const particles = useSharedValue(0);

  const handlePress = () => {
    setLiked(!liked);
    
    scale.value = withSequence(
      withSpring(0.8, { damping: 10 }),
      withSpring(1.2, { damping: 5 }),
      withSpring(1, { damping: 10 })
    );

    if (!liked) {
      particles.value = withSequence(
        withTiming(1, { duration: 400 }),
        withTiming(0, { duration: 200 })
      );
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    onLike();
  };

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const particleStyle = useAnimatedStyle(() => ({
    opacity: particles.value,
    transform: [{ scale: particles.value }],
  }));

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={particleStyle}>
        {/* Particle burst effect */}
      </Animated.View>
      <Animated.View style={heartStyle}>
        <Heart fill={liked ? 'red' : 'none'} color={liked ? 'red' : 'gray'} />
      </Animated.View>
    </Pressable>
  );
};
```

## Page Transitions

### Shared Element Prep

```tsx
// Card that will transition
const CardWithSharedElement = ({ item, onPress }: Props) => {
  const scale = useSharedValue(1);

  const tapGesture = Gesture.Tap()
    .onBegin(() => {
      scale.value = withSpring(0.98);
    })
    .onEnd(() => {
      scale.value = withSpring(1);
      runOnJS(onPress)(item);
    });

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View 
        style={style}
        sharedTransitionTag={`card-${item.id}`}
      >
        <Animated.Image
          source={item.image}
          sharedTransitionTag={`image-${item.id}`}
        />
        <Text>{item.title}</Text>
      </Animated.View>
    </GestureDetector>
  );
};
```

### Crossfade

```tsx
const CrossfadeView = ({ children, activeIndex }: Props) => {
  return (
    <View style={styles.container}>
      {React.Children.map(children, (child, index) => (
        <Animated.View
          key={index}
          style={StyleSheet.absoluteFill}
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(300)}
        >
          {index === activeIndex && child}
        </Animated.View>
      ))}
    </View>
  );
};
```

## Scroll-Linked

### Shrinking Header

```tsx
const ShrinkingHeader = () => {
  const scrollY = useSharedValue(0);
  const HEADER_MAX = 200;
  const HEADER_MIN = 60;

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  const headerStyle = useAnimatedStyle(() => ({
    height: interpolate(
      scrollY.value,
      [0, HEADER_MAX - HEADER_MIN],
      [HEADER_MAX, HEADER_MIN],
      Extrapolation.CLAMP
    ),
  }));

  const titleStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(
      scrollY.value,
      [0, HEADER_MAX - HEADER_MIN],
      [32, 18],
      Extrapolation.CLAMP
    ),
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [0, HEADER_MAX - HEADER_MIN],
          [0, -20],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.header, headerStyle]}>
        <Animated.Text style={[styles.title, titleStyle]}>Title</Animated.Text>
      </Animated.View>
      <Animated.ScrollView onScroll={scrollHandler} scrollEventThrottle={16}>
        {content}
      </Animated.ScrollView>
    </View>
  );
};
```

### Sticky Section Headers

```tsx
const StickyHeader = ({ scrollY, index }: { scrollY: Animated.SharedValue<number>; index: number }) => {
  const SECTION_HEIGHT = 300;
  const HEADER_HEIGHT = 40;
  const offset = index * SECTION_HEIGHT;

  const headerStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [offset - HEADER_HEIGHT, offset, offset + SECTION_HEIGHT - HEADER_HEIGHT],
      [-HEADER_HEIGHT, 0, SECTION_HEIGHT - HEADER_HEIGHT],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ translateY }],
    };
  });

  return (
    <Animated.View style={[styles.sectionHeader, headerStyle]}>
      <Text>Section {index}</Text>
    </Animated.View>
  );
};
```

## Utility Hooks

### useAnimatedPressable

```tsx
const useAnimatedPressable = () => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const gesture = Gesture.Tap()
    .onBegin(() => {
      scale.value = withSpring(0.95);
      opacity.value = withTiming(0.8);
    })
    .onFinalize(() => {
      scale.value = withSpring(1);
      opacity.value = withTiming(1);
    });

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return { gesture, style };
};

// Usage
const MyButton = ({ onPress }: Props) => {
  const { gesture, style } = useAnimatedPressable();

  return (
    <GestureDetector gesture={gesture.onEnd(() => runOnJS(onPress)())}>
      <Animated.View style={style}>{children}</Animated.View>
    </GestureDetector>
  );
};
```

### useShake

```tsx
const useShake = () => {
  const translateX = useSharedValue(0);

  const shake = () => {
    translateX.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  };

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return { shake, style };
};
```

### useBounce

```tsx
const useBounce = () => {
  const scale = useSharedValue(1);

  const bounce = () => {
    scale.value = withSequence(
      withSpring(1.2, { damping: 5 }),
      withSpring(1, { damping: 10 })
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return { bounce, style };
};
```
