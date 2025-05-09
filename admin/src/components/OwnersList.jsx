import { useState, useEffect, useCallback } from 'react';
import { Container, Table, Button, Badge, Modal, Form, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const OwnersList = () => {
  const navigate = useNavigate();
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);

  // Function to get auth token
  const getAuthToken = () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      console.warn('No admin token found in localStorage');
      return null;
    }
    return token;
  };

  // Function to fetch owners data
  const fetchOwners = useCallback(async () => {
    setLoading(true);
    try {
      const token = getAuthToken();

      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        navigate('/admin/login');
        return;
      }

      // Fetch owners
      console.log('Fetching owners with token:', token);
      const response = await axios.get('http://localhost:4000/api/admin/owner', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true
      });

      console.log('Owners data received:', response.data);

      if (!response.data || !response.data.owners) {
        console.error('No owners data received from the server');
        setError('No owners data received from the server. Please try again later.');
        setLoading(false);
        return;
      }

      // Update owners state with data from API
      console.log('Owner data structure:', JSON.stringify(response.data.owners[0], null, 2));

      // Process owners data to add roomCount property
      const processedOwners = await Promise.all(response.data.owners.map(async (owner) => {
        try {
          // Fetch rooms for this owner
          const roomsResponse = await axios.get(`http://localhost:4000/api/admin/room`, {
            headers: {
              Authorization: `Bearer ${token}`
            },
            withCredentials: true
          });

          // Filter rooms by creatorId matching the owner's ID
          const ownerRooms = roomsResponse.data.rooms.filter(
            room => room.creatorId && room.creatorId.toString() === owner._id.toString()
          );

          return {
            ...owner,
            roomCount: ownerRooms.length
          };
        } catch (error) {
          console.error(`Error fetching rooms for owner ${owner._id}:`, error);
          return {
            ...owner,
            roomCount: 0
          };
        }
      }));

      setOwners(processedOwners);
      setError(null);
    } catch (err) {
      console.error('Error fetching owners data:', err);

      let errorMessage = 'Failed to load owners data. Please try again later.';
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

  // Fetch owners when component mounts
  useEffect(() => {
    fetchOwners();
  }, [fetchOwners]);

  const handleViewDetails = (owner) => {
    setSelectedOwner(owner);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOwner(null);
  };

  const handleRefresh = () => {
    fetchOwners();
  };

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="animate__animated animate__fadeInLeft">👨‍💼 Owners Management</h2>
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

      <Card className="shadow-sm">
        <Card.Header className="bg-danger text-white">
          <h5 className="mb-0">Owners List</h5>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="danger" />
              <p className="mt-3">Loading owners data...</p>
            </div>
          ) : owners.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">No owners found</p>
            </div>
          ) : (
            <Table striped bordered hover responsive className="rounded-4 overflow-hidden">
              <thead className="bg-light">
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Properties</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {owners.map((owner, index) => (
                  <tr key={owner._id || index}>
                    <td>{index + 1}</td>
                    <td>{owner.name || owner.username || 'N/A'}</td>
                    <td>{owner.email || 'N/A'}</td>
                    <td>
                      <Badge bg="info" pill>
                        {owner.roomCount || 0}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleViewDetails(owner)}
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

      {/* Owner Details Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton className="bg-danger text-white rounded-top">
          <Modal.Title>Owner Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOwner && (
            <>
              <div className="text-center mb-4">
                <div className="display-1 text-danger mb-2">👨‍💼</div>
                <h4>{selectedOwner.name || selectedOwner.username || 'Owner'}</h4>
              </div>

              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Owner ID</Form.Label>
                      <Form.Control readOnly value={selectedOwner._id || 'N/A'} />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Name</Form.Label>
                      <Form.Control readOnly value={selectedOwner.name || selectedOwner.username || 'N/A'} />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control readOnly value={selectedOwner.email || 'N/A'} />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Properties</Form.Label>
                  <div className="d-flex align-items-center">
                    <Badge bg="danger" className="p-2 fs-6">
                      {selectedOwner.roomCount || 0}
                    </Badge>
                    <span className="ms-2 text-muted">
                      {selectedOwner.roomCount === 1 ? 'property' : 'properties'} listed
                    </span>
                  </div>
                </Form.Group>

                {selectedOwner.createdAt && (
                  <Form.Group className="mb-3">
                    <Form.Label>Joined At</Form.Label>
                    <Form.Control readOnly value={new Date(selectedOwner.createdAt).toLocaleString()} />
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
    </Container>
  );
};

export default OwnersList;
