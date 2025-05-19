import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index"
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="addresses"
        options={{ 
          headerShown: false 
        }}
      />
      <Stack.Screen 
        name="wishlist"
        options={{ 
          headerShown: false 
        }}
      />
      <Stack.Screen 
        name="orders"
        options={{ 
          headerShown: false 
        }}
      />
    </Stack>
  );
}