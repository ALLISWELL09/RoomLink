import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { Row, Col, Card, Button, Modal, Spinner, Alert } from "react-bootstrap";
import "../css/bookings.css";
import axios from "axios";

export default function Booking() {
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalRooms, setTotalRooms] = useState(0);

  // Function to get auth token
  const getAuthToken = () => {
    const token = localStorage.getItem('ownerToken');
    if (!token) {
      console.warn('No owner token found in localStorage');
      return null;
    }
    return token;
  };

  // Function to fetch booking data
  const fetchBookingData = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();

      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }

      // Fetch recent bookings
      console.log('Fetching booking data with token:', token);
      const bookingsResponse = await axios.get('http://localhost:4000/api/owner/dashboard/recent-bookings', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Booking data received:', bookingsResponse.data);

      if (bookingsResponse.data) {
        setBookings(bookingsResponse.data);
      } else {
        setBookings([]);
      }

      // Fetch room count (owner rooms)
      const roomsResponse = await axios.get('http://localhost:4000/api/room/owner-rooms', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (roomsResponse.data) {
        setTotalRooms(roomsResponse.data.length);
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching booking data:', err);
      let errorMessage = 'Failed to fetch booking data. Please try again.';

      if (err.response) {
        console.error('Error response:', err.response.data);
        errorMessage = err.response.data.error || errorMessage;
      } else if (err.message) {
        console.error('Error message:', err.message);
        errorMessage = `Error: ${err.message}`;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fetch booking data on component mount
  useEffect(() => {
    fetchBookingData();
  }, []);

  const handleShowDetails = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Helper function to format duration display
  const formatDuration = (duration) => {
    if (!duration) return 'Unknown';

    // If duration is already formatted as "X Month(s)", return it as is
    if (typeof duration === 'string' && (duration.includes('Month') || duration.includes('Months'))) {
      return duration;
    }

    // Try to extract the number if it's a string like "3"
    const durationNum = parseInt(duration);
    if (isNaN(durationNum)) return duration;

    return `${durationNum} ${durationNum === 1 ? 'Month' : 'Months'}`;
  };

  return (
    <div className="d-flex">
      <Sidebar />

      <div
        className="p-4 flex-grow-1 booking-container"
        style={{ width: "100%" }}
      >
        <div className="d-flex justify-content-between align-items-center">
          <h4>Booking</h4>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={fetchBookingData}
            disabled={loading}
          >
            <i className="fas fa-sync-alt me-1"></i>
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </div>
        <hr className="mb-4" />

        {/* Show error message if any */}
        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        {/* Loading indicator */}
        {loading ? (
          <div className="text-center my-5">
            <Spinner animation="border" role="status" variant="primary">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-2">Loading booking data...</p>
          </div>
        ) : (
          <>
            {/* Info Cards Row */}
            <Row className="mb-4 text-center">
              <Col md={4}>
                <Card className="shadow-sm info-card">
                  <Card.Body>
                    <h6>Total Bookings</h6>
                    <h3>{bookings.length}</h3>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="shadow-sm info-card">
                  <Card.Body>
                    <h6>Total Rooms</h6>
                    <h3>{totalRooms}</h3>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="shadow-sm info-card">
                  <Card.Body>
                    <h6>Pending Bookings</h6>
                    <h3>{bookings.filter((b) => b.status === "Pending").length}</h3>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Recent Bookings */}
            <Card className="shadow-sm recent-booking">
              <Card.Body style={{ maxHeight: "400px", overflowY: "auto" }}>
                <h5>Recent Bookings</h5>
                <hr className="mb-4" />

                {bookings.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted">No bookings found. Add rooms to your property to receive bookings.</p>
                  </div>
                ) : (
                  <>
                    <Row className="mb-3 px-2 fw-bold text-muted">
                      <Col md={3}>Customer</Col>
                      <Col md={3}>Room Type</Col>
                      <Col md={2}>Duration (Months)</Col>
                      <Col md={2}>Price</Col>
                      <Col md={2}>Action</Col>
                    </Row>

                    {bookings.map((booking, index) => (
                      <Row
                        key={booking.bookingId || index}
                        className="align-items-center px-2 mb-2 py-2 border-bottom"
                      >
                        <Col md={3}>{booking.customerName}</Col>
                        <Col md={3}>{booking.roomType}</Col>
                        <Col md={2}>{formatDuration(booking.duration)}</Col>
                        <Col md={2}>₹{booking.totalPrice}</Col>
                        <Col md={2}>
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => handleShowDetails(booking)}
                          >
                            Details
                          </Button>
                        </Col>
                      </Row>
                    ))}
                  </>
                )}
              </Card.Body>
            </Card>
          </>
        )}
      </div>

      {/* Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Booking Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBooking && (
            <>
              <p><strong>Booking ID:</strong> {selectedBooking.bookingId}</p>
              <p><strong>Customer:</strong> {selectedBooking.customerName}</p>
              <p><strong>Room Type:</strong> {selectedBooking.roomType}</p>
              <p><strong>Duration:</strong> {formatDuration(selectedBooking.duration)}</p>
              <p><strong>Total Price:</strong> ₹{selectedBooking.totalPrice}</p>
              <p><strong>Booking Date:</strong> {new Date(selectedBooking.createdAt).toLocaleDateString()}</p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
