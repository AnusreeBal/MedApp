import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';

export default function Register() {
  const [formData, setFormData] = useState({
    pharmacyName: '',
    licenseNumber: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Please login first');
      }

      // Get existing user data
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        throw new Error('User profile not found');
      }

      const userData = userDoc.data();

      // Update user document to add seller role
      await updateDoc(doc(db, 'users', user.uid), {
        roles: [...(userData.roles || ['user']), 'seller'],
        updatedAt: new Date()
      });

      // Create seller document
      await setDoc(doc(db, 'sellers', user.uid), {
        userId: user.uid,
        email: user.email,
        name: userData.name,
        pharmacyName: formData.pharmacyName,
        licenseNumber: formData.licenseNumber,
        address: formData.address,
        status: 'pending',
        createdAt: new Date()
      });

      navigate('/dashboard');
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography variant="h5" component="h1" gutterBottom textAlign="center">
          Register as Seller
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            required
            label="Pharmacy Name"
            name="pharmacyName"
            value={formData.pharmacyName}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              pharmacyName: e.target.value
            }))}
            margin="normal"
          />

          <TextField
            fullWidth
            required
            label="License Number"
            name="licenseNumber"
            value={formData.licenseNumber}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              licenseNumber: e.target.value
            }))}
            margin="normal"
          />

          <TextField
            fullWidth
            required
            label="Address"
            name="address"
            value={formData.address}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              address: e.target.value
            }))}
            margin="normal"
            multiline
            rows={3}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mt: 3 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Register as Seller'}
          </Button>
        </form>
      </Paper>
    </Container>
  );
}