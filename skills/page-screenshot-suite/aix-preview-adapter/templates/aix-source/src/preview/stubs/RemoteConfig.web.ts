const values: Record<string, unknown> = {
  awesome_new_feature: 'disabled', test_aix_config: false,
  enable_aix_ios_ssl_pinning: false,
};
const valueFor = (key: string) => ({
  asBoolean: () => Boolean(values[key]),
  asString: () => String(values[key] ?? ''),
  asNumber: () => Number(values[key] ?? 0),
  getSource: () => 'default',
});
const instance = {
  setConfigSettings: async () => undefined,
  setDefaults: async (defaults: Record<string, unknown>) => Object.assign(values, defaults),
  fetchAndActivate: async () => false,
  activate: async () => false,
  getValue: valueFor,
  onConfigUpdated: () => () => undefined,
};
export default function remoteConfig() { return instance; }
