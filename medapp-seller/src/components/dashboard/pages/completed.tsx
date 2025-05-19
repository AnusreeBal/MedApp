import React, { useEffect, useState } from 'react';
import { 
  doc, 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  Timestamp, 
  orderBy, 
  deleteDoc 
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { db } from '../../../services/firebase';
import { useAuth } from '../../../contexts/AuthContext';
import { Order } from '../../../types/orders';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DeleteIcon from '@mui/icons-material/Delete';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  medicineId: string;
  sellerId: string | null;
}

const formatDate = (timestamp: any) => {
  if (!timestamp) return 'Date not available';
  return new Date(timestamp.seconds * 1000).toLocaleString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function CompletedOrders() {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchCompletedOrders = async () => {
    try {
      setLoading(true);
      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef,
        where('status', '==', 'completed'),
        orderBy('updatedAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const completedOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];

      console.log('Completed orders:', completedOrders); // Debug log
      setOrders(completedOrders);
      setError(null);

    } catch (error) {
      console.error('Fetch error:', error);
      setError('Failed to load completed orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletedOrders();
  }, []);

  const handleDelete = (order: Order) => {
    setSelectedOrder(order);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedOrder || !currentUser) return;

    try {
      setLoading(true);
      const orderRef = doc(db, 'orders', selectedOrder.id);

      // Delete the order document
      await deleteDoc(orderRef);

      // Update local state
      setOrders(prevOrders => prevOrders.filter(order => order.id !== selectedOrder.id));
      setDeleteDialogOpen(false);

      // Show success message
      setError('Order deleted successfully');
      setTimeout(() => setError(null), 3000);

    } catch (error) {
      console.error('Delete error:', error);
      setError('Failed to delete order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Completed Orders
      </Typography>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" m={4}>
          <Typography>Loading...</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {orders.map((order) => (
            <Card 
              key={order.id}
              sx={{ 
                width: 300,
                backgroundColor: '#f8f9fa',
                '&:hover': { boxShadow: 3 } 
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Order #{order.orderId}
                  </Typography>
                  <IconButton 
                    size="small"
                    onClick={() => handleDelete(order)}
                    sx={{ mt: -1, mr: -1 }}
                  >
                    <DeleteIcon fontSize="small" color="error" />
                  </IconButton>
                </Box>

                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocalShippingIcon fontSize="small" color="primary" />
                  <Typography variant="body2">
                    Shipped: {formatDate(order.shippingDetails?.shippedAt)}
                  </Typography>
                </Box>

                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarTodayIcon fontSize="small" color="primary" />
                  <Typography variant="body2">
                    Expected: {formatDate(order.shippingDetails?.expectedDeliveryDate)}
                  </Typography>
                </Box>

                <Box sx={{ mt: 1 }}>
                  <Chip 
                    label={`₹${order.payment.total}`}
                    size="small"
                    color="primary"
                    sx={{ mt: 1 }}
                  />
                </Box>
              </CardContent>
            </Card>
          ))}

          {orders.length === 0 && (
            <Typography color="text.secondary" align="center" sx={{ mt: 4, width: '100%' }}>
              No completed orders found
            </Typography>
          )}
        </Box>
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Order</DialogTitle>
        <DialogContent>
          Are you sure you want to delete order #{selectedOrder?.orderId}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}