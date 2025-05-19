import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Svg, Path } from 'react-native-svg';

interface IconSymbolProps {
  name: string;
  size?: number;
  color?: string;
}

// Simple placeholder implementation - you'll need to replace this with actual icons
export function IconSymbol({ name, size = 24, color = '#000' }: IconSymbolProps) {
  // This is a simplified version - in a real app, you'd have proper SVG paths for each icon
  const getPath = () => {
    switch (name) {
      case 'house.fill':
        return 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z';
      case 'magnifyingglass':
        return 'M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z';
      case 'cart.fill':
        return 'M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z';
      case 'person.fill':
        return 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z';
      default:
        return '';
    }
  };

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d={getPath()} fill={color} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
