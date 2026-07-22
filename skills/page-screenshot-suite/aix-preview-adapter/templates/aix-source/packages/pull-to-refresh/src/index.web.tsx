import React from 'react';
import { View, type ViewProps } from 'react-native';
import type {
  PullToRefreshFooterProps,
  PullToRefreshHeaderProps,
  PullToRefreshProps,
} from './types';

export * from './types';

export function PullToRefreshHeader(_props: PullToRefreshHeaderProps) {
  return null;
}

export function PullToRefreshFooter(_props: PullToRefreshFooterProps) {
  return null;
}

export class PullToRefresh extends React.Component<PullToRefreshProps> {
  static setDefaultHeader(_header: React.ComponentType<PullToRefreshHeaderProps>) {}
  static setDefaultFooter(_footer: React.ComponentType<PullToRefreshFooterProps>) {}

  render() {
    const { children, style, ...props } = this.props;
    const viewProps = props as ViewProps;
    return <View {...viewProps} style={[{ flex: 1 }, style]}>{children}</View>;
  }
}

export default function RefreshControl() {
  return null;
}
