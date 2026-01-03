/**
 * App Navigator - Ultimate RiceBowl
 * Survival → Explore → Pantry navigation (matching Canvas prototype)
 * With AdBanner for free users at bottom
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Animated, {
    useAnimatedStyle,
    withSpring,
    withSequence,
    withTiming,
    useSharedValue,
} from 'react-native-reanimated';
import { TodaysPlan } from '../components/TodaysPlan/TodaysPlan';
import { ExploreMode } from '../components/ExploreMode/ExploreMode';
import { PantryManager } from '../components/PantryManager/PantryManager';
import { ProfileScreen } from '../screens/ProfileScreen';
import { AdBanner } from '../components/Ads/AdBanner';
import { colors, spacing, typography } from '../config/theme';
import { useAppState } from '../store/AppStore';

const Tab = createBottomTabNavigator();

interface TabIconProps {
    icon: string;
    label: string;
    focused: boolean;
}

function TabIcon({ icon, label, focused }: TabIconProps) {
    const scale = useSharedValue(1);

    React.useEffect(() => {
        if (focused) {
            scale.value = withSequence(
                withTiming(1.2, { duration: 120 }),
                withSpring(1, { damping: 12 })
            );
        }
    }, [focused]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <View style={styles.tabIconContainer}>
            <Animated.View style={animatedStyle}>
                <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>{icon}</Text>
            </Animated.View>
            <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>{label}</Text>
            {focused && <View style={styles.activeIndicator} />}
        </View>
    );
}

function TabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarShowLabel: false,
            }}
        >
            <Tab.Screen
                name="Survival"
                component={TodaysPlan}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon icon="🍽️" label="Survival" focused={focused} />
                    ),
                }}
            />
            <Tab.Screen
                name="Explore"
                component={ExploreMode}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon icon="🔍" label="Explore" focused={focused} />
                    ),
                }}
            />
            <Tab.Screen
                name="Pantry"
                component={PantryManager}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon icon="🛒" label="Pantry" focused={focused} />
                    ),
                }}
            />
            <Tab.Screen
                name="Settings"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon icon="⚙️" label="Settings" focused={focused} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}

export function AppNavigator() {
    const { state } = useAppState();

    return (
        <NavigationContainer>
            <View style={styles.container}>
                <TabNavigator />
                {/* Banner ad at bottom - only shown for free users */}
                {!state.isPremium && (
                    <View style={styles.adContainer}>
                        <AdBanner />
                    </View>
                )}
            </View>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    adContainer: {
        position: 'absolute',
        bottom: 80, // Above the tab bar
        left: 0,
        right: 0,
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    tabBar: {
        backgroundColor: colors.neutral.surface,
        borderTopWidth: 0,
        height: 80,
        paddingBottom: 12,
        paddingTop: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 12,
    },
    tabIconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 4,
        position: 'relative',
        minWidth: 60,
    },
    tabIcon: {
        fontSize: 26,
        marginBottom: 4,
    },
    tabIconFocused: {
        fontSize: 28,
    },
    tabLabel: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.medium,
        color: colors.neutral.textMuted,
    },
    tabLabelFocused: {
        color: colors.primary.main,
        fontWeight: typography.fontWeight.bold,
    },
    activeIndicator: {
        position: 'absolute',
        bottom: -8,
        width: 5,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: colors.primary.main,
    },
});
