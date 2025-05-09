import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import UsersList from './components/UsersList';
import BookingsList from './components/BookingsList';
import RoomsList from './components/RoomsList';
import OwnersList from './components/OwnersList';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<></>} />
          <Route path="users" element={<UsersList />} />
          <Route path="bookings" element={<BookingsList />} />
          <Route path="rooms" element={<RoomsList />} />
          <Route path="owners" element={<OwnersList />} />
        </Route>
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;