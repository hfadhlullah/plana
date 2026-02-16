import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';

const TABS = [
  { name: 'index', label: 'Today', icon: 'mdi:calendar-today', iconActive: 'mdi:calendar-today' },
  { name: 'explore', label: 'Week', icon: 'mdi:calendar-week-outline', iconActive: 'mdi:calendar-week' },
];

// function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
//   const theme = useThemeColors();
//   const isWeb = Platform.OS === 'web';
// 
//   return (
//     <View style={styles.floatingContainer}>
//       <View style={[styles.tabBar, { backgroundColor: theme.card + 'F0', borderColor: theme.border }]}>
//         {state.routes.map((route, index) => {
//           const tabMeta = TABS.find((t) => t.name === route.name);
//           if (!tabMeta) return null;
// 
//           const focused = state.index === index;
//           const color = focused ? theme.primary : theme.mutedForeground;
// 
//           return (
//             <TouchableOpacity
//               key={route.key}
//               accessibilityRole="button"
//               accessibilityState={focused ? { selected: true } : {}}
//               onPress={() => {
//                 const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
//                 if (!focused && !event.defaultPrevented) {
//                   navigation.navigate(route.name);
//                 }
//               }}
//               activeOpacity={0.7}
//               style={[
//                 styles.tab,
//                 focused && { backgroundColor: theme.primary + '12' },
//               ]}
//             >
//               {isWeb ? (
//                 <Icon
//                   icon={focused ? tabMeta.iconActive : tabMeta.icon}
//                   width={22}
//                   color={color}
//                 />
//               ) : (
//                 <Text style={{ fontSize: 20, color }}>{index === 0 ? '📅' : '📆'}</Text>
//               )}
//               <Text
//                 style={[
//                   styles.tabLabel,
//                   { color },
//                   focused && styles.tabLabelActive,
//                 ]}
//               >
//                 {tabMeta.label}
//               </Text>
//               {focused && <View style={[styles.indicator, { backgroundColor: theme.primary }]} />}
//             </TouchableOpacity>
//           );
//         })}
//       </View>
//     </View>
//   );
// }

export default function TabLayout() {
  return (
    <Tabs
      // tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' }, // Hide the tab bar
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Today' }} />
      <Tabs.Screen name="explore" options={{ title: 'Week' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
    pointerEvents: 'box-none',
  } as any,
  tabBar: {
    flexDirection: 'row',
    borderRadius: 28,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    ...(Platform.OS === 'web'
      ? {
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }
      : {}),
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 22,
    position: 'relative',
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  tabLabelActive: {
    fontWeight: '700',
  },
  indicator: {
    position: 'absolute',
    bottom: 2,
    left: '30%' as any,
    right: '30%' as any,
    height: 3,
    borderRadius: 2,
  },
});
