/**
 * RiceBowl App Entry Point
 * With AppProvider for global state
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AppProvider, useAppState } from './src/store/AppStore';
import { setupNotificationChannels, requestPermissions } from './src/services/notifications/localNotifications';
import { colors } from './src/config/theme';

function AppContent() {
  const { loading } = useAppState();

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    await setupNotificationChannels();
    await requestPermissions();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingLogo}>🍚</Text>
        <Text style={styles.loadingText}>Loading RiceBowl...</Text>
        <ActivityIndicator size="large" color={colors.primary.main} style={styles.spinner} />
      </View>
    );
  }

  return <AppNavigator />;
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <AppProvider>
          <AppContent />
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF9F6',
  },
  loadingLogo: {
    fontSize: 64,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '500',
  },
  spinner: {
    marginTop: 24,
  },
});
