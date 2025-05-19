import React from 'react';
import { Platform, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';

export function HapticTab(props: BottomTabBarButtonProps) {
  const handlePress = React.useCallback(() => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    props.onPress && props.onPress();
  }, [props.onPress]);

  // Use Pressable instead of props.ButtonComponent
  return (
    <Pressable
      {...props}
      onPress={handlePress}
      style={props.style}
    >
      {props.children}
    </Pressable>
  );
}
