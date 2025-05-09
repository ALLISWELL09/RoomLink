import { useState, useEffect, useCallback } from 'react';
import { Container, Table, Button, Badge, Modal, Form, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './BookingsList.css';

const BookingsList = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loadingBookingDetails, setLoadingBookingDetails] = useState(false);
  // Stats state removed as it's no longer needed

  // Function to get auth token
  const getAuthToken = () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      console.warn('No admin token found in localStorage');
      return null;
    }
    return token;
  };

  // Function to fetch bookings data
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const token = getAuthToken();

      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        navigate('/admin/login');
        return;
      }

      // Fetch bookings
      console.log('Fetching bookings with token:', token);
      console.log('DEBUG: Making API request to http://localhost:4000/api/admin/booking');

      let response;
      try {
        response = await axios.get('http://localhost:4000/api/admin/booking', {
          headers: {
            Authorization: `Bearer ${token}`
          },
          withCredentials: true
        });

        console.log('DEBUG: API response received:', response);
        console.log('DEBUG: Response status:', response.status);
        console.log('DEBUG: Response headers:', response.headers);
        console.log('DEBUG: Response data:', response.data);

        if (!response.data) {
          console.error('DEBUG: No data received in response');
          setError('No data received from the server. Please try again later.');
          setLoading(false);
          return;
        }

        if (!response.data.bookings) {
          console.error('DEBUG: No bookings array in response data:', response.data);
          setError('No bookings data received from the server. Please try again later.');
          setLoading(false);
          return;
        }

        // Log each booking for debugging
        console.log('DEBUG: All bookings data:', response.data.bookings);
        console.log('DEBUG: Number of bookings:', response.data.bookings.length);

        // Log detailed information about each booking
        response.data.bookings.forEach((booking, index) => {
          console.log(`DEBUG: Booking ${index + 1}:`, {
            id: booking._id,
            userId: booking.userId ? (typeof booking.userId === 'object' ? booking.userId._id : booking.userId) : 'N/A',
            userName: booking.userId?.name || 'N/A',
            roomId: booking.roomId ? (typeof booking.roomId === 'object' ? booking.roomId._id : booking.roomId) : 'N/A',
            roomTitle: booking.roomId?.title || 'N/A',
            amount: booking.amount || 0,
            duration: booking.duration || 1,
            status: booking.status || 'Unknown',
            paymentStatus: booking.paymentStatus || 'Unknown',
            paymentId: booking.paymentId || 'N/A',
            createdAt: booking.createdAt || 'N/A'
          });
        });

        // Update bookings state with data from API
        setBookings(response.data.bookings);
      } catch (apiError) {
        console.error('DEBUG: API request error:', apiError);
        console.error('DEBUG: Error response:', apiError.response);
        setError(`Error fetching bookings: ${apiError.message}`);
        return; // Exit the function to prevent further processing
      }

      // Stats calculation removed as it's no longer needed
      setError(null);
    } catch (err) {
      console.error('DEBUG: Error in outer try-catch:', err);

      let errorMessage = 'Failed to load bookings data. Please try again later.';
      if (err.response) {
        console.error('DEBUG: Error response data:', err.response.data);
        console.error('DEBUG: Error response status:', err.response.status);
        errorMessage = `Server error: ${err.response.status}. ${err.response.data.message || ''}`;

        // If unauthorized, redirect to login
        if (err.response.status === 401) {
          localStorage.removeItem('adminToken'); // Clear invalid token
          navigate('/admin/login');
        }
      } else if (err.request) {
        console.error('DEBUG: Error request:', err.request);
        errorMessage = 'No response received from server. Please check your connection.';
      } else {
        console.error('DEBUG: Error message:', err.message);
        errorMessage = `Error: ${err.message}`;
      }

      setError(errorMessage);
    } finally {
      console.log('DEBUG: Fetch bookings completed');
      setLoading(false);
    }
  }, [navigate]);

  // Fetch bookings when component mounts
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleViewDetails = (booking) => {
    console.log('Viewing booking details (simplified):', booking);

    // Create a clean copy of the booking data with default values for missing fields
    const cleanedBooking = {
      _id: booking._id || 'Unknown ID',
      userId: booking.userId || { name: 'Unknown User', email: 'N/A' },
      roomId: booking.roomId || { title: 'Unknown Room', location: 'N/A', price: 0, gender: 'N/A' },
      amount: booking.amount || 0,
      duration: booking.duration || 1,
      status: booking.status || 'Unknown',
      paymentId: booking.paymentId || 'N/A',
      createdAt: booking.createdAt || new Date().toISOString()
    };

    // Set the cleaned booking data
    setSelectedBooking(cleanedBooking);
    setShowModal(true);

    // Log the booking data for debugging
    console.log('Selected booking data (cleaned):', cleanedBooking);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
  };

  const handleRefresh = () => {
    fetchBookings();
  };

  // Status badge function removed as per requirement

  const getPaymentStatusBadge = (status) => {
    // Convert to lowercase for case-insensitive comparison
    const statusLower = status ? status.toLowerCase() : '';

    switch (statusLower) {
      case 'paid':
      case 'success':
        return <Badge bg="success">💰 Paid</Badge>;
      case 'partial':
        return <Badge bg="warning">💸 Partial</Badge>;
      case 'unpaid':
      case 'pending':
        return <Badge bg="danger">🚫 Unpaid</Badge>;
      case 'refunded':
      case 'failed':
        return <Badge bg="info">↩️ Refunded/Failed</Badge>;
      default:
        return <Badge bg="secondary">{status || 'Unknown'}</Badge>;
    }
  };

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="animate__animated animate__fadeInLeft">📅 Bookings Management</h2>
        <div>
          <Button
            variant="outline-danger"
            className="rounded-pill shadow-sm animate__animated animate__fadeInRight me-2"
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Loading...
              </>
            ) : (
              <>
                <span className="me-1">🔄</span> Refresh
              </>
            )}
          </Button>
          <Button
            variant="outline-info"
            className="rounded-pill shadow-sm"
            onClick={() => window.location.reload()}
          >
            <span className="me-1">🔄</span> Hard Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          <strong>Error:</strong> {error}
        </Alert>
      )}

      {/* Removed bookings count indicator */}

      <div className="bookings-table-container">
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="danger" />
            <p className="mt-3">Loading bookings data...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-muted">No bookings found</p>
          </div>
        ) : (
          <Table striped hover responsive className="bookings-table">
            <thead className="bg-light">
              <tr>
                <th>Order ID</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking, index) => (
                <tr key={booking._id || index} onClick={() => handleViewDetails(booking)} style={{ cursor: 'pointer' }}>
                  <td>
                    <div className="order-id-cell">
                      <span className="order-id-short">#{booking._id?.substring(0, 8) || 'N/A'}</span>
                      <div className="order-date-small text-muted small">
                        {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="price-info">
                      <div className="price-amount">₹{booking.amount || booking.totalAmount || 0}</div>
                      {booking.duration && (
                        <div className="price-duration text-muted small">
                          {booking.duration} {booking.duration === 1 ? 'month' : 'months'}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(booking);
                      }}
                    >
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>

      {/* Booking Details Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>Order #{selectedBooking?._id?.substring(0, 8) || 'Details'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBooking ? (
            <div className="booking-details">
              {/* Order ID Section */}
              <div className="order-id-section mb-4 p-3 bg-light rounded text-center">
                <h6 className="mb-2">Order ID</h6>
                <div className="order-id fw-bold">{selectedBooking._id}</div>
                <div className="order-date small text-muted mt-1">
                  {selectedBooking.createdAt ? new Date(selectedBooking.createdAt).toLocaleString() : 'N/A'}
                </div>
              </div>

              {/* Room Details Section */}
              <div className="mb-4">
                <div className="room-details-header d-flex justify-content-between align-items-center">
                  <h5 className="text-danger mb-3">{selectedBooking.roomId?.title || 'Room Details'}</h5>
                  {selectedBooking.roomId?.gender && (
                    <span className="badge bg-light text-dark border">
                      {selectedBooking.roomId.gender}
                    </span>
                  )}
                </div>

                <div className="room-details-card p-3 bg-light rounded mb-3">
                  <Row>
                    <Col md={6}>
                      <p><strong>Location:</strong> {selectedBooking.roomId?.location || 'N/A'}</p>
                      <p><strong>Price:</strong> ₹{selectedBooking.roomId?.price || 0} per month</p>
                      {selectedBooking.roomId?.available !== undefined && (
                        <p><strong>Available:</strong> {selectedBooking.roomId.available ? 'Yes' : 'No'}</p>
                      )}
                    </Col>
                    <Col md={6}>
                      {selectedBooking.roomId?.amenities && (
                        <p><strong>Amenities:</strong> {selectedBooking.roomId.amenities}</p>
                      )}
                      {selectedBooking.roomId?.rating !== undefined && (
                        <p><strong>Rating:</strong> {selectedBooking.roomId.rating} / 5</p>
                      )}
                    </Col>
                  </Row>
                </div>
              </div>

              <div className="mb-4">
                <h6 className="border-bottom pb-2 mb-3">Order Information</h6>

                {/* Price Information */}
                <div className="price-info-card p-3 bg-light rounded mb-3 text-center">
                  <div className="price-label mb-1">Total Price</div>
                  <div className="price-value">₹{selectedBooking.amount || selectedBooking.totalAmount || 0}</div>
                  <div className="price-details mt-1">
                    <span className="duration-badge bg-secondary text-white px-2 py-1 rounded-pill small">
                      {selectedBooking.duration || 'N/A'} {selectedBooking.duration === 1 ? 'month' : 'months'}
                    </span>
                  </div>
                </div>

                <Row>
                  <Col md={6}>
                    <p><strong>Payment ID:</strong> {
                      typeof selectedBooking.paymentId === 'object'
                        ? (selectedBooking.paymentId._id || selectedBooking.paymentId.paymentId || 'N/A')
                        : (selectedBooking.paymentId || 'N/A')
                    }</p>
                  </Col>
                  <Col md={6}>
                    <p><strong>Payment Status:</strong> {selectedBooking.paymentStatus || 'N/A'}</p>
                  </Col>
                </Row>
              </div>

              <div className="mb-4">
                <h6 className="border-bottom pb-2 mb-3">Guest Details</h6>
                <Row>
                  <Col md={6}>
                    <p><strong>Name:</strong> {selectedBooking.userId?.name || 'N/A'}</p>
                    <p><strong>Email:</strong> {selectedBooking.userId?.email || 'N/A'}</p>
                  </Col>
                  <Col md={6}>
                    {selectedBooking.userId?.mobile_no && (
                      <p><strong>Mobile:</strong> {selectedBooking.userId.mobile_no}</p>
                    )}
                  </Col>
                </Row>
              </div>

              {/* Payment information moved to booking information section */}
            </div>
          ) : (
            <div className="text-center py-3">
              <p className="text-muted">No booking details available</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default BookingsList;




