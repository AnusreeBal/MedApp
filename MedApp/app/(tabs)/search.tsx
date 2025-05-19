import { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  TextInput, 
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Alert
} from 'react-native';
import { collection, query, getDocs } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { db } from '@/services/firebase';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

interface Medicine {
  id: string;
  name: string;
  brand: string;
  price: number;
  category: string;
  stock: number;
}

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);

  // Add new search handler for real-time search
  const handleSearchInputChange = async (text: string) => {
    setSearchQuery(text);
    
    if (!text.trim()) {
      setMedicines([]);
      return;
    }

    setLoading(true);
    try {
      const medicinesRef = collection(db, 'medicines');
      const querySnapshot = await getDocs(medicinesRef);
      
      const searchTerm = text.toLowerCase().trim();
      const results = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Medicine))
        .filter(medicine => 
          medicine.name.toLowerCase().startsWith(searchTerm) ||
          medicine.brand.toLowerCase().startsWith(searchTerm)
        );

      setMedicines(results);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Failed to search medicines');
    } finally {
      setLoading(false);
    }
  };

  const renderMedicineItem = ({ item }: { item: Medicine }) => (
    <TouchableOpacity 
      style={styles.medicineCard}
      onPress={() => router.push(`/product/${item.id}`)}
    >
      <View style={styles.medicineInfo}>
        <ThemedText style={styles.medicineName}>{item.name}</ThemedText>
        <ThemedText style={styles.medicineBrand}>{item.brand}</ThemedText>
        <View style={styles.detailsRow}>
          <ThemedText style={styles.medicineCategory}>{item.category}</ThemedText>
          <ThemedText style={styles.medicinePrice}>₹{item.price}</ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search medicines..."
            value={searchQuery}
            onChangeText={handleSearchInputChange}
            autoCapitalize="none"
          />
          {searchQuery ? (
            <TouchableOpacity 
              onPress={() => {
                setSearchQuery('');
                setMedicines([]);
              }}
            >
              <Ionicons name="close-circle" size={20} color="#64748B" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      ) : (
        <FlatList
          data={medicines}
          renderItem={renderMedicineItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.medicineList}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="medical-outline" size={64} color="#CBD5E1" />
              <ThemedText style={styles.emptyText}>
                {searchQuery 
                  ? 'No medicines found with this name' 
                  : 'Start typing to search medicines'
                }
              </ThemedText>
            </View>
          }
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    borderRadius: 8,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  medicineList: {
    padding: 16,
  },
  medicineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  medicineInfo: {
    flex: 1,
  },
  medicineName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  medicineBrand: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  medicineCategory: {
    fontSize: 14,
    color: '#6366F1',
  },
  medicinePrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 16,
  }
});