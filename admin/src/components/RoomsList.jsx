import { useState, useEffect, useCallback } from 'react';
import { Container, Table, Button, Badge, Modal, Form, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RoomsList = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
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

  // Function to fetch rooms data
  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const token = getAuthToken();

      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        navigate('/admin/login');
        return;
      }

      // Fetch rooms
      console.log('Fetching rooms with token:', token);
      const response = await axios.get('http://localhost:4000/api/admin/room', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true
      });

      console.log('Rooms data received:', response.data);

      if (!response.data || !response.data.rooms) {
        console.error('No rooms data received from the server');
        setError('No rooms data received from the server. Please try again later.');
        setLoading(false);
        return;
      }

      // Update rooms state with data from API
      setRooms(response.data.rooms);

      // Stats calculation removed as it's no longer needed

      setError(null);
    } catch (err) {
      console.error('Error fetching rooms data:', err);

      let errorMessage = 'Failed to load rooms data. Please try again later.';
      if (err.response) {
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
        errorMessage = `Server error: ${err.response.status}. ${err.response.data.message || ''}`;

        // If unauthorized, redirect to login
        if (err.response.status === 401) {
          localStorage.removeItem('adminToken'); // Clear invalid token
          navigate('/admin/login');
        }
      } else if (err.request) {
        console.error('Error request:', err.request);
        errorMessage = 'No response received from server. Please check your connection.';
      } else {
        console.error('Error message:', err.message);
        errorMessage = `Error: ${err.message}`;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Fetch rooms when component mounts
  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleViewDetails = (room) => {
    console.log('View Details clicked for room:', room);
    setSelectedRoom(room);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRoom(null);
  };

  const handleRefresh = () => {
    fetchRooms();
  };

  // This function is only used in the Room Details modal
  const getStatusBadge = (status) => {
    // If status is undefined, determine it from the available property
    if (status === undefined && selectedRoom) {
      status = selectedRoom.available ? 'available' : 'occupied';
    }

    switch (status) {
      case 'available':
      case true:
        return <Badge bg="success">✅ Available</Badge>;
      case 'occupied':
      case false:
        return <Badge bg="danger">🔒 Occupied</Badge>;
      case 'maintenance':
        return <Badge bg="warning">🔧 Maintenance</Badge>;
      case 'reserved':
        return <Badge bg="info">🔖 Reserved</Badge>;
      default:
        return <Badge bg="secondary">{status || 'Unknown'}</Badge>;
    }
  };

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="animate__animated animate__fadeInLeft">🛏️ Rooms Management</h2>
        <Button
          variant="outline-danger"
          className="rounded-pill shadow-sm animate__animated animate__fadeInRight"
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
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          <strong>Error:</strong> {error}
        </Alert>
      )}

      {/* Rooms Overview section removed as per requirement */}

      <Card className="shadow-sm">
        <Card.Header className="bg-danger text-white">
          <h5 className="mb-0">Rooms List</h5>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="danger" />
              <p className="mt-3">Loading rooms data...</p>
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">No rooms found</p>
            </div>
          ) : (
            <Table striped bordered hover responsive className="rounded-4 overflow-hidden">
              <thead className="bg-light">
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Location</th>
                  <th>Gender</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room, index) => (
                  <tr key={room._id || index}>
                    <td>{index + 1}</td>
                    <td>{room.title || 'N/A'}</td>
                    <td>{room.location || 'N/A'}</td>
                    <td>{room.gender || 'Any'}</td>
                    <td>₹{room.price || 0}</td>
                    <td>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleViewDetails(room)}
                        className="shadow-sm rounded-pill"
                      >
                        <span className="me-1">👁️</span> View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Room Details Modal */}
      {showModal && (
        <Modal show={true} onHide={handleCloseModal} centered size="lg">
          <Modal.Header closeButton className="bg-danger text-white rounded-top">
            <Modal.Title>Room Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {console.log('Modal rendering with selectedRoom:', selectedRoom)}
            {selectedRoom && (
            <>
              <Row className="mb-4">
                <Col md={12}>
                  <Card>
                    <Card.Header className="bg-danger text-white">
                      {selectedRoom.title || 'Room Details'}
                    </Card.Header>
                    <Card.Body>
                      <Card.Text>{selectedRoom.description || 'No description available'}</Card.Text>
                      <div className="d-flex justify-content-between">
                        <div>
                          <strong>Status:</strong> {getStatusBadge(selectedRoom.status !== undefined ? selectedRoom.status : (selectedRoom.available ? 'available' : 'occupied'))}
                        </div>
                        <div>
                          <strong>Price:</strong> ₹{selectedRoom.price || 0}
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Room ID</Form.Label>
                      <Form.Control readOnly value={selectedRoom._id || 'N/A'} />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Title</Form.Label>
                      <Form.Control readOnly value={selectedRoom.title || 'N/A'} />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Location</Form.Label>
                      <Form.Control readOnly value={selectedRoom.location || 'N/A'} />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Gender</Form.Label>
                      <Form.Control readOnly value={selectedRoom.gender || 'Any'} />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Price</Form.Label>
                      <Form.Control readOnly value={`₹${selectedRoom.price || 0}`} />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Status</Form.Label>
                      <Form.Control
                        readOnly
                        value={
                          selectedRoom.status !== undefined
                            ? selectedRoom.status
                            : (selectedRoom.available ? 'Available' : 'Occupied')
                        }
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {selectedRoom.amenities && (
                  <Form.Group className="mb-3">
                    <Form.Label>Amenities</Form.Label>
                    <div className="d-flex flex-wrap gap-2">
                      {typeof selectedRoom.amenities === 'string' ? (
                        <Badge bg="secondary" className="p-2">
                          {selectedRoom.amenities}
                        </Badge>
                      ) : (
                        Array.isArray(selectedRoom.amenities) && selectedRoom.amenities.map((amenity, index) => (
                          <Badge key={index} bg="secondary" className="p-2">
                            {amenity}
                          </Badge>
                        ))
                      )}
                    </div>
                  </Form.Group>
                )}

                {selectedRoom.createdAt && (
                  <Form.Group className="mb-3">
                    <Form.Label>Created At</Form.Label>
                    <Form.Control readOnly value={new Date(selectedRoom.createdAt).toLocaleString()} />
                  </Form.Group>
                )}

                {selectedRoom.ownerId && (
                  <Form.Group className="mb-3">
                    <Form.Label>Owner ID</Form.Label>
                    <Form.Control readOnly value={selectedRoom.ownerId} />
                  </Form.Group>
                )}
              </Form>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      )}
    </Container>
  );
};

export default RoomsList;


