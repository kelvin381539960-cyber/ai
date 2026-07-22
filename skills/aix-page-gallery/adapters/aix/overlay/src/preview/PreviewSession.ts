import { UserCache } from '@/cache/user/useUserStore';
import { GlobaleConfigCahce } from '@/cache/global-config/useGlobalConfigStore';

const previewUser = {
  userId: 'preview-user',
  aixTag: 'preview',
  nickname: 'Preview User',
  email: 'preview@aixpay.co',
  plainEmail: 'preview@aixpay.co',
  phone: '+65 8888 8888',
  biometricEnable: true,
  verificationStatus: 'APPROVED',
  kycVerified: true,
  countryFromKyc: 'SG',
  hasVirtualCard: true,
  hasPhysicalCard: true,
  birthYearFromKyc: 1989,
};

const previewGlobalConfig = {
  uiConfig: {
    meTab: {
      languageList: [
        { code: 'en', displayName: 'English' },
        { code: 'es', displayName: 'Español' },
        { code: 'pt', displayName: 'Português' },
        { code: 'tr', displayName: 'Türkçe' },
        { code: 'vi', displayName: 'Tiếng Việt' },
      ],
    },
    aixTagTab: { excludeKeywordList: [] },
    faqConfig: { faqs: [] },
  },
  system: { broadcasts: [], nextSendInterval: 60 },
};

export function ensurePreviewSession() {
  if (!UserCache.getState().userInfo) {
    UserCache.setState({ userInfo: previewUser });
  }
  if (!GlobaleConfigCahce.getState().config) {
    GlobaleConfigCahce.setState({ config: previewGlobalConfig });
  }
}

ensurePreviewSession();
