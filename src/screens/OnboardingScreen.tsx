/**
 * Onboarding Screen
 * Bio-Maintenance framing for first-time users
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    SafeAreaView,
} from 'react-native';
import { colors } from '../config/theme';

const { width, height } = Dimensions.get('window');

interface OnboardingSlide {
    icon: string;
    title: string;
    description: string;
    bgColor: string;
}

const SLIDES: OnboardingSlide[] = [
    {
        icon: '🍚',
        title: 'Welcome to RiceBowl',
        description: 'Your survival guide for when you forget to eat. No calorie counting. No guilt. Just fuel for your brain.',
        bgColor: '#FFF9F5',
    },
    {
        icon: '🧠',
        title: 'Bio-Maintenance Mode',
        description: 'We treat food as system calibration. Your brain needs fuel to perform. Let us remind you before the crash.',
        bgColor: '#F5F9FF',
    },
    {
        icon: '⏱️',
        title: 'Panic Pantry',
        description: "When you're stressed, we ask one question: How much time do you have? 1 min, 10 min, or 30 min.",
        bgColor: '#FFF5F5',
    },
    {
        icon: '🔔',
        title: 'Gentle Nudges',
        description: 'Smart notifications that understand hyper-focus. We interrupt only when your cognitive load needs a refuel.',
        bgColor: '#F5FFF5',
    },
];

interface OnboardingScreenProps {
    onComplete: () => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
    const [currentSlide, setCurrentSlide] = useState(0);

    const handleNext = () => {
        if (currentSlide < SLIDES.length - 1) {
            setCurrentSlide(currentSlide + 1);
        } else {
            onComplete();
        }
    };

    const handleSkip = () => {
        onComplete();
    };

    const slide = SLIDES[currentSlide];
    const isLast = currentSlide === SLIDES.length - 1;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: slide.bgColor }]}>
            {/* Skip button */}
            {!isLast && (
                <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                    <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>
            )}

            {/* Content */}
            <View style={styles.content}>
                <Text style={styles.icon}>{slide.icon}</Text>
                <Text style={styles.title}>{slide.title}</Text>
                <Text style={styles.description}>{slide.description}</Text>
            </View>

            {/* Dots */}
            <View style={styles.dotsContainer}>
                {SLIDES.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.dot,
                            currentSlide === index && styles.dotActive,
                        ]}
                    />
                ))}
            </View>

            {/* Button */}
            <TouchableOpacity style={styles.button} onPress={handleNext}>
                <Text style={styles.buttonText}>
                    {isLast ? "Let's Start 🍚" : 'Next'}
                </Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
    },
    skipButton: {
        alignSelf: 'flex-end',
        paddingTop: 16,
        paddingRight: 8,
    },
    skipText: {
        fontSize: 14,
        color: '#888',
        fontWeight: '500',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    icon: {
        fontSize: 80,
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#2D2D2D',
        textAlign: 'center',
        marginBottom: 16,
    },
    description: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 26,
        paddingHorizontal: 20,
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 32,
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#DDD',
    },
    dotActive: {
        backgroundColor: colors.primary.main,
        width: 24,
    },
    button: {
        backgroundColor: colors.primary.main,
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: 'center',
        marginBottom: 32,
        shadowColor: colors.primary.main,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFF',
    },
});
