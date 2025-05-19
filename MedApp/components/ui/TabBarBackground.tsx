import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabBarBackground() {
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? '#1c1c1c' : '#ffffff';
  const borderColor = colorScheme === 'dark' ? '#333333' : '#e0e0e0';

  return (
    <View 
      style={[
        styles.background,
        { 
          backgroundColor,
          borderTopColor: borderColor
        }
      ]} 
    />
  );
}

const styles = StyleSheet.create({
  background: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderTopWidth: 1,
  },
});
