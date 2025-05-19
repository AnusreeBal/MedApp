import { Timestamp } from 'firebase/firestore';

export interface Order {
  id: string;
  orderId: string;
  status: string;
  customerDetails: {
    name: string;
    phoneNumber: string;
  };
  items: Array<{
    medicineId: string;
    name: string;
    price: number;
    quantity: number;
    sellerId: string | null;
  }>;
  payment: {
    method: string;
    status: string;
    total: number;
  };
  shippingAddress: {
    address: string;
    city: string;
    pincode: string;
    state: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  userId: string;
  shippingDetails?: {
    shippedAt: Timestamp;
    expectedDeliveryDate: Timestamp;
    shippedBy: string;
  };
}