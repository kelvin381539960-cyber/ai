import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import '../../global.css';
import { TamaguiProvider } from '@aix/ui';
import { config } from '@aix/config';
import {
  OVERLAY_KEY_STANDARD_DIALOG_GLOBAL,
  OverlayModalHost,
  OverlayModalRoot,
  OverlayRegistryProvider,
} from '@aix/common';
import { I18nProvider } from '@/i18n/I18nContext';
import '@/network/Api';
import '@/preview/PreviewSession';

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f4f4f4' },
  dialog: { justifyContent: 'center', alignItems: 'center' },
});

export default function WebRootLayout() {
  const [loaded, fontError] = useFonts({
    Inter: require('../assets/fonts/Inter-Regular.ttf'),
    'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
    'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
    Aeonik: require('../assets/fonts/aeonik-regular.otf'),
    'Aeonik-Medium': require('../assets/fonts/aeonik-medium.otf'),
    'Aeonik-SemiBold': require('../assets/fonts/aeonik-semibold.otf'),
  });

  if (!loaded && !fontError) return null;

  return (
    <TamaguiProvider config={config as any} defaultTheme="light">
      <I18nProvider>
        <View style={styles.root}>
          <ThemeProvider value={DefaultTheme}>
            <OverlayRegistryProvider isRootRegistry trackFocus={false}>
              <OverlayModalRoot>
                <OverlayModalHost
                  overlayKey={OVERLAY_KEY_STANDARD_DIALOG_GLOBAL}
                  animationType="fade"
                  overlayStyle={styles.dialog}
                />
              </OverlayModalRoot>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="aix" />
                <Stack.Screen name="+not-found" />
              </Stack>
            </OverlayRegistryProvider>
          </ThemeProvider>
        </View>
      </I18nProvider>
    </TamaguiProvider>
  );
}
