import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Stack,
  Snackbar
} from '@mui/material';

interface MedicineForm {
  name: string;
  brand: string;
  category: string;
  price: string;
  stock: string;
  description: string;
}

export default function EditMedicine() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<MedicineForm>({
    name: '',
    brand: '',
    category: '',
    price: '',
    stock: '',
    description: ''
  });

  useEffect(() => {
    const fetchMedicine = async () => {
      if (!id) {
        navigate('/dashboard');
        return;
      }

      try {
        const medicineRef = doc(db, 'medicines', id);
        const medicineSnap = await getDoc(medicineRef);

        if (medicineSnap.exists()) {
          const data = medicineSnap.data();
          setFormData({
            name: data.name,
            brand: data.brand,
            category: data.category,
            price: data.price.toString(),
            stock: data.stock.toString(),
            description: data.description || ''
          });
        } else {
          setError('Medicine not found');
          setTimeout(() => navigate('/dashboard'), 2000);
        }
      } catch (err) {
        console.error('Error fetching medicine:', err);
        setError('Failed to fetch medicine details');
      } finally {
        setLoading(false);
      }
    };

    fetchMedicine();
  }, [id, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      setLoading(true);
      
      await updateDoc(doc(db, 'medicines', id), {
        name: formData.name,
        brand: formData.brand,
        category: formData.category,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        description: formData.description,
        updatedAt: new Date()
      });

      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      console.error('Error updating medicine:', err);
      setError('Failed to update medicine');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Edit Medicine
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              label="Brand"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              label="Price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              fullWidth
              type="number"
            />
            <TextField
              label="Stock"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              required
              fullWidth
              type="number"
            />
            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={4}
            />
            <Box sx={{ mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                sx={{ mr: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Update Medicine'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>

      <Snackbar
        open={success}
        autoHideDuration={1500}
        message="Medicine updated successfully"
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
    </Box>
  );
}