const countries = [
  { group: 'S', countryISO: 'SG', displayName: 'Singapore', phoneAreaCode: '+65' },
  { group: 'H', countryISO: 'HK', displayName: 'Hong Kong', phoneAreaCode: '+852' },
  { group: 'U', countryISO: 'US', displayName: 'United States', phoneAreaCode: '+1' },
];

const transactions = [
  {
    id: 'preview-card-payment',
    type: 'PAYMENT',
    state: 'SUCCESS',
    stateDisplay: 'Completed',
    stateColor: '#767676',
    amount: '26.80',
    currency: 'USD',
    sellAmount: '',
    buyAmount: '',
    sellCurrency: '',
    buyCurrency: '',
    displayAmount: '-26.80 USD',
    displaySellAmount: '',
    transactionDate: '2026-07-21 12:30:00',
    transactionDescription: 'Preview Coffee',
    sourceType: 'CARD',
    mainIcon: '',
    subIcon: '',
    sectionTitle: 'Today',
  },
];

const walletAssets = {
  totalValue: { amount: '1024.50', currency: 'USD', displayText: '$1,024.50' },
  stablecoins: [
    {
      currency: 'USDT',
      symbol: 'USDT',
      balance: { amount: '824.50', currency: 'USDT', displayText: '824.50 USDT' },
      fiatValue: { amount: '824.50', currency: 'USD', displayText: '$824.50' },
    },
    {
      currency: 'USDC',
      symbol: 'USDC',
      balance: { amount: '200.00', currency: 'USDC', displayText: '200.00 USDC' },
      fiatValue: { amount: '200.00', currency: 'USD', displayText: '$200.00' },
    },
  ],
};

const cardList = [{
  cardId: 'preview-card-001',
  cardStatus: 'ACTIVE',
  cardType: 'VIRTUAL',
  cardStyle: '',
  cardBackStyle: '',
  truncatedCardNumber: '**** 3104',
  lastFourDigitCardNo: '3104',
  cardNoColor: '#FFFFFF',
  isSetPin: true,
  cardTypeDisplayName: 'Virtual Card',
  widgets: [],
}];

const addressData = {
  addresses: [
    { id: 1, name: 'Singapore', localName: 'Singapore', code: 'SG', parentCode: null, level: '1', groupName: 'S' },
    { id: 2, name: 'Hong Kong', localName: 'Hong Kong', code: 'HK', parentCode: null, level: '1', groupName: 'H' },
    { id: 3, name: 'United States', localName: 'United States', code: 'US', parentCode: null, level: '1', groupName: 'U' },
  ],
  countryLevel: [
    { code: 'SG', level: '3' },
    { code: 'HK', level: '3' },
    { code: 'US', level: '4' },
  ],
};

const cardApplyData = {
  applyOrder: 'preview-apply-order',
  hasApplied: false,
  hasDiscount: false,
  needTopup: false,
  cardOptions: [
    {
      cardType: 'VIRTUAL', order: 1, canApply: true,
      email: 'preview@aixpay.co', fullName: 'Preview User', originalFullName: 'Preview User',
      phoneCountryCode: 'SG', countryNo: '+65', phoneNumber: '88888888',
      cardFee: { cardFee: '10', cardFeeDisplay: '10 USD', discount: '10', discountDisplay: 'Invite Reward -10 USD', discountTag: 'Invite Reward', isFree: true, payableCardFee: '0', payableCardFeeDisplay: '0 USD' },
      cardFaceList: [
        { code: 'ORANGE', name: 'AIX Orange', colorRgb: '#FF6230', order: 1, frontUrl: '', backUrl: '' },
        { code: 'BLACK', name: 'AIX Black', colorRgb: '#161616', order: 2, frontUrl: '', backUrl: '' },
      ],
      currencyList: [
        { code: 'USDT', name: 'Tether USD', desc: 'Widely used with strong liquidity.', order: 1 },
        { code: 'USDC', name: 'USD Coin', desc: 'A regulated digital dollar.', order: 2 },
      ],
    },
    {
      cardType: 'PHYSICAL', order: 2, canApply: true,
      email: 'preview@aixpay.co', fullName: 'Preview User', originalFullName: 'Preview User',
      phoneCountryCode: 'SG', countryNo: '+65', phoneNumber: '88888888',
      cardFee: { cardFee: '50', cardFeeDisplay: '50 USD', discount: '10', discountDisplay: 'Invite Reward -10 USD', discountTag: 'Invite Reward', isFree: false, payableCardFee: '40', payableCardFeeDisplay: '40 USD' },
      cardFaceList: [{ code: 'SILVER', name: 'AIX Silver', colorRgb: '#858585', order: 1, frontUrl: '', backUrl: '' }],
      currencyList: [{ code: 'USDT', name: 'Tether USD', desc: 'Widely used with strong liquidity.', order: 1 }],
    },
  ],
  selectPlan: [],
};

const globalConfigData = {
  uiConfig: {
    meTab: { languageList: [
      { code: 'en', displayName: 'English' }, { code: 'es', displayName: 'Español' },
      { code: 'pt', displayName: 'Português' }, { code: 'tr', displayName: 'Türkçe' },
      { code: 'vi', displayName: 'Tiếng Việt' },
    ] },
    aixTagTab: { excludeKeywordList: [] },
    faqConfig: { faqs: [] },
  },
  system: { broadcasts: [], nextSendInterval: 60 },
};

const homeData = {
  navigationConfigs: { activity: { isUnRead: true }, message: { unReadNum: 3 } },
  widgets: [
    {
      type: 'WALLET',
      data: {
        totalAsset: '$1,024.50',
        cryptos: [{ title: 'USDT' }, { title: 'USDC' }],
      },
    },
    {
      type: 'CARD',
      data: {
        applayCardButton: 'SHOW',
        cards: [{
          cardId: 'preview-card-001',
          cardType: 'VIRTUAL',
          cardStatus: 'ACTIVE',
          cardTypeDisplayName: 'Virtual Card',
          truncatedCardNumber: '**** 3104',
          isSetPin: true,
        }],
      },
    },
    {
      type: 'FAQ',
      data: {
        title: 'Frequently asked questions',
        faqs: [{ title: 'How does AIX Pay work?', content: 'Preview answer.' }],
      },
    },
  ],
};

function fixtureFor(url: string): unknown {
  if (url.includes('/api/home/main')) return homeData;
  if (url.includes('/api/marketing/rewards/pull')) return null;
  if (url.includes('/api/content-operation/promos')) return { popUps: [] };
  if (url.includes('api/config/global')) return globalConfigData;
  if (url.includes('/api/wallet/common/address')) return addressData;
  if (url.includes('/api/card/chooseCard')) return cardApplyData;
  if (url.includes('/api/card/faq/query')) {
    return { faqs: [{ questionId: 'preview-faq', title: 'How does the card work?', description: 'Use your AIX Pay card wherever Visa is accepted.' }] };
  }
  if (url.includes('/api/card/manager/cards/list')) return { cardList };
  if (url.includes('/api/wallet/assets/overview')) return walletAssets;
  if (url.includes('/phone-area-list/kyc-start-page')) {
    return { currentCountryISO: 'SG', phoneAreaList: countries };
  }
  if (url.includes('api/config/phone-area-list')) {
    return {
      currentCountryISO: 'SG',
      allowCountryISOList: countries.map(item => item.countryISO),
      phoneAreaList: countries,
    };
  }
  if (url.includes('/api/content-operation/messages/preview-message-001')) {
    return {
      messageId: 'preview-message-001',
      keyTitle: 'Card application approved',
      keyMessage: 'Your virtual card is ready to use. You can start making online payments now.',
      isRead: true,
      displayStatusType: 'SUCCESS',
      displayStatusName: 'Completed',
      createTime: 1784637000000,
    };
  }
  if (url.includes('/api/content-operation/messages')) {
    return {
      messages: [{
        messageId: 'preview-message-001',
        keyTitle: 'Card application approved',
        keyMessage: 'Your virtual card is ready to use.',
        isRead: false,
        displayStatusType: 'SUCCESS',
        displayStatusName: 'Completed',
        createTime: 1784637000000,
      }],
      categories: [{ id: 'all', displayName: 'All', isAllRead: false }],
      businessLines: [],
    };
  }
  if (url.includes('/transactions') || url.includes('listCardTransactions')) {
    return { data: transactions };
  }
  if (url.includes('/api/wallet/kyc/start')) {
    return {
      currentCountryISO: 'SG',
      currentDisplayName: 'Singapore',
      allowCountryISOList: countries.map(item => item.countryISO),
    };
  }
  if (url.includes('loading-passport-face-result')) {
    return {
      routePage: 'ROUTE_KYC_START_PAGE',
      currentCountryISO: 'SG',
      currentDisplayName: 'Singapore',
      allowCountryISOList: countries.map(item => item.countryISO),
    };
  }
  if (url.includes('passport/get-url')) {
    return { url: 'preview://passport-verification' };
  }
  if (url.includes('liveness/get-url')) {
    return { url: 'preview://face-verification' };
  }
  if (url.includes('/api/wallet/deposit/address')) {
    return { address: '0x1234567890abcdef1234567890abcdef12345678' };
  }
  if (url.includes('/api/wallet/deposit/config')) {
    return { depositMethods: [] };
  }
  if (url.includes('/api/wallet/transactions/recent')) {
    return { data: transactions };
  }
  if (url.includes('/api/wallet/common/dicts')) {
    return {
      SWAP_DEFAULT_CURRENCY: [{ code: 'USDT', name: 'USDT', order: 1 }],
      SWAP_MINIMUM_AMOUNT: [{ code: 'USDT', name: '10', order: 1 }],
      CARD_CURRENCY_ICON: [],
    };
  }
  if (url.includes('/api/wallet/currency/swap')) {
    return {
      rate: '1',
      rateDisplay: '1 USDT = 1 USDC',
      sellWalletBalance: '824.50',
      sellWalletBalanceDisplay: '824.50 USDT',
      quoteId: 'preview-quote',
      rateExpiryTime: '1700000060',
      rateExpiryTimeHash: 'preview-hash',
      buyAmount: '10.00',
      buyAmountDisplay: '10.00 USDC',
      status: 'COMPLETED',
    };
  }
  if (url.includes('/api/user/info')) {
    return {
      userId: 'preview-user',
      email: 'preview@aixpay.co',
      nickName: 'Preview User',
      aixTag: 'preview',
      countryCode: 'SG',
    };
  }
  return {};
}

export function createPreviewResponse(url: string): string {
  return JSON.stringify({ code: 'SUCCESS', data: fixtureFor(url) });
}
