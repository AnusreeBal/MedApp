import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

type TextType = 'default' | 'defaultSemiBold' | 'title' | 'subtitle';

interface ThemedTextProps extends TextProps {
  type?: TextType;
}

export function ThemedText({ style, type = 'default', ...props }: ThemedTextProps) {
  const colorScheme = useColorScheme();
  const textColor = colorScheme === 'dark' ? '#fff' : '#000';

  const textStyle = [
    { color: textColor },
    styles[type],
    style,
  ];

  return <Text style={textStyle} {...props} />;
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
  },
  defaultSemiBold: {
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
  },
});
