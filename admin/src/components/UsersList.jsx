import { useState, useEffect, useCallback } from 'react';
import { Container, Table, Button, Badge, Modal, Form, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UsersList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
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

  // Function to fetch users data
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const token = getAuthToken();

      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        navigate('/admin/login');
        return;
      }

      // Fetch regular users
      console.log('Fetching users with token:', token);
      const usersResponse = await axios.get('http://localhost:4000/api/admin/user', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true
      });

      console.log('Users data received:', usersResponse.data);

      if (!usersResponse.data || !usersResponse.data.users) {
        console.error('No users data received from the server');
        setError('No users data received from the server. Please try again later.');
        setLoading(false);
        return;
      }

      // Fetch owners (from separate collection)
      let ownersData = [];
      try {
        const ownersResponse = await axios.get('http://localhost:4000/api/admin/owner', {
          headers: {
            Authorization: `Bearer ${token}`
          },
          withCredentials: true
        });

        console.log('Owners data received:', ownersResponse.data);

        if (ownersResponse.data && ownersResponse.data.owners) {
          // Add a role field to each owner for consistent display
          ownersData = ownersResponse.data.owners.map(owner => ({
            ...owner,
            role: 'owner',
            active: true // Assume owners are active
          }));
        }
      } catch (ownerErr) {
        // If 404 "No owners found", that's okay - just set ownersData to empty array
        if (ownerErr.response && ownerErr.response.status === 404) {
          console.log('No owners found');
          ownersData = [];
        } else {
          // For other errors, log but don't fail the whole users list
          console.error('Error fetching owners:', ownerErr);
        }
      }

      // Combine regular users and owners
      const allUsers = [...usersResponse.data.users, ...ownersData];

      // Update users state with combined data
      setUsers(allUsers);

      // Stats calculation removed as it's no longer needed

      setError(null);
    } catch (err) {
      console.error('Error fetching users data:', err);

      let errorMessage = 'Failed to load users data. Please try again later.';
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

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  // Fetch users when component mounts
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const handleRefresh = () => {
    fetchUsers();
  };

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="animate__animated animate__fadeInLeft">👥 Users Management</h2>
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

      {/* Users Overview section removed as per requirement */}

      <Card className="shadow-sm">
        <Card.Header className="bg-danger text-white">
          <h5 className="mb-0">Users List</h5>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="danger" />
              <p className="mt-3">Loading users data...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">No users found</p>
            </div>
          ) : (
            <Table striped bordered hover responsive className="rounded-4 overflow-hidden">
              <thead className="bg-light">
                <tr>
                  <th>#</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user._id || index}>
                    <td>{index + 1}</td>
                    <td>{user.name || user.username || 'N/A'}</td>
                    <td>{user.email || 'N/A'}</td>
                    <td>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleViewDetails(user)}
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

      {/* User Details Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton className="bg-danger text-white rounded-top">
          <Modal.Title>User Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <>
              <div className="text-center mb-4">
                <div className="display-1 text-danger mb-2">👤</div>
                <h4>{selectedUser.name || selectedUser.username || 'User'}</h4>
              </div>

              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>User ID</Form.Label>
                  <Form.Control readOnly value={selectedUser._id || 'N/A'} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control readOnly value={selectedUser.name || selectedUser.username || 'N/A'} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control readOnly value={selectedUser.email || 'N/A'} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Joined Date</Form.Label>
                  <Form.Control readOnly value={selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'} />
                </Form.Group>
                {selectedUser.mobile && (
                  <Form.Group className="mb-3">
                    <Form.Label>Mobile</Form.Label>
                    <Form.Control readOnly value={selectedUser.mobile} />
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
          <Button variant="danger">
            Edit User
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UsersList;





