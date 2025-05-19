export interface OrderItem {
  medicineId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface ShippingAddress {
  fullName: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Order {
  userId: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}