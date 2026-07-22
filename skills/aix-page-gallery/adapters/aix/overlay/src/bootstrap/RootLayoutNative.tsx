import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import 'react-native-reanimated';
import '../../global.css';
import { TamaguiProvider } from '@aix/ui';
import { config, typographyTheme } from '@aix/config';
import {
  OVERLAY_KEY_STANDARD_DIALOG_GLOBAL,
  OverlayModalHost,
  OverlayModalRoot,
  OverlayRegistryProvider,
  logger,
} from '@aix/common';

import { useColorScheme } from '../hooks/useColorScheme';
import { initMoEngage } from '../third-party/MoEngage';
import { initRemoteConfig } from '../third-party/RemoteConfig';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import { patchAixTypographyTheme } from '@/utils/typography/patchAixTypographyTheme';
// 初始化全局请求客户端
import '@/network/Api';
import { I18nProvider } from '@/i18n/I18nContext';
// 初始化全局 services（注册 error flows 等）
import '@/services/ServicesIndex';

import { initCrashlytics } from '@/third-party/FirebaseCrashlytics';
import { initAppsFlyer } from '@/third-party/apps-flyer/AppsFlyer';
import { appState } from '@/services/app/AppStatus';
import { initAdvertising } from '@/third-party/Advertising';
import { initPageTrack } from '@/services/track/InitPageTrack';
import { initI18nOta } from '@/services/i18n/I18nOtaService';
import '@/constants/Assets';
import '@aix/ui/ArtWork';
import TopRouteObserver from '@/services/top-route/TopRouteObserver';

// 关闭 React Native Firebase v22 模块化 API 迁移警告
(globalThis as any).RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;

// Patch typography tokens once at app start so `fontWeight` maps to concrete font families.
patchAixTypographyTheme(typographyTheme as any);

SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

SplashScreen.preventAutoHideAsync();

const styles = StyleSheet.create({
  standardDialogOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});


export default function RootLayout() {
  const colorScheme = useColorScheme();
  const statusBarStyle = colorScheme === 'dark' ? 'light' : 'dark';
  const [loaded, fontError] = useFonts({
    Inter: require('../assets/fonts/Inter-Regular.ttf'),
    'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
    'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
    Aeonik: require('../assets/fonts/aeonik-regular.otf'),
    'Aeonik-Medium': require('../assets/fonts/aeonik-medium.otf'),
    'Aeonik-SemiBold': require('../assets/fonts/aeonik-semibold.otf'),
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const hiddenSplash = useRef(false);

  useEffect(() => {
    if ((loaded || fontError) && !hiddenSplash.current) {
      hiddenSplash.current = true;
      SplashScreen.hideAsync();
    }
  }, [loaded, fontError]);

  useEffect(() => {
    // 页面追踪系统初始化（允许多次调用，会覆盖）
    initPageTrack();
    
    // 使用 appState 保护，确保全局只初始化一次
    if (appState.isFirstStart) {
      initCrashlytics();
      initMoEngage();
      initRemoteConfig();
      initAppsFlyer();
      initAdvertising();
      appState.setFirstStart(false);
    }

    // 异步初始化 I18n OTA，不阻塞应用启动
    initI18nOta().catch(err => logger.warn('I18n OTA 初始化失败', err));
  }, []);

  return (
    <TamaguiProvider config={config as any} defaultTheme={colorScheme === 'dark' ? 'dark' : 'light'}>
      <I18nProvider>
        <View style={{ flex: 1 }}>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <OverlayRegistryProvider isRootRegistry trackFocus={false}>
              <OverlayModalRoot>
                <OverlayModalHost
                  overlayKey={OVERLAY_KEY_STANDARD_DIALOG_GLOBAL}
                  animationType="fade"
                  overlayStyle={styles.standardDialogOverlay}
                />
              </OverlayModalRoot>
              <Stack
                screenOptions={{
                  headerShown: false,
                  statusBarStyle,
                }}
              >
                <Stack.Screen name="aix" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
              </Stack>
            </OverlayRegistryProvider>
            <TopRouteObserver />
          </ThemeProvider>
        </View>
      </I18nProvider>
    </TamaguiProvider>
  );
}