const listener = () => () => undefined;
const appsFlyer = {
  onDeepLink: listener, onInstallConversionData: listener,
  onInstallConversionFailure: listener, onAppOpenAttribution: listener,
  onAttributionFailure: listener,
  initSdk: (_config: unknown, success?: (value: unknown) => void) => success?.({ preview: true }),
  setOneLinkCustomDomains: (_domains: unknown, success?: () => void) => success?.(),
  setResolveDeepLinkURLs: (_domains: unknown, success?: () => void) => success?.(),
  getAppsFlyerUID: (callback: (error: unknown, uid?: string) => void) => callback(null, 'preview-appsflyer-id'),
  setCustomerUserId: (_id: string, callback?: () => void) => callback?.(),
  logEvent: (_name: string, _values: unknown, success?: (value?: unknown) => void) => success?.({ preview: true }),
};
export default appsFlyer;
