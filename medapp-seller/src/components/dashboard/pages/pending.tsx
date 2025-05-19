import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { useAuth } from '../../../contexts/AuthContext';
import {
  Container,
  Typography,
  CircularProgress,
  Paper,
  Box,
  Button,
  Chip,
  Divider,
  Alert,
  Snackbar
} from '@mui/material';
import { Order } from '../../../types/orders';

interface Snackbar {
  open: boolean;
  message: string;
  severity?: 'success' | 'error';
}

export default function PendingOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const { currentUser } = useAuth();

  const fetchPendingOrders = async () => {
    setLoading(true);
    try {
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, where('status', '==', 'pending'));
      const snapshot = await getDocs(q);
      
      const fetchedOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];

      setOrders(fetchedOrders);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleShipOrder = async (orderId: string) => {
    if (!currentUser) return;

    try {
      const orderRef = doc(db, 'orders', orderId);
      
      // Get current order data
      const orderDoc = await getDoc(orderRef);
      if (!orderDoc.exists()) {
        throw new Error('Order not found');
      }

      const now = Timestamp.now();
      
      // Update only allowed fields
      const updateData = {
        status: 'completed',
        updatedAt: now,
        shippingDetails: {
          shippedAt: now,
          expectedDeliveryDate: new Timestamp(
            now.seconds + (3 * 24 * 60 * 60),
            now.nanoseconds
          ),
          shippedBy: currentUser.uid
        }
      };

      await updateDoc(orderRef, updateData);
      
      // Update local state
      setOrders(prev => prev.filter(order => order.id !== orderId));
      setSnackbar({
        open: true,
        message: 'Order marked as shipped successfully',
        severity: 'success'
      });

    } catch (error) {
      console.error('Error updating order:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update order status',
        severity: 'error'
      });
    }
  };

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  const formatDate = (timestamp: { seconds: number; nanoseconds: number }) => {
    return new Date(timestamp.seconds * 1000).toLocaleString();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Pending Orders
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box display="flex" justifyContent="center" m={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {orders.map((order) => (
            <Paper key={order.id} elevation={3} sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" color="primary">
                  Order #{order.orderId}
                </Typography>
                <Chip 
                  label={order.status.toUpperCase()} 
                  color="warning"
                />
              </Box>

              <Divider sx={{ my: 2 }} />
              
              <Box mb={2}>
                <Typography variant="subtitle1" gutterBottom>Customer Details</Typography>
                <Typography>Name: {order.customerDetails.name}</Typography>
                <Typography>Phone: {order.customerDetails.phoneNumber}</Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box mb={2}>
                <Typography variant="subtitle1" gutterBottom>Shipping Address</Typography>
                <Typography>{order.shippingAddress.address}</Typography>
                <Typography>
                  {order.shippingAddress.city}, {order.shippingAddress.state}
                </Typography>
                <Typography>PIN: {order.shippingAddress.pincode}</Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box mb={2}>
                <Typography variant="subtitle1" gutterBottom>Order Items</Typography>
                {order.items.map((item, index) => (
                  <Box key={index} sx={{ mb: 1 }}>
                    <Typography>
                      {item.name} - Qty: {item.quantity} - ₹{item.price}/unit
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="subtitle1">
                    Total Amount: ₹{order.payment.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Payment Method: {order.payment.method.toUpperCase()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ordered on: {formatDate(order.createdAt)}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleShipOrder(order.id)}
                >
                  Mark as Shipped
                </Button>
              </Box>
            </Paper>
          ))}

          {orders.length === 0 && (
            <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
              <Typography>No pending orders found</Typography>
            </Paper>
          )}
        </Box>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Container>
  );
}
