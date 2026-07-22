const svgCard = (label, color) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400"><rect width="100%" height="100%" rx="32" fill="${color}"/><text x="48" y="90" fill="white" font-size="34" font-family="Arial">AIX PAY</text><text x="48" y="330" fill="white" font-size="26" font-family="Arial">${label}</text></svg>`)}`;

const virtualOption = {
  cardType: 'VIRTUAL', order: 1, canApply: true,
  email: 'preview@aixpay.co', fullName: 'Preview User', originalFullName: 'Preview User',
  phoneCountryCode: 'SG', countryNo: '+65', phoneNumber: '88888888',
  cardFee: {
    cardFee: '10', cardFeeDisplay: '10 USD', discount: '10',
    discountDisplay: 'Invite Reward -10 USD', discountTag: 'Invite Reward',
    isFree: true, payableCardFee: '0', payableCardFeeDisplay: '0 USD',
  },
  cardFaceList: [
    { code: 'ORANGE', name: 'AIX Orange', colorRgb: '#FF6230', order: 1 },
  ],
  currencyList: [
    { code: 'USDT', name: 'Tether USD', desc: 'Widely used with strong liquidity.', order: 1 },
    { code: 'USDC', name: 'USD Coin', desc: 'A regulated digital dollar.', order: 2 },
  ],
};
const physicalOption = {
  ...virtualOption,
  cardType: 'PHYSICAL', order: 2,
  cardFee: {
    cardFee: '50', cardFeeDisplay: '50 USD', discount: '10',
    discountDisplay: 'Invite Reward -10 USD', discountTag: 'Invite Reward',
    isFree: false, payableCardFee: '40', payableCardFeeDisplay: '40 USD',
  },
  cardFaceList: [{ code: 'SILVER', name: 'AIX Silver', colorRgb: '#858585', order: 1 }],
};

const cardApplyConfig = {
  applyOrder: 'preview-apply-order',
  hasApplied: false,
  hasDiscount: false,
  needTopup: false,
  cardOptions: [virtualOption, physicalOption],
  selectPlan: [],
};

const faq = {
  virtual: { faqs: [{ questionId: 'v1', title: 'How does the virtual card work?', description: 'Use it immediately for online payments.' }] },
  physical: { faqs: [{ questionId: 'p1', title: 'Where can I use the physical card?', description: 'Use it wherever Visa is accepted.' }] },
};

const previewImage = '/assets/packages/resources/src/assets/images/card/card_virtual_pick_image.e2777e45152ed6e0cc029c054b3c8c29@3x.png';
const messageTime = String(Date.UTC(2026, 6, 21, 12, 30));
const routePresets = {
  '/aix/card/card-interduce': { config: JSON.stringify(cardApplyConfig), faq: JSON.stringify(faq) },
  '/aix/card/pick-cards': { config: JSON.stringify(cardApplyConfig) },
  '/aix/card/pick-cards-face': { option: JSON.stringify(virtualOption), applyOrder: 'preview-apply-order' },
  '/aix/card/pick-card-currency': { option: JSON.stringify(virtualOption), faceCode: 'ORANGE', applyOrder: 'preview-apply-order' },
  '/aix/card/application/order-confirm': {
    option: JSON.stringify(virtualOption), selectedCardFaceCode: 'ORANGE',
    selectedCurrencyCode: 'USDT', applyOrder: 'preview-apply-order',
  },
  '/aix/card/manage/card-error': {
    title: 'Unable to update PIN', description: 'Something went wrong. Please try again.',
    buttonText: 'Back to card', baseArtworkType: 'Folder', overlayArtworkType: 'AlertF',
  },
  '/aix/card/mailing-address': {
    fullName: 'Preview User', originalFullName: 'Preview User',
    countryNo: '+65', phoneNumber: '88888888', phoneCountryCode: 'SG',
  },
  '/aix/components/image-preview': { fileUri: previewImage, title: 'Document preview' },
  '/aix/components/webview/general-webview': {
    title: 'AIX Pay Help', url: 'about:blank',
  },
  '/aix/components/webview/webview-page': {
    title: 'AIX Pay Help', url: 'about:blank', uiTheme: 'BROWSER_STYLE',
  },
  '/aix/message/message-detail-page': {
    messageId: 'preview-message-001', title: 'Card application approved', createTime: messageTime,
  },
  '/aix/user/forgot-password': { email: 'preview@aixpay.co' },
  '/aix/user/set-password': { otpSessionId: 'preview-otp-session' },
  '/aix/user/set-phone': { isUpdate: 'true', _PageOptionId: 'preview-page-option' },
};
Object.assign(routePresets, {
  '/aix/ivs/email-otp-page': { email: 'preview@aixpay.co', recommendTag: 'PREVIEW', dataConsent: 'true' },
  '/aix/ivs/ivs-begin-page': { sessionId: 'preview-ivs-session', modal: 'card', status: 'SUCCESS' },
  '/aix/ivs/ivs-biometric-page': { sessionId: 'preview-ivs-session' },
  '/aix/ivs/ivs-email-otp-page': { sessionId: 'preview-ivs-session' },
  '/aix/ivs/ivs-liveness-aai-page': { sessionId: 'preview-ivs-session', authUrl: 'about:blank' },
  '/aix/ivs/ivs-liveness-result-page': { sessionId: 'preview-ivs-session', code: 'SUCCESS' },
  '/aix/ivs/ivs-liveness-start-page': { sessionId: 'preview-ivs-session' },
  '/aix/ivs/ivs-phone-otp-page': { sessionId: 'preview-ivs-session' },
  '/aix/ivs/ivs-pwd-page': { sessionId: 'preview-ivs-session' },
  '/aix/ivs/phone-otp-page': {
    phone: '88888888', areaCode: '+65', countryCode: 'SG', _PageOptionId: 'preview-page-option',
  },
  '/aix/kyc/launch': { targetPage: '/aix/home/home-page' },
  '/aix/kyc/waitlist': { countryCode: 'SG', targetPage: '/aix/home/home-page' },
  '/aix/user/about-us-webview': { url: 'about:blank', title: 'About AIX Pay' },
  '/aix/user/enable-biometric': { type: 'Login' },
  '/aix/user/login-page': { showLockout: 'false' },
  '/aix/countries/select-country': { sessionId: 'preview-country-session' },
  '/aix/address/address-picker': {
    sessionId: 'preview-address-session',
    prefill: JSON.stringify({ countryCode: 'SG', province: 'Central Singapore', city: 'Singapore' }),
  },
});

const nonVisualRoutes = new Set([
  '/aix/ivs/ivs-begin-page',
]);

module.exports = { routePresets, nonVisualRoutes, cardApplyConfig, virtualOption, physicalOption, faq };
