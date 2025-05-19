import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

export function ThemedView({ style, ...props }: ViewProps) {
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? '#121212' : '#ffffff';

  return <View style={[{ backgroundColor }, style]} {...props} />;
}
