/**
 * Theme Configuration - System Monitor Design
 * Warmer, more "comfort food" tones with critical state accents
 */

export const colors = {
    // Primary - Warmer Coral/Paprika Orange
    primary: {
        main: '#E85D3B',      // Warmer paprika
        light: '#F08B6D',     // Soft coral
        dark: '#C74A2C',      // Deep terracotta
        contrast: '#FFFFFF',
    },

    // Secondary - Warm Gold
    secondary: {
        main: '#F2A950',      // Honey gold
        light: '#FFD08A',     // Soft amber
        dark: '#D4902E',      // Burnt gold
        contrast: '#2D2D2D',
    },

    // Accent - Teal for contrast
    accent: {
        main: '#3DBAA7',      // Softer teal
        light: '#6BCFBE',     // Mint
        dark: '#2A9082',      // Deep sea
        contrast: '#FFFFFF',
    },

    // Bowl States - 4 Distinct States
    bowl: {
        full: '#F08B6D',        // Warm coral glow (0-2hrs)
        good: '#F2C572',        // Calm amber (2-4hrs)
        low: '#A8B4BD',         // Desaturated blue-grey (4-6hrs)
        critical: '#C45B52',    // Muted red, undeniable (6+hrs)
    },

    // Critical State - Muted but undeniable
    critical: {
        main: '#C45B52',        // Muted red
        light: '#E8847D',       // Soft warning
        dark: '#9A3F37',        // Deep alert
        pulse: 'rgba(196, 91, 82, 0.3)', // Pulse glow
    },

    // Neutrals - Warm off-white backgrounds
    neutral: {
        white: '#FFFFFF',
        background: '#FAF9F6',  // Warm off-white (changed from pure white)
        surface: '#FFFFFF',
        border: '#EBE9E5',      // Warmer border
        textPrimary: '#2A2520', // Warmer dark
        textSecondary: '#5C564F',
        textMuted: '#8A857D',
        textDisabled: '#B5B0A8',
    },

    // Semantic
    semantic: {
        success: '#4CAF50',
        warning: '#E8A347',     // Warmer warning
        error: '#C45B52',       // Matches critical
        info: '#5B9BD5',
    },
};

export const typography = {
    fontFamily: {
        regular: 'System',
        medium: 'System',
        bold: 'System',
    },

    fontSize: {
        xs: 11,
        sm: 12,
        base: 14,
        md: 16,
        lg: 20,        // Bumped up from 18
        xl: 26,        // Bumped up from 24
        '2xl': 32,     // Bumped up from 28
        '3xl': 38,     // Bumped up from 32
    },

    fontWeight: {
        regular: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
        bold: '700' as const,
    },

    // Increased line heights for breathing room
    lineHeight: {
        tight: 1.2,
        normal: 1.6,    // Increased from 1.4
        relaxed: 1.8,   // Increased from 1.6
    },
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,        // Increased from 20
    '2xl': 32,     // Increased from 24
    '3xl': 40,     // Increased from 32
    '4xl': 56,     // Increased from 40
};

export const borderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,        // Increased from 20
    full: 9999,
};

export const shadows = {
    sm: {
        shadowColor: '#2A2520',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
        elevation: 1,
    },
    md: {
        shadowColor: '#2A2520',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 2,
    },
    lg: {
        shadowColor: '#2A2520',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 4,
    },
    glow: (color: string) => ({
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 8,
    }),
};

// Bowl state configuration
export const bowlStates = {
    full: {
        name: 'FULL',
        hoursRange: [0, 2],
        color: colors.bowl.full,
        message: 'Systems optimal. Focus mode enabled.',
        animation: 'steaming',
        pulseSpeed: 3000,
    },
    good: {
        name: 'GOOD',
        hoursRange: [2, 4],
        color: colors.bowl.good,
        message: 'Running smoothly. No action needed.',
        animation: 'calm',
        pulseSpeed: 5000,
    },
    low: {
        name: 'LOW',
        hoursRange: [4, 6],
        color: colors.bowl.low,
        message: 'Resources depleting. Consider refueling.',
        animation: 'tremble',
        pulseSpeed: 2000,
    },
    critical: {
        name: 'CRITICAL',
        hoursRange: [6, Infinity],
        color: colors.bowl.critical,
        message: '⚠️ System resources critical. Refuel immediately.',
        animation: 'pulse',
        pulseSpeed: 800,
    },
};

export default {
    colors,
    typography,
    spacing,
    borderRadius,
    shadows,
    bowlStates,
};
