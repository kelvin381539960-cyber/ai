import { Image, StyleSheet, View } from 'react-native';

export function SplashPage() {
  return (
    <View style={styles.container}>
      <Image source={{ uri: '/preview/splash.png' }} style={styles.image} resizeMode="cover" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  image: { width: '100%', height: '100%' },
});
