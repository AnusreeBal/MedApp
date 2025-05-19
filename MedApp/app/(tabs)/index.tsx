import { useState, useEffect } from 'react';
import { StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { db } from '@/services/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

type Category = {
  id: string;
  name: string;
  image: string;
};

interface Medicine {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  imageUrl?: string;
  sellerId: string;
}

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const healthConditions: { id: string; name: string; icon: IconName }[] = [
  { id: '1', name: 'Diabetes', icon: 'fitness-outline' },
  { id: '2', name: 'Hypertension', icon: 'heart-outline' },
  { id: '3', name: 'Cholesterol', icon: 'water-outline' },
  { id: '4', name: 'Obesity', icon: 'body-outline' },
  { id: '5', name: 'Heart Disease', icon: 'pulse-outline' },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { cartCount } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categorySnapshot = await getDocs(collection(db, 'categories'));
        const categoryData: Category[] = [];
        categorySnapshot.forEach((doc) => {
          categoryData.push({
            id: doc.id,
            ...doc.data() as Omit<Category, 'id'>
          });
        });
        setCategories(categoryData);

        // Fetch medicines
        const medicineSnapshot = await getDocs(collection(db, 'medicines'));
        const medicineData = medicineSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Medicine[];
        setMedicines(medicineData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderConditionsGrid = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.conditionsGrid}
    >
      {healthConditions.map((condition) => (
        <TouchableOpacity 
          key={condition.id}
          style={styles.conditionCard}
          onPress={() => router.push(`/condition/${condition.id}`)}
        >
          <View style={styles.conditionIconContainer}>
            <Ionicons name={condition.icon} size={24} color="#6366F1" />
          </View>
          <ThemedText style={styles.conditionName}>{condition.name}</ThemedText>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderCategories = () => (
    <FlatList
      data={categories}
      keyExtractor={(item) => item.id}
      numColumns={2}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <TouchableOpacity 
          style={styles.categoryCard}
          onPress={() => router.push(`/category/${item.id}`)}
        >
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: item.image }} 
              style={styles.categoryImage}
              defaultSource={require('@/assets/images/placeholder.png')}
            />
          </View>
          <View style={styles.categoryContent}>
            <ThemedText style={styles.categoryName}>{item.name}</ThemedText>
            <Ionicons name="chevron-forward" size={18} color="#6366F1" />
          </View>
        </TouchableOpacity>
      )}
      contentContainerStyle={styles.categoryList}
    />
  );

  const renderMedicineCard = ({ item: medicine }: { item: Medicine }) => (
    <TouchableOpacity
      key={medicine.id}
      style={styles.medicineCard}
      onPress={() => router.push(`/product/${medicine.id}`)}
    >
      <View style={styles.medicineImageContainer}>
        <Image
          source={require('../../assets/images/medicine-placeholder.png')}
          style={styles.medicineImage}
          resizeMode="contain"
        />
      </View>
      <View style={styles.medicineContent}>
        <ThemedText style={styles.medicineName}>
          {medicine.name}
        </ThemedText>
        <ThemedText style={styles.medicinePrice}>
          ₹{medicine.price}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </ThemedView>
    );
  }

  return (
    <FlatList
      style={styles.container}
      ListHeaderComponent={() => (
        <>
          {/* Header section */}
          <ThemedView style={styles.header}>
            <View>
              <ThemedText style={styles.welcomeText}>Welcome back,</ThemedText>
              <ThemedText style={styles.userName}>{user?.name || 'User'}</ThemedText>
            </View>
            <TouchableOpacity 
              style={styles.cartButton}
              onPress={() => router.push('/(tabs)/cart')}
            >
              <View>
                <Ionicons name="cart-outline" size={24} color="#6366F1" />
                {cartCount > 0 && (
                  <View style={styles.cartBadge}>
                    <ThemedText style={styles.cartBadgeText}>
                      {cartCount}
                    </ThemedText>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </ThemedView>

          {/* Categories section */}
          <ThemedText style={styles.sectionTitle}>Categories</ThemedText>
          {renderCategories()}

          {/* Conditions section */}
          {renderConditionsGrid()}

          {/* Medicines section */}
          <View style={styles.medicinesSection}>
            <ThemedText style={styles.sectionTitle}>Available Medicines</ThemedText>
            <FlatList
              data={medicines}
              keyExtractor={(item) => item.id}
              renderItem={renderMedicineCard}
              numColumns={2}
              contentContainerStyle={styles.medicineGrid}
            />
          </View>
        </>
      )}
      data={[]} // Empty data as we're using ListHeaderComponent
      renderItem={null}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  categoryList: {
    padding: 20,
    paddingTop: 0,
  },
  categoryCard: {
    flex: 1,
    margin: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  imageContainer: {
    height: 120,
    backgroundColor: '#F1F5F9',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    flex: 1,
  },
  conditionsGrid: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  conditionCard: {
    alignItems: 'center',
    marginRight: 20,
    width: 85,
  },
  conditionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  conditionName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 16,
  },
  medicinesSection: {
    marginTop: 16,
  },
  medicineGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  medicineCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  medicineImageContainer: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  medicineImage: {
    width: '80%',
    height: '80%',
  },
  medicineContent: {
    padding: 12,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#1F2937',
  },
  medicinePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6366F1',
    marginBottom: 4,
  },
  cartBadge: {
    position: 'absolute',
    right: -8,
    top: -8,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 4,
  },
});
