// App.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

import { initDB } from './src/utils/database';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from './src/utils/theme';

import DashboardScreen from './src/screens/DashboardScreen';
import TransaksiScreen from './src/screens/TransaksiScreen';
import ItemScreen      from './src/screens/ItemScreen';
import RekapScreen     from './src/screens/RekapScreen';

const Tab = createBottomTabNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background:  COLORS.background,
    card:        COLORS.surfaceContainerLow,
    text:        COLORS.white,
    border:      'rgba(255,255,255,0.08)',
    primary:     COLORS.cyanSoft,
    notification:COLORS.magenta,
  },
};

function HeaderTitle({ title }: { title: string }) {
  return (
    <Text style={styles.headerTitle}>
      <Text style={{ color: COLORS.magentaSoft, fontStyle: 'italic' }}>HAZ </Text>
      <Text style={{ color: COLORS.white }}>{title}</Text>
    </Text>
  );
}

export default function App() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    initDB()
      .then(() => setDbReady(true))
      .catch(console.error);
  }, []);

  if (!dbReady) {
    return (
      <SafeAreaProvider>
        <View style={styles.splash}>
          <Text style={styles.splashTitle}>💸</Text>
          <Text style={styles.splashBrand}>
            <Text style={{ color: COLORS.magentaSoft, fontStyle: 'italic' }}>HAZ </Text>
            <Text style={{ color: COLORS.white }}>FINANCE</Text>
          </Text>
          <Text style={styles.splashSub}>Memuat database...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <NavigationContainer theme={navTheme}>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                const icons: Record<string, [string, string]> = {
                  Dashboard: ['home',          'home-outline'],
                  Transaksi: ['swap-horizontal','swap-horizontal-outline'],
                  Barang:    ['cube',           'cube-outline'],
                  Rekap:     ['bar-chart',      'bar-chart-outline'],
                };
                const [activeIcon, inactiveIcon] = icons[route.name] ?? ['ellipse', 'ellipse-outline'];
                return <Ionicons name={(focused ? activeIcon : inactiveIcon) as any} size={size} color={color} />;
              },
              tabBarActiveTintColor:   COLORS.cyanSoft,
              tabBarInactiveTintColor: COLORS.muted,
              tabBarStyle: {
                backgroundColor: COLORS.surfaceContainerLow,
                borderTopColor: 'rgba(255,255,255,0.08)',
                borderTopWidth: 1,
                height: 62,
                paddingBottom: 8,
                paddingTop: 4,
              },
              tabBarLabelStyle: { ...TYPOGRAPHY.labelSm, marginTop: 2 },
              headerStyle:      { backgroundColor: COLORS.background, elevation: 0, shadowOpacity: 0, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
              headerTintColor:  COLORS.white,
              headerTitleAlign: 'left',
            })}
          >
            <Tab.Screen
              name="Dashboard"
              component={DashboardScreen}
              options={{
                headerTitle: () => <HeaderTitle title="FINANCE" />,
              }}
            />
            <Tab.Screen
              name="Transaksi"
              component={TransaksiScreen}
              options={{
                headerTitle: () => <HeaderTitle title="TRANSAKSI" />,
              }}
            />
            <Tab.Screen
              name="Barang"
              component={ItemScreen}
              options={{
                headerTitle: () => <HeaderTitle title="DAFTAR BARANG" />,
              }}
            />
            <Tab.Screen
              name="Rekap"
              component={RekapScreen}
              options={{
                headerTitle: () => <HeaderTitle title="REKAP LAPORAN" />,
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  splashTitle: { fontSize: 64, marginBottom: SPACING.sm },
  splashBrand: { fontSize: 28, fontWeight: '800', letterSpacing: -1 },
  splashSub:   { ...TYPOGRAPHY.bodyMd, color: COLORS.muted, marginTop: SPACING.sm },
  headerTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
});
