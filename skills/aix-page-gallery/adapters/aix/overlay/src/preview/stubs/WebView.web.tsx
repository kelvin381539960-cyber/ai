import React, { forwardRef, useEffect, useImperativeHandle } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  source?: { uri?: string; html?: string };
  style?: unknown;
  onLoadEnd?: () => void;
  onError?: (event?: unknown) => void;
  onNavigationStateChange?: (state: { url: string; title: string }) => void;
  renderLoading?: () => React.ReactNode;
};

export const WebView = forwardRef(function PreviewWebView(props: Props, ref) {
  const url = props.source?.uri ?? 'about:blank';
  useImperativeHandle(ref, () => ({
    goBack: () => undefined,
    goForward: () => undefined,
    reload: () => props.onLoadEnd?.(),
    injectJavaScript: () => undefined,
    postMessage: () => undefined,
  }));
  useEffect(() => {
    props.onNavigationStateChange?.({ url, title: 'AIX Pay Preview' });
    props.onLoadEnd?.();
  }, [url]);
  return (
    <View style={[styles.container, props.style as any]}>
      <Text style={styles.eyebrow}>WEB CONTENT PREVIEW</Text>
      <Text style={styles.title}>AIX Pay</Text>
      <Text style={styles.body}>External web content is disabled in Page Gallery.</Text>
      <Text numberOfLines={2} style={styles.url}>{url}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#ffffff' },
  eyebrow: { fontSize: 12, color: '#767676', marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '700', color: '#161616' },
  body: { marginTop: 10, fontSize: 15, lineHeight: 22, color: '#444444' },
  url: { marginTop: 16, fontSize: 12, color: '#767676' },
});

export default WebView;
