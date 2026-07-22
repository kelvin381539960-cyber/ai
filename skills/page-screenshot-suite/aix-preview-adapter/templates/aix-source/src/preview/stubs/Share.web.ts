export const Social = {
  Messenger: 'messenger', Facebook: 'facebook', Viber: 'viber',
  Whatsapp: 'whatsapp', Sms: 'sms', Twitter: 'twitter',
} as const;
export type ShareSingleOptions = Record<string, unknown>;
const Share = {
  open: async () => ({ success: true, message: 'preview' }),
  shareSingle: async () => ({ success: true, message: 'preview' }),
  isPackageInstalled: async () => ({ isInstalled: true, message: 'preview' }),
};
export default Share;
