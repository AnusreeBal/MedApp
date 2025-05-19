import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Container,
  Button
} from '@mui/material';
import MedicineList from './pages/MedicineList';
import AddMedicine from './pages/AddMedicine';
import PendingOrders from './pages/pending';
import CompletedOrders from './pages/completed';
import EditMedicine from './pages/EditMedicine';

export default function Dashboard() {
  const { currentUser, sellerData, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {sellerData?.pharmacyName || 'Seller Dashboard'}
          </Typography>
          <Button color="inherit" onClick={logout}>Logout</Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ mt: 2, mb: 2 }}>
        <Button 
          onClick={() => navigate('/dashboard')}
          variant="contained" 
          sx={{ mr: 1 }}
        >
          Medicines
        </Button>
        <Button 
          onClick={() => navigate('/dashboard/add')}
          variant="contained"
          sx={{ mr: 1 }}
        >
          Add Medicine
        </Button>
        <Button 
          onClick={() => navigate('/dashboard/pending')}
          variant="contained"
          sx={{ mr: 1 }}
        >
          Pending Orders
        </Button>
        <Button 
          onClick={() => navigate('/dashboard/completed')}
          variant="contained"
        >
          Completed Orders
        </Button>
      </Box>

      <Container sx={{ mt: 4 }}>
        <Routes>
          <Route path="/" element={<MedicineList />} />
          <Route path="/add" element={<AddMedicine />} />
          <Route path="/edit/:id" element={<EditMedicine />} />
          <Route path="/pending" element={<PendingOrders />} />
          <Route path="/completed" element={<CompletedOrders />} />
        </Routes>
      </Container>
    </Box>
  );
}