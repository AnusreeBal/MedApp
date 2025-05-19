
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';

export default function ConditionScreen() {
  const { id } = useLocalSearchParams();

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <ThemedText>Condition ID: {id}</ThemedText>
    </View>
  );
}