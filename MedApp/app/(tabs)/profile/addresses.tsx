import { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert,
  ActivityIndicator 
} from 'react-native';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { db } from '@/services/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

interface Address {
  id: string;
  fullName: string;
  phoneNumber: string;
  addressType: 'home' | 'office' | 'other';
  address: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
}

const ADDRESS_TYPES = [
  { 
    id: 'home',
    label: 'Home',
    icon: 'home-outline'
  },
  { 
    id: 'office',
    label: 'Office',
    icon: 'business-outline'
  },
  { 
    id: 'other',
    label: 'Other',
    icon: 'location-outline'
  }
] as const;

const defaultAddressType = 'home';

export default function AddressesScreen() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [newAddress, setNewAddress] = useState<Partial<Address>>({
    fullName: '',
    phoneNumber: '',
    addressType: defaultAddressType,
    address: '',
    landmark: '',
    city: '',
    state: '',
    pincode: ''
  });

  useEffect(() => {
    if (user) fetchAddresses();
  }, [user]);

  const fetchAddresses = async () => {
    try {
      const addressesRef = collection(db, 'addresses');
      const q = query(addressesRef, where('userId', '==', user?.uid));
      const snapshot = await getDocs(q);
      const addressList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Address[];
      setAddresses(addressList);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const handleAddAddress = async () => {
    try {
      const addressesRef = collection(db, 'addresses');
      if (!user) return;
      await addDoc(addressesRef, {
        ...newAddress,
        userId: user.uid,
        createdAt: new Date()
      });
      setNewAddress({
        fullName: '',
        phoneNumber: '',
        addressType: defaultAddressType,
        address: '',
        landmark: '',
        city: '',
        state: '',
        pincode: ''
      });
      setShowForm(false);
      fetchAddresses();
    } catch (error) {
      console.error('Error adding address:', error);
    }
  };

  const handleDeleteAddress = (addressId: string) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'addresses', addressId));
              await fetchAddresses();
              Alert.alert('Success', 'Address deleted successfully');
            } catch (error) {
              console.error('Error deleting address:', error);
              Alert.alert('Error', 'Failed to delete address');
            }
          }
        }
      ]
    );
  };

  const handleEditAddress = (address: Address) => {
    setSelectedAddress(address);
    setNewAddress(address);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleUpdateAddress = async () => {
    if (!selectedAddress?.id) return;

    try {
      await updateDoc(doc(db, 'addresses', selectedAddress.id), {
        ...newAddress,
        updatedAt: new Date()
      });
      setShowForm(false);
      setIsEditing(false);
      setSelectedAddress(null);
      setNewAddress({
        fullName: '',
        phoneNumber: '',
        addressType: defaultAddressType,
        address: '',
        landmark: '',
        city: '',
        state: '',
        pincode: ''
      });
      await fetchAddresses();
      Alert.alert('Success', 'Address updated successfully');
    } catch (error) {
      console.error('Error updating address:', error);
      Alert.alert('Error', 'Failed to update address');
    }
  };

  const renderAddressTypeSelector = () => (
    <View style={styles.addressTypeContainer}>
      {ADDRESS_TYPES.map((type) => (
        <TouchableOpacity
          key={type.id}
          style={[
            styles.addressTypeButton,
            newAddress.addressType === type.id && styles.addressTypeSelected
          ]}
          onPress={() => setNewAddress({...newAddress, addressType: type.id})}
        >
          <Ionicons 
            name={type.icon} 
            size={20} 
            color={newAddress.addressType === type.id ? '#6366F1' : '#64748B'} 
          />
          <ThemedText style={[
            styles.addressTypeText,
            newAddress.addressType === type.id && styles.addressTypeTextSelected
          ]}>
            {type.label}
          </ThemedText>
        </TouchableOpacity>
      ))}
    </View>
  );

  const getAddressTypeIcon = (type: string) => {
    const addressType = ADDRESS_TYPES.find(t => t.id === type);
    return addressType?.icon || 'location-outline';
  };

  const getAddressTypeLabel = (type: string) => {
    const addressType = ADDRESS_TYPES.find(t => t.id === type);
    return addressType?.label || 'Other';
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>My Addresses</ThemedText>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowForm(true)}
        >
          <Ionicons name="add" size={24} color="#6366F1" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {showForm && (
          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={newAddress.fullName}
              onChangeText={(text) => setNewAddress({...newAddress, fullName: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              keyboardType="phone-pad"
              value={newAddress.phoneNumber}
              onChangeText={(text) => setNewAddress({...newAddress, phoneNumber: text})}
            />
            {renderAddressTypeSelector()}
            <TextInput
              style={styles.input}
              placeholder="Address"
              multiline
              value={newAddress.address}
              onChangeText={(text) => setNewAddress({...newAddress, address: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="Landmark"
              value={newAddress.landmark}
              onChangeText={(text) => setNewAddress({...newAddress, landmark: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="City"
              value={newAddress.city}
              onChangeText={(text) => setNewAddress({...newAddress, city: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="State"
              value={newAddress.state}
              onChangeText={(text) => setNewAddress({...newAddress, state: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="PIN Code"
              keyboardType="numeric"
              value={newAddress.pincode}
              onChangeText={(text) => setNewAddress({...newAddress, pincode: text})}
            />
            <View style={styles.formButtons}>
              <TouchableOpacity 
                style={[styles.formButton, styles.cancelButton]}
                onPress={() => {
                  setShowForm(false);
                  setIsEditing(false);
                  setSelectedAddress(null);
                  setNewAddress({
                    fullName: '',
                    phoneNumber: '',
                    addressType: defaultAddressType,
                    address: '',
                    landmark: '',
                    city: '',
                    state: '',
                    pincode: ''
                  });
                }}
              >
                <ThemedText style={styles.buttonText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.formButton, styles.saveButton]}
                onPress={isEditing ? handleUpdateAddress : handleAddAddress}
              >
                <ThemedText style={styles.buttonText}>
                  {isEditing ? 'Update Address' : 'Save Address'}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.addressList}>
          {addresses.map((address) => (
            <View key={address.id} style={styles.addressCard}>
              <View style={styles.addressHeader}>
                <View style={styles.addressTypeTag}>
                  <Ionicons 
                    name={getAddressTypeIcon(address.addressType)} 
                    size={16} 
                    color="#6366F1" 
                  />
                  <ThemedText style={styles.addressTypeLabel}>
                    {getAddressTypeLabel(address.addressType)}
                  </ThemedText>
                </View>
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleEditAddress(address)}
                  >
                    <Ionicons name="create-outline" size={20} color="#6366F1" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteAddress(address.id)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
              <ThemedText style={styles.name}>{address.fullName}</ThemedText>
              <ThemedText style={styles.phone}>{address.phoneNumber}</ThemedText>
              <ThemedText style={styles.addressText}>
                {address.address}, {address.city}
              </ThemedText>
              {address.landmark && (
                <ThemedText style={styles.addressText}>
                  Landmark: {address.landmark}
                </ThemedText>
              )}
              <ThemedText style={styles.addressText}>
                {address.state} - {address.pincode}
              </ThemedText>
            </View>
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  addButton: {
    padding: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
  },
  content: {
    padding: 16,
  },
  formContainer: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  addressTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  addressTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginHorizontal: 4,
  },
  addressTypeSelected: {
    backgroundColor: '#E0E7FF',
    borderColor: '#6366F1',
  },
  addressTypeText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#64748B',
  },
  addressTypeTextSelected: {
    color: '#6366F1',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  formButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#EF4444',
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: '#6366F1',
    marginLeft: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  addressList: {
    marginTop: 16,
  },
  addressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressTypeTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressTypeLabel: {
    fontSize: 14,
    color: '#6366F1',
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  deleteButton: {
    marginLeft: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  phone: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 4,
  }
});