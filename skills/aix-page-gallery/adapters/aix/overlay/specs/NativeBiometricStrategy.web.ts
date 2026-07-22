const successKey = {
  ok: true as const,
  publicKey: 'preview-public-key',
  signal: 'preview-signature',
  timestamp: '1700000000000',
};

const NativeBiometricStrategy = {
  getBiometricType: () => 'Face ID',
  doesDeviceSupportBiometrics: async () => true,
  isBiometricAvailable: async () => true,
  setBiometricEnabled: async () => successKey,
  doBiometricSigurature: async () => ({
    ok: true as const,
    signal: 'preview-signature',
    timestamp: '1700000000000',
  }),
  shouldContinueEnablingBiometric: async () => true,
  openSettings: async () => true,
  clearBiometricData: async () => true,
};

export default NativeBiometricStrategy;
