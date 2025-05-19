import { StyleSheet, TouchableOpacity, Image, Alert, ScrollView, View, Linking, Text } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/contexts/AuthContext';
import { ExternalLink } from '@/components/ExternalLink';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  interface Order {
    id: string;
    userId: string;
    createdAt: any;
    [key: string]: any;
  }
  
  const [orders, setOrders] = useState<Order[]>([]);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
            }
          }
        },
      ]
    );
  };

  const fetchOrders = async () => {
    if (!user) return;
    
    try {
      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const ordersList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      setOrders(ordersList);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleBecomeSellerPress = async () => {
    // Local development URL - change port if different
    const sellerUrl = 'http://10.58.28.151:3000/register';
    
    try {
      const supported = await Linking.canOpenURL(sellerUrl);
      if (supported) {
        await Linking.openURL(sellerUrl);
      } else {
        Alert.alert('Error', 'Cannot open seller website');
      }
    } catch (error) {
      console.error('Error opening URL:', error);
      Alert.alert('Error', 'Failed to open seller website');
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <Image 
          source={{ uri: 'https://via.placeholder.com/100' }} 
          style={styles.profileImage} 
        />
        <View style={styles.headerContent}>
          <ThemedText style={styles.name}>{user?.name || 'User'}</ThemedText>
          <ThemedText style={styles.email}>{user?.email}</ThemedText>
        </View>
        <TouchableOpacity style={styles.editButton}>
          <Ionicons name="create-outline" size={22} color="#6366F1" />
        </TouchableOpacity>
      </ThemedView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.menuSection}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleBecomeSellerPress}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: '#EEF2FF' }]}>
              <Ionicons name="storefront-outline" size={22} color="#6366F1" />
            </View>
            <View style={styles.menuContent}>
              <ThemedText style={styles.menuText}>Become a Seller</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6366F1" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.box} 
            onPress={() => router.push('/(tabs)/profile/orders')}
          >
            <View style={styles.boxContent}>
              <Ionicons name="receipt-outline" size={24} color="#6366F1" />
              <Text style={styles.boxText}>My Orders</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.box} 
            onPress={() => router.push('/(tabs)/profile/addresses')}
          >
            <View style={styles.boxContent}>
              <Ionicons name="location-outline" size={24} color="#6366F1" />
              <Text style={styles.boxText}>Addresses</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/profile/wishlist')}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: '#EEF2FF' }]}>
              <Ionicons name="heart-outline" size={22} color="#6366F1" />
            </View>
            <View style={styles.menuContent}>
              <ThemedText style={styles.menuText}>Wishlist</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6366F1" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          <ThemedText style={styles.logoutText}>Logout</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerContent: {
    flex: 1,
    marginLeft: 16,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  email: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 20,
    marginHorizontal: 20,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#E2E8F0',
    marginHorizontal: 16,
    paddingHorizontal: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6366F1',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  menuSection: {
    marginTop: 24,
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 32,
    padding: 16,
    backgroundColor: '#FEE2E2',
    borderRadius: 16,
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '600',
    color: '#EF4444',
  },
  badge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
    marginLeft: 12,
  },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  boxContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  boxText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
    marginLeft: 12,
  },
});