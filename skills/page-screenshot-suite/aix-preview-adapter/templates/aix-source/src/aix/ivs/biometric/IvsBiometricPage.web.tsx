import { View, StyleSheet } from 'react-native';
import IvsBiometricView from './IvsBiometricView';

export default function IvsBiometricPageWeb() {
  return (
    <View style={styles.container}>
      <IvsBiometricView close={() => undefined} cancel={() => undefined} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
