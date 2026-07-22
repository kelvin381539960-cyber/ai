import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  pageRegistry,
  type PageRegistryEntry,
} from '@/preview/pageRegistry.generated';

const categoryNames: Record<string, string> = {
  address: '地址',
  card: '卡',
  components: '公共组件',
  countries: '国家与地区',
  home: '首页',
  ivs: '安全验证',
  kyc: 'KYC',
  media: '媒体',
  message: '消息',
  splash: '启动',
  transaction: '交易',
  user: '用户',
  wallet: '钱包',
};

const kycNavParams = JSON.stringify({
  currentCountryISO: 'SG',
  currentDisplayName: 'Singapore',
  allowCountryISOList: ['SG', 'HK', 'US'],
  targetPage: '/aix/home/home-page',
  aaiPassportUrl: 'preview://passport-verification',
  aaiLivenessUrl: 'preview://face-verification',
});

const defaultParams: Record<string, string> = {
  preview: '1',
  scenario: 'default',
  transactionId: 'preview-card-payment',
  cardId: 'preview-card-001',
  messageId: 'preview-message-001',
  id: 'preview-id',
  type: 'VIRTUAL',
  status: 'SUCCESS',
  resultType: 'success',
  fullName: 'Preview User',
  originalFullName: 'Preview User',
  countryCode: 'SG',
  currency: 'USDT',
  network: 'ETH',
  networkCode: 'ETH',
  asset: 'USDT',
  amount: '100',
  sellCurrency: 'USDT',
  buyCurrency: 'USDC',
  nextPath: '/aix/debug/page-gallery',
  modal: 'card',
  kycNavParams,
  depositMethod: JSON.stringify({
    method: 'EXCHANGE',
    displayName: 'Exchange',
    description: 'Preview deposit method',
    currencies: [],
    order: 1,
  }),
  nextParams: '{}',
};

const businessPages = pageRegistry.filter(item => !item.internal);

function openPage(item: PageRegistryEntry) {
  const params = { ...defaultParams, ...item.previewParams };
  for (const name of item.params) {
    params[name] ??= `preview-${name}`;
  }
  router.push({ pathname: item.route as never, params } as never);
}

export function PageGalleryPage() {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return businessPages;
    return businessPages.filter(item =>
      [item.title, item.category, item.route, item.sourcePath]
        .join(' ')
        .toLowerCase()
        .includes(keyword),
    );
  }, [query]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>AIX Page Gallery</Text>
        <Text style={styles.summary}>
          {filtered.length} / {businessPages.length} 个业务页面 · Preview 数据隔离
        </Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="搜索页面、模块或路由"
          placeholderTextColor="#777"
          style={styles.search}
        />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => <PageItem item={item} />}
      />
    </SafeAreaView>
  );
}

function PageItem({ item }: { item: PageRegistryEntry }) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.75}
      onPress={() => openPage(item)}
      style={styles.card}
      testID={`gallery-${item.id}`}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.category}>
          {categoryNames[item.category] || item.category}
        </Text>
      </View>
      <Text selectable style={styles.route}>{item.route}</Text>
      <Text style={styles.source}>{item.sourcePath}</Text>
      {(item.params.length > 0 || item.nativeCapabilities.length > 0) && (
        <View style={styles.tags}>
          {item.params.length > 0 && (
            <Text style={styles.tag}>参数 {item.params.length}</Text>
          )}
          {item.nativeCapabilities.map(capability => (
            <Text key={capability} style={styles.tag}>{capability}</Text>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    alignItems: Platform.OS === 'web' ? 'center' : 'stretch',
  },
  header: {
    width: '100%',
    maxWidth: 720,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  title: { fontSize: 28, fontWeight: '700', color: '#111' },
  summary: { marginTop: 6, fontSize: 14, color: '#555' },
  search: {
    marginTop: 16,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d6d6d6',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    color: '#111',
  },
  list: {
    width: '100%',
    maxWidth: 720,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  separator: { height: 10 },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    backgroundColor: '#fff',
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  cardTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: '#111' },
  category: {
    overflow: 'hidden',
    borderRadius: 999,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 9,
    paddingVertical: 4,
    fontSize: 12,
    color: '#333',
  },
  route: { marginTop: 8, fontSize: 13, color: '#333' },
  source: { marginTop: 4, fontSize: 11, color: '#888' },
  tags: { marginTop: 10, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: {
    borderRadius: 6,
    backgroundColor: '#fff0e5',
    paddingHorizontal: 7,
    paddingVertical: 3,
    fontSize: 11,
    color: '#8a3d00',
  },
});
