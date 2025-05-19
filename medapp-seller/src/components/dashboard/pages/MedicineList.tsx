import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { db } from '../../../services/firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';

interface Medicine {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  description: string;
}

export default function MedicineList() {
  const { currentUser: user } = useAuth();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMedicines = async () => {
      if (!user) return;

      try {
        const q = query(
          collection(db, 'medicines'),
          where('sellerId', '==', user.uid)
        );

        const querySnapshot = await getDocs(q);
        const medicineList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Medicine));

        setMedicines(medicineList);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicines();
  }, [user]);

  const handleDelete = async (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedMedicine) return;

    try {
      await deleteDoc(doc(db, 'medicines', selectedMedicine.id));
      setMedicines(medicines.filter(m => m.id !== selectedMedicine.id));
      setDeleteDialogOpen(false);
    } catch (error: any) {
      setError('Failed to delete medicine');
    }
  };

  const handleEdit = (medicine: Medicine) => {
    navigate(`/dashboard/edit/${medicine.id}`, { state: { medicine } });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        My Medicines
      </Typography>

      <TableContainer 
        component={Paper} 
        sx={{ 
          boxShadow: 3,
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Brand</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Price</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Stock</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {medicines.map((medicine) => (
              <TableRow 
                key={medicine.id}
                sx={{ 
                  '&:hover': { 
                    backgroundColor: '#fafafa' 
                  }
                }}
              >
                <TableCell sx={{ color: 'primary.main' }}>{medicine.name}</TableCell>
                <TableCell>{medicine.brand}</TableCell>
                <TableCell>{medicine.category}</TableCell>
                <TableCell>₹{medicine.price.toFixed(2)}</TableCell>
                <TableCell 
                  sx={{ 
                    color: medicine.stock <= 10 ? 'error.main' : 'inherit'
                  }}
                >
                  {medicine.stock}
                </TableCell>
                <TableCell>
                  <Tooltip title="Edit">
                    <IconButton 
                      size="small" 
                      onClick={() => handleEdit(medicine)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon color="primary" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton 
                      size="small" 
                      onClick={() => handleDelete(medicine)}
                    >
                      <DeleteIcon color="error" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {medicines.length === 0 && (
              <TableRow>
                <TableCell 
                  colSpan={6} 
                  align="center" 
                  sx={{ py: 3, color: 'text.secondary' }}
                >
                  No medicines found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete {selectedMedicine?.name}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}