/**
 * Bowl Visual Component - System Monitor Design
 * 60% larger, 4 states, breathing animation, accessibility patterns
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, AccessibilityInfo } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, G, Ellipse, Pattern, Rect, Circle } from 'react-native-svg';
import Animated, {
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    useSharedValue,
    withDelay,
    Easing,
    interpolate,
    withSpring,
} from 'react-native-reanimated';
import { colors } from '../../config/theme';
import { ExtendedBowlState } from './useBowlState';

interface BowlVisualProps {
    state: ExtendedBowlState;
    percentage: number;
    color: string;
    animationType: 'steaming' | 'calm' | 'tremble' | 'pulse';
    size?: number;
    reducedMotion?: boolean;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export function BowlVisual({
    state,
    percentage,
    color,
    animationType,
    size = 280, // 60% larger default (was ~175)
    reducedMotion = false,
}: BowlVisualProps) {
    // Breathing animation (subtle scale)
    const breathe = useSharedValue(1);

    // State-specific animations
    const steam1Y = useSharedValue(0);
    const steam2Y = useSharedValue(0);
    const steam3Y = useSharedValue(0);
    const steamOpacity = useSharedValue(0);

    const trembleX = useSharedValue(0);
    const pulseScale = useSharedValue(1);
    const glowOpacity = useSharedValue(0);

    useEffect(() => {
        if (reducedMotion) return;

        // Breathing animation - always active (very subtle)
        breathe.value = withRepeat(
            withSequence(
                withTiming(1.02, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) })
            ),
            -1
        );

        // Reset all state animations
        steamOpacity.value = 0;
        trembleX.value = 0;
        pulseScale.value = 1;
        glowOpacity.value = 0;

        if (animationType === 'steaming') {
            // Steam rising animation
            steamOpacity.value = withTiming(1, { duration: 500 });
            steam1Y.value = withRepeat(
                withSequence(
                    withTiming(-30, { duration: 2000 }),
                    withTiming(0, { duration: 0 })
                ),
                -1
            );
            steam2Y.value = withDelay(300,
                withRepeat(
                    withSequence(
                        withTiming(-35, { duration: 2200 }),
                        withTiming(0, { duration: 0 })
                    ),
                    -1
                )
            );
            steam3Y.value = withDelay(600,
                withRepeat(
                    withSequence(
                        withTiming(-28, { duration: 1800 }),
                        withTiming(0, { duration: 0 })
                    ),
                    -1
                )
            );
            // Warm glow for full state
            glowOpacity.value = withRepeat(
                withSequence(
                    withTiming(0.6, { duration: 1500 }),
                    withTiming(0.3, { duration: 1500 })
                ),
                -1
            );
        } else if (animationType === 'tremble') {
            // Slight shake for LOW state
            trembleX.value = withRepeat(
                withSequence(
                    withTiming(-2, { duration: 100 }),
                    withTiming(2, { duration: 100 }),
                    withTiming(-1, { duration: 80 }),
                    withTiming(1, { duration: 80 }),
                    withTiming(0, { duration: 100 }),
                    withTiming(0, { duration: 1500 }) // Pause between trembles
                ),
                -1
            );
        } else if (animationType === 'pulse') {
            // Critical pulse - impossible to ignore
            pulseScale.value = withRepeat(
                withSequence(
                    withTiming(1.05, { duration: 400, easing: Easing.out(Easing.ease) }),
                    withTiming(1, { duration: 400, easing: Easing.in(Easing.ease) })
                ),
                -1
            );
            glowOpacity.value = withRepeat(
                withSequence(
                    withTiming(0.8, { duration: 400 }),
                    withTiming(0.2, { duration: 400 })
                ),
                -1
            );
        }
    }, [animationType, reducedMotion]);

    // Animated styles
    const containerStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: breathe.value * pulseScale.value },
            { translateX: trembleX.value },
        ],
    }));

    const steam1Style = useAnimatedStyle(() => ({
        opacity: interpolate(steam1Y.value, [0, -30], [steamOpacity.value, 0]),
        transform: [{ translateY: steam1Y.value }],
    }));

    const steam2Style = useAnimatedStyle(() => ({
        opacity: interpolate(steam2Y.value, [0, -35], [steamOpacity.value, 0]),
        transform: [{ translateY: steam2Y.value }],
    }));

    const steam3Style = useAnimatedStyle(() => ({
        opacity: interpolate(steam3Y.value, [0, -28], [steamOpacity.value, 0]),
        transform: [{ translateY: steam3Y.value }],
    }));

    const glowStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
    }));

    // Calculate fill level
    const fillHeight = (percentage / 100) * 70;
    const fillY = 105 - fillHeight;

    // Get pattern for accessibility (colorblind support)
    const getAccessibilityPattern = () => {
        switch (state) {
            case 'full': return 'dots';
            case 'good': return 'none';
            case 'low': return 'lines';
            case 'critical': return 'crosshatch';
            default: return 'none';
        }
    };

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            {/* Glow effect behind bowl */}
            <AnimatedView style={[styles.glow, glowStyle, {
                backgroundColor: color,
                width: size * 0.9,
                height: size * 0.5,
                borderRadius: size * 0.45,
            }]} />

            <AnimatedView style={containerStyle}>
                {/* Steam effects */}
                {animationType === 'steaming' && (
                    <View style={styles.steamContainer}>
                        <AnimatedView style={[styles.steamLine, steam1Style, { left: '32%' }]}>
                            <SteamWisp color={color} />
                        </AnimatedView>
                        <AnimatedView style={[styles.steamLine, steam2Style, { left: '50%' }]}>
                            <SteamWisp color={color} />
                        </AnimatedView>
                        <AnimatedView style={[styles.steamLine, steam3Style, { left: '68%' }]}>
                            <SteamWisp color={color} />
                        </AnimatedView>
                    </View>
                )}

                {/* Bowl SVG */}
                <Svg width={size} height={size} viewBox="0 0 200 200">
                    <Defs>
                        <LinearGradient id="bowlGradient" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0%" stopColor="#FAFAFA" />
                            <Stop offset="100%" stopColor="#E8E5E0" />
                        </LinearGradient>
                        <LinearGradient id="fillGradient" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0%" stopColor={color} />
                            <Stop offset="100%" stopColor={adjustColor(color, -25)} />
                        </LinearGradient>
                        <LinearGradient id="shadowGradient" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0%" stopColor="rgba(0,0,0,0.08)" />
                            <Stop offset="100%" stopColor="rgba(0,0,0,0)" />
                        </LinearGradient>
                        {/* Accessibility pattern for LOW state */}
                        <Pattern id="linesPattern" patternUnits="userSpaceOnUse" width="8" height="8">
                            <Path d="M0 8 L8 0" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                        </Pattern>
                        {/* Accessibility pattern for CRITICAL state */}
                        <Pattern id="crossPattern" patternUnits="userSpaceOnUse" width="8" height="8">
                            <Path d="M0 8 L8 0 M-2 2 L2 -2 M6 10 L10 6" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                        </Pattern>
                    </Defs>

                    {/* Bowl shadow */}
                    <Ellipse cx="100" cy="180" rx="55" ry="8" fill="rgba(0,0,0,0.08)" />

                    {/* Critical state: red outline pulse */}
                    {state === 'critical' && (
                        <Path
                            d="M25 80 Q25 165 100 170 Q175 165 175 80 L175 75 Q175 68 168 68 L32 68 Q25 68 25 75 Z"
                            fill="none"
                            stroke={colors.critical.main}
                            strokeWidth="3"
                            opacity="0.6"
                        />
                    )}

                    {/* Bowl body */}
                    <G>
                        {/* Bowl outer */}
                        <Path
                            d="M30 80 Q30 160 100 165 Q170 160 170 80 L170 75 Q170 70 165 70 L35 70 Q30 70 30 75 Z"
                            fill="url(#bowlGradient)"
                            stroke="#D5D0C8"
                            strokeWidth="2"
                        />

                        {/* Bowl rim */}
                        <Path
                            d="M25 70 Q25 58 35 58 L165 58 Q175 58 175 70 Q175 82 165 82 L35 82 Q25 82 25 70 Z"
                            fill="#FEFEFE"
                            stroke="#D5D0C8"
                            strokeWidth="2"
                        />

                        {/* Food fill */}
                        {percentage > 0 && (
                            <G>
                                <Path
                                    d={`M38 ${fillY + 22} Q38 ${165 - (100 - percentage) * 0.85} 100 ${168 - (100 - percentage) * 0.88} Q162 ${165 - (100 - percentage) * 0.85} 162 ${fillY + 22} L162 87 Q100 92 38 87 Z`}
                                    fill="url(#fillGradient)"
                                />
                                {/* Accessibility pattern overlay */}
                                {(state === 'low' || state === 'critical') && (
                                    <Path
                                        d={`M38 ${fillY + 22} Q38 ${165 - (100 - percentage) * 0.85} 100 ${168 - (100 - percentage) * 0.88} Q162 ${165 - (100 - percentage) * 0.85} 162 ${fillY + 22} L162 87 Q100 92 38 87 Z`}
                                        fill={state === 'critical' ? 'url(#crossPattern)' : 'url(#linesPattern)'}
                                    />
                                )}
                            </G>
                        )}

                        {/* Inner shadow */}
                        <Path
                            d="M38 82 Q38 88 100 91 Q162 88 162 82"
                            fill="url(#shadowGradient)"
                        />
                    </G>

                    {/* Rice grains decoration (when full/good) */}
                    {(state === 'full' || state === 'good') && percentage > 50 && (
                        <G opacity={0.8}>
                            <Ellipse cx="75" cy="100" rx="5" ry="2.5" fill="#FFF" />
                            <Ellipse cx="100" cy="95" rx="5" ry="2.5" fill="#FFF" />
                            <Ellipse cx="125" cy="98" rx="5" ry="2.5" fill="#FFF" />
                            <Ellipse cx="85" cy="112" rx="4" ry="2" fill="#FFF" />
                            <Ellipse cx="115" cy="110" rx="4" ry="2" fill="#FFF" />
                        </G>
                    )}
                </Svg>
            </AnimatedView>
        </View>
    );
}

/**
 * Steam wisp component
 */
function SteamWisp({ color }: { color: string }) {
    return (
        <Svg width={24} height={40} viewBox="0 0 24 40">
            <Path
                d="M12 40 Q6 30 12 20 Q18 10 12 0"
                stroke={color}
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                opacity={0.5}
            />
        </Svg>
    );
}

/**
 * Adjust color brightness
 */
function adjustColor(color: string, amount: number): string {
    const hex = color.replace('#', '');
    const r = Math.max(0, Math.min(255, parseInt(hex.slice(0, 2), 16) + amount));
    const g = Math.max(0, Math.min(255, parseInt(hex.slice(2, 4), 16) + amount));
    const b = Math.max(0, Math.min(255, parseInt(hex.slice(4, 6), 16) + amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    glow: {
        position: 'absolute',
        top: '30%',
    },
    steamContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 60,
        zIndex: 10,
    },
    steamLine: {
        position: 'absolute',
        top: 20,
    },
});
