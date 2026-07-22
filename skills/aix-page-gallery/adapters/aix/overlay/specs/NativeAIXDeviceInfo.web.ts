const NativeAIXDeviceInfo = {
  getDeviceId: () => 'preview-device-001',
  getAppVersion: () => '1.0.0-preview',
  getAdvertisingId: () => 'preview-advertising-id',
  getDVToken: () => 'preview-dv-token',
  getAdvertisingIdWithPromise: async () => 'preview-advertising-id',
  getAdvertisingIdWithCallback: (callback: (result: string | null) => void) => {
    callback('preview-advertising-id');
  },
};

export default NativeAIXDeviceInfo;
