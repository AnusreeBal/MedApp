import { useState, useEffect } from 'react';
import { StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';

import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { db } from '@/services/firebase';

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  categoryId: string;
  description: string;
};

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      try {
        // Get category name
        const categoryRef = doc(db, 'categories', id as string);
        const categorySnap = await getDoc(categoryRef);
        
        if (categorySnap.exists()) {
          setCategoryName(categorySnap.data().name);
        }

        // Get products in this category
        const productsQuery = query(
          collection(db, 'products'), 
          where('categoryId', '==', id)
        );
        
        const querySnapshot = await getDocs(productsQuery);
        const productList: Product[] = [];
        
        querySnapshot.forEach((doc) => {
          productList.push({
            id: doc.id,
            ...doc.data() as Omit<Product, 'id'>
          });
        });
        
        setProducts(productList);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCategoryAndProducts();
    }
  }, [id]);

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ThemedText>← Back</ThemedText>
        </TouchableOpacity>
        <ThemedText type="title">{categoryName}</ThemedText>
      </ThemedView>

      {products.length > 0 ? (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.productCard}
              onPress={() => router.push(`/product/${item.id}`)}
            >
              <Image 
                source={{ uri: item.image }} 
                style={styles.productImage} 
              />
              <ThemedView style={styles.productInfo}>
                <ThemedText style={styles.productName}>{item.name}</ThemedText>
                <ThemedText style={styles.productPrice}>₹{item.price}</ThemedText>
              </ThemedView>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.productList}
        />
      ) : (
        <ThemedView style={styles.emptyContainer}>
          <ThemedText>No products found in this category.</ThemedText>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginTop: 40,
    marginBottom: 20,
  },
  backButton: {
    marginBottom: 10,
  },
  productList: {
    paddingBottom: 20,
  },
  productCard: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImage: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
  productInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  productName: {
    fontWeight: '600',
    marginBottom: 6,
  },
  productPrice: {
    fontWeight: 'bold',
    color: '#0a7ea4',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});