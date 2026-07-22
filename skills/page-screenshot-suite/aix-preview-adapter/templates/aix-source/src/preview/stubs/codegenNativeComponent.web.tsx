import React, { forwardRef } from 'react';
import { View, type ViewProps } from 'react-native';

export default function codegenNativeComponent<Props extends ViewProps>(
  _componentName: string,
) {
  return forwardRef<View, Props>((props, ref) => <View ref={ref} {...props} />);
}
